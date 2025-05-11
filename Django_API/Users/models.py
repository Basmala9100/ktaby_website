import time
import uuid
from django.db import models, IntegrityError, DatabaseError
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password


def timestamp_id():
    """Generate a string ID based on current time in milliseconds."""
    return str(int(time.time() * 1000))


class UserManager(models.Manager):
    def signup(self, username, email, password, user_type='user'):

        if not username or not email or not password:
            return {'success': False, 'error': 'All fields are required'}
        if self.filter(username=username).exists():
            return {'success': False, 'error': 'Username already exists'}
        if self.filter(email=email).exists():
            return {'success': False, 'error': 'Email already exists'}
        
        try:
            user = self.create(
                id=timestamp_id(),
                username=username,
                email=email,
                password=make_password(password),
                user_type=user_type
            )
        except IntegrityError:
            return {'success': False, 'error': 'Could not create user, please try again'}
        except DatabaseError:
            return {'success': False, 'error': 'Database error occurred'} 

        return {'success': True, 'user': user}
    
    
    def login(self, username, password):
        # 1. Validate input
        if not username or not password:
            return {'success': False, 'error': 'Username and password are required'}

        # 2. Lookup user
        try:
            user = self.get(username=username)
        except self.model.DoesNotExist:
            return {'success': False, 'error': 'Invalid credentials'}

        # 3. Verify password
        if not check_password(password, user.password):
            return {'success': False, 'error': 'Invalid credentials'}

        # 4. Success
        return {'success': True, 'user': user}


class User(models.Model):
    """
    Represents an application user with a timestamp-based string ID.
    """
    id = models.CharField(
        max_length=20,
        primary_key=True,
        default=timestamp_id,
        editable=False,
        help_text="Unique string ID based on timestamp"
    )
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, help_text="Hashed password")
    objects = UserManager()

    USER_TYPE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='user'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return self.username


class Book(models.Model):
    """
    Represents a book with unique UUID, borrow status, and timestamps.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the book"
    )
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    is_borrowed = models.BooleanField(default=False)
    borrowed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        help_text="User who has borrowed the book, if any"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('title', 'author')
        ordering = ['-created_at']

    def str(self):
        return f"{self.title} by {self.author}"

