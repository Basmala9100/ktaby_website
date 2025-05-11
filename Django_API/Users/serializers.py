from rest_framework import serializers
from .models import User

class SignupSerializer(serializers.Serializer):
    username  = serializers.CharField(max_length=150)
    email     = serializers.EmailField()
    password  = serializers.CharField(min_length=8, write_only=True)
    user_type = serializers.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        default='user',
        required=False
    )

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'created_at']
        read_only_fields = ['id', 'created_at']