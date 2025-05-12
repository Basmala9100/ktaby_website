from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError
from .models import User, Book
from .serializers import SignupSerializer, LoginSerializer, UserSerializer, BookSerializer

class SignupAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = User.objects.signup(**serializer.validated_data)
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        user_data = UserSerializer(result['user']).data
        return Response(user_data, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = User.objects.login(**serializer.validated_data)
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        user_data = UserSerializer(result['user']).data
        return Response(user_data, status=status.HTTP_200_OK)

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Ensure array response

    def perform_create(self, serializer):
        try:
            book = Book.objects.create_book(
                title=serializer.validated_data['title'],
                author=serializer.validated_data['author'],
                description=serializer.validated_data['description'],
                category=serializer.validated_data.get('category', ''),
                image_url=serializer.validated_data.get('image_url', ''),
                borrowed_by_id=serializer.validated_data.get('borrowed_by', {}).get('id') if serializer.validated_data.get('borrowed_by') else None
            )
            serializer.instance = book
        except ValidationError as e:
            raise DRFValidationError({"detail": str(e)})

class BookRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]

    def get_serializer(self, *args, **kwargs):
        # Treat both PUT and PATCH as partial updates
        if self.request.method in ('PUT', 'PATCH'):
            kwargs['partial'] = True
        return super().get_serializer(*args, **kwargs)

    def perform_update(self, serializer):
        try:
            update_data = serializer.validated_data.copy()
            # All mapping of borrowed_by handled in serializer.validate/update
            book = Book.objects.update_book(
                book_id=self.kwargs['pk'],
                **update_data
            )
            serializer.instance = book
        except ValidationError as e:
            raise DRFValidationError({"detail": str(e)})

    def perform_destroy(self, instance):
        try:
            Book.objects.delete_book(book_id=instance.id)
        except ValidationError as e:
            raise DRFValidationError({"detail": str(e)})

class BookSearchView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        query = request.query_params.get('query', '')
        try:
            books = Book.objects.search_books(query)
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BooksBorrowedByUserView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, user_id):
        try:
            books = Book.objects.get_books_borrowed_by_user(user_id)
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BookBatchCreateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        books_data = request.data
        if not isinstance(books_data, list):
            return Response({'error': 'Expected a list of books'}, status=status.HTTP_400_BAD_REQUEST)
        result = Book.objects.batch_create_books(books_data)
        serializer = BookSerializer(result['new_books'], many=True)
        return Response({
            'success': result['success'],
            'new_books': serializer.data,
            'errors': result['errors']
        }, status=status.HTTP_201_CREATED if result['success'] else status.HTTP_400_BAD_REQUEST)