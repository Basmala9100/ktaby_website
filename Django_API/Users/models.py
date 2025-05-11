import time
import uuid
from django.db import models, IntegrityError, DatabaseError
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError

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

class BookManager(models.Manager):
    def create_books(self, _title, _author, _description, _barrowed_by):

        if self.filter(title=_title, author= _author).exists():
            return {"success":False, "error":"Book already exists"}
        book = self.model(
            title= _title,
            author=_author,
            description=_description,
            
        )


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

#----------------------------------------------------------------------------------------------------------------------#

class BookManager(models.Manager):
    def create_book(self, title, author, description, category="", image_url="", borrowed_by_id=None):
        """Create a new book with validation."""
        if self.filter(title=title, author=author).exists():
            raise ValidationError(f"A book with title '{title}' and author '{author}' already exists.")

        borrowed_by = None
        if borrowed_by_id:
            try:
                borrowed_by = User.objects.get(id=borrowed_by_id)
            except User.DoesNotExist:
                raise ValidationError(f"User with ID {borrowed_by_id} does not exist.")

        book = self.model(
            title=title,
            author=author,
            description=description,
            category=category,
            image_url=image_url,
            is_borrowed=bool(borrowed_by_id),
            borrowed_by=borrowed_by
        )
        book.full_clean()
        book.save()
        return book

    def update_book(self, book_id, **kwargs):
        """Update an existing book."""
        try:
            book = self.get(id=book_id)
        except self.model.DoesNotExist:
            raise ValidationError(f"Book with ID {book_id} does not exist.")

        if 'borrowed_by_id' in kwargs:
            borrowed_by_id = kwargs.pop('borrowed_by_id')
            if borrowed_by_id:
                try:
                    kwargs['borrowed_by'] = User.objects.get(id=borrowed_by_id)
                    kwargs['is_borrowed'] = True
                except User.DoesNotExist:
                    raise ValidationError(f"User with ID {borrowed_by_id} does not exist.")
            else:
                kwargs['borrowed_by'] = None
                kwargs['is_borrowed'] = False

        title = kwargs.get('title', book.title)
        author = kwargs.get('author', book.author)
        if ('title' in kwargs or 'author' in kwargs) and self.exclude(id=book_id).filter(title=title, author=author).exists():
            raise ValidationError(f"A book with title '{title}' and author '{author}' already exists.")

        for field, value in kwargs.items():
            if hasattr(book, field):
                setattr(book, field, value)
            else:
                raise ValidationError(f"Invalid field: {field}")

        book.full_clean()
        book.save()
        return book

    def delete_book(self, book_id):
        """Delete a book by ID."""
        try:
            book = self.get(id=book_id)
            book.delete()
            return True
        except self.model.DoesNotExist:
            raise ValidationError(f"Book with ID {book_id} does not exist.")

    def get_book(self, book_id):
        """Retrieve a book by ID."""
        try:
            return self.get(id=book_id)
        except self.model.DoesNotExist:
            raise ValidationError(f"Book with ID {book_id} does not exist.")

    def list_books(self, **filters):
        """List books with optional filters."""
        return self.filter(**filters)


    def get_books_borrowed_by_user(self, user_id):
        """Retrieve all books borrowed by a user."""
        try:
            User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValidationError(f"User with ID {user_id} does not exist.")
        return self.filter(borrowed_by__id=user_id, is_borrowed=True)
    def search_books(self, query):
        """Search books by title, author, or category (case-insensitive)."""
        if not query:
            return self.all()
        return self.filter(
            Q(title__icontains=query) |
            Q(author__icontains=query) |
            Q(category__icontains=query)
        )


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
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        to_field='id',
        help_text="User who has borrowed the book, if any"
    )
    description = models.TextField()
    category = models.CharField(max_length=255, blank=True, help_text="Book categories, e.g., Adventure | Dark fantasy")
    image_url = models.URLField(max_length=500, blank=True, help_text="URL to the book cover image")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = BookManager()

    class Meta:
        unique_together = ('title', 'author')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title', 'author']),
            models.Index(fields=['is_borrowed']),
        ]

    def __str__(self):
        return f"{self.title} by {self.author}"
