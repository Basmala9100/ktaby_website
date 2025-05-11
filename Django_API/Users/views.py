from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import SignupSerializer, LoginSerializer, UserSerializer

# Create your views here.


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