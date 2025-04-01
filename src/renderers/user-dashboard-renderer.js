// src/renderers/user-dashboard-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';

export default class UserDashboardRenderer {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Get current user
        this.currentUser = UsersController.getCurrentUser();

        if (!this.currentUser) {
            this.app.navigateTo('login');
            return;
        }

        // Create dashboard container
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'user-dashboard';

        // Render dashboard content
        dashboardContainer.innerHTML = `
            <h1>Welcome, ${this.currentUser.username}</h1>
            
            <section class="borrowed-books">
                <h2>Your Borrowed Books</h2>
                <div id="borrowed-books-list" class="book-list">
                    <!-- Borrowed books will be dynamically added here -->
                </div>
            </section>

            <section class="actions">
                <button id="borrow-new-btn" class="btn">Borrow New Book</button>
            </section>
        `;

        // Render to container
        container.appendChild(dashboardContainer);

        // Populate borrowed books
        this.renderBorrowedBooks();

        // Setup event listeners
        this.setupEventListeners();
    }

    renderBorrowedBooks() {
        const borrowedBooksList = document.getElementById('borrowed-books-list');
        borrowedBooksList.innerHTML = ''; // Clear existing books

        // Get books borrowed by current user
        const borrowedBooks = BooksController.getBooksBorrowedByUser(this.currentUser.id);

        if (borrowedBooks.length === 0) {
            borrowedBooksList.innerHTML = '<p>You have not borrowed any books.</p>';
            return;
        }

        // Render each borrowed book
        borrowedBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card borrowed';
            bookCard.innerHTML = `
                <div class="book-card-content">
                    <img src="${book.imageUrl}" alt="${book.title}" class="borrowed-book-image">
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p>By ${book.author}</p>
                        <button class="return-btn" data-book-id="${book.id}">Return Book</button>
                    </div>
                </div>
            `;

            borrowedBooksList.appendChild(bookCard);
        });
    }

    setupEventListeners() {
        // Borrow new book button
        const borrowNewBtn = document.getElementById('borrow-new-btn');
        borrowNewBtn.addEventListener('click', () => {
            this.app.navigateTo('home');
        });

        // Return book buttons
        const returnButtons = document.querySelectorAll('.return-btn');
        returnButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const bookId = event.target.dataset.bookId;
                this.handleReturnBook(bookId);
            });
        });
    }

    handleReturnBook(bookId) {
        // Update book status
        const updatedBook = BooksController.updateBook(bookId, {
            isBorrowed: false,
            borrowedBy: null
        });

        if (updatedBook.success) {
            alert(`You have returned the book.`);
            // Re-render borrowed books
            this.renderBorrowedBooks();
        } else {
            alert('Failed to return book');
        }
    }
}