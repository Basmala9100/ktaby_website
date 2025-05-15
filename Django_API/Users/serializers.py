from rest_framework import serializers
from .models import User, Book

class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    user_type = serializers.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        required=True  # Make user_type required
    )

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'created_at']

class BookSerializer(serializers.ModelSerializer):
    borrowed_by = serializers.CharField(source='borrowed_by.id', allow_null=True, required=False)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'is_borrowed', 'borrowed_by', 'description', 'category', 'image_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Validate uniqueness and borrowed_by.
        """
        print("Inside serializer",data)
        title = data.get('title')
        author = data.get('author')
        instance = self.instance

        # Validate title/author uniqueness
        if title and author:
            queryset = Book.objects.filter(title=title, author=author)
            if instance:
                queryset = queryset.exclude(id=instance.id)
            if queryset.exists():
                raise serializers.ValidationError({"title": f"A book with title '{title}' and author '{author}' already exists."})

        # Validate borrowed_by
        
        borrowed_by_id = data.get('borrowed_by', {}).get('id') if data.get('borrowed_by') else None
        if borrowed_by_id:
            try:
                User.objects.get(id=borrowed_by_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"borrowed_by": f"User with ID {borrowed_by_id} does not exist."})

        return data