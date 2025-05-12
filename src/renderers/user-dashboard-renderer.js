// src/renderers/user-dashboard-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class UserDashboardRenderer {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
    }

    async render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Get current user
        this.currentUser = await UsersController.getCurrentUser();

        if (!this.currentUser) {
            this.app.navigateTo('login');
            return;
        }

        // Create dashboard container
        const dashboardContainer = Utils.createElement('div', { class: 'user-dashboard' });

        // Render dashboard content
        dashboardContainer.innerHTML = `
            <div class="container">
                <h1 class="mb-4">Welcome, ${this.currentUser.username}</h1>
                
                <section class="card mb-4">
                    <div class="card__header">
                        <h2 class="card__title">Your Borrowed Books</h2>
                    </div>
                    
                    <div class="card__body">
                        <div id="borrowed-books-container">
                            <!-- Borrowed books will be dynamically added here -->
                        </div>
                    </div>
                    
                    <div class="card__footer">
                        <button id="borrow-new-btn" class="btn btn--primary">Borrow New Book</button>
                    </div>
                </section>
            </div>
        `;

        // Render to container
        container.appendChild(dashboardContainer);

        // Populate borrowed books
        this.renderBorrowedBooks();

        // Setup event listeners
        this.setupEventHandlers(dashboardContainer);
    }

    async renderBorrowedBooks() {
        const borrowedBooksContainer = document.getElementById('borrowed-books-container');
        
        // Get books borrowed by current user
        const borrowedBooks = await BooksController.getBooksBorrowedByUser(this.currentUser.id);

        if (borrowedBooks.length === 0) {
            borrowedBooksContainer.innerHTML = '<p>You have not borrowed any books.</p>';
            return;
        }

        // Render borrowed books using template
        borrowedBooksContainer.innerHTML = Templates.bookList(
            borrowedBooks, 
            'borrowed',
            'You have not borrowed any books yet.'
        );
    }

    setupEventHandlers(container) {
        // Borrow new book button
        const borrowNewBtn = container.querySelector('#borrow-new-btn');
        borrowNewBtn.addEventListener('click', () => {
            this.app.navigateTo('home');
        });

        // Return book buttons using event delegation
        Utils.delegate(container, 'click', '[data-action="return"]', (event) => {
            const bookId = event.target.dataset.bookId;
            if (bookId) {
                this.handleReturnBook(bookId);
            }
        });
    }

    async handleReturnBook(bookId) {
        // Update book status
        const updatedBook = await BooksController.updateBook(bookId, {
            is_borrowed: false,
            borrowedBy: null
        });

        if (updatedBook.success) {
            // Show notification
            Utils.showNotification('Book returned successfully!', 'success', 3000);
            
            // Re-render borrowed books
            this.renderBorrowedBooks();
        } else {
            Utils.showNotification('Failed to return book', 'danger', 3000);
        }
    }
}