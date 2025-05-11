from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError
from rest_framework import generics, status
from .models import User, Book
from .serializers import SignupSerializer, LoginSerializer, UserSerializer, BookSerializer


class SignupAPIView(APIView):
    """
    POST /api/signup/
    {
        "username": "...",
        "email": "...",
        "password": "...",
        "user_type": "user"            # optional; defaults to "user"
    }
    → 201: { id, username, email, user_type, created_at }
    → 400: { error }
    """
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Call the manager.signup(...) method
        result = User.objects.signup(**serializer.validated_data)

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Serialize the newly created user for the response
        user_data = UserSerializer(result['user']).data
        return Response(user_data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    """
    POST /api/login/
    {
        "username": "...",
        "password": "..."
    }
    → 200: { id, username, email, user_type, created_at }
    → 400: { error }
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Call the manager.login(...) method
        result = User.objects.login(**serializer.validated_data)

        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Serialize the authenticated user for the response
        user_data = UserSerializer(result['user']).data
        return Response(user_data, status=status.HTTP_200_OK)
    
class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def perform_create(self, serializer):
        """Handle book creation using the custom manager."""
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

    def perform_update(self, serializer):
        """Handle book updates using the custom manager."""
        try:
            update_data = serializer.validated_data.copy()
            if 'borrowed_by' in update_data:
                update_data['borrowed_by_id'] = update_data.pop('borrowed_by').get('id') if update_data['borrowed_by'] else None
            book = Book.objects.update_book(
                book_id=self.kwargs['pk'],
                **update_data
            )
            serializer.instance = book
        except ValidationError as e:
            raise DRFValidationError({"detail": str(e)})

    def perform_destroy(self, instance):
        """Handle book deletion using the custom manager."""
        try:
            Book.objects.delete_book(book_id=instance.id)
        except ValidationError as e:
            raise DRFValidationError({"detail": str(e)})

class BookSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('query', '')
        try:
            books = Book.objects.search_books(query)
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class BooksBorrowedByUserView(APIView):
    def get(self, request, user_id):
        try:
            books = Book.objects.get_books_borrowed_by_user(user_id)
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)