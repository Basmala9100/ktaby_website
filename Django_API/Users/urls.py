from django.urls import path
from .views import (
    SignupAPIView, LoginAPIView, BookListCreateView,
    BookRetrieveUpdateDestroyView, BookSearchView,
    BooksBorrowedByUserView, BookBatchCreateView
)

urlpatterns = [
    path('signup/', SignupAPIView.as_view(), name='api-signup'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/search/', BookSearchView.as_view(), name='book-search'),
    path('books/<str:pk>/', BookRetrieveUpdateDestroyView.as_view(), name='book-detail'),
    path('books/borrowed/<str:user_id>/', BooksBorrowedByUserView.as_view(), name='books-borrowed-by-user'),
]