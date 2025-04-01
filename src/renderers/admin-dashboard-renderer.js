// src/renderers/admin-dashboard-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';

export default class AdminDashboardRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create dashboard container
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'admin-dashboard';

        // Render dashboard content
        dashboardContainer.innerHTML = `
            <h1>Admin Dashboard</h1>
            
            <section class="book-management">
                <h2>Book Management</h2>
                <div class="actions">
                    <button id="add-book-btn" class="btn">Add New Book</button>
                </div>
                
                <div id="book-list" class="admin-book-list">
                    <!-- Books will be dynamically added here -->
                </div>
            </section>
        `;

        // Render to container
        container.appendChild(dashboardContainer);

        // Populate book list
        this.renderBookList();

        // Setup event listeners
        this.setupEventListeners();
    }

    renderBookList() {
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = ''; // Clear existing books

        // Get all books
        const books = BooksController.getAllBooks();

        // Render each book
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'admin-book-card';
            bookCard.innerHTML = `
                <div class="admin-book-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <p>${book.category}</p>
                    <p class="status ${book.isBorrowed ? 'unavailable' : 'available'}">
                        ${book.isBorrowed ? 'Borrowed' : 'Available'}
                    </p>
                </div>
                <div class="book-actions">
                    <button class="view-btn" data-book-id="${book.id}">View Details</button>
                    <button class="delete-btn" data-book-id="${book.id}">Delete</button>
                </div>
            `;

            bookList.appendChild(bookCard);
        });
    }

    setupEventListeners() {
        // Add new book button
        const addBookBtn = document.getElementById('add-book-btn');
        addBookBtn.addEventListener('click', () => {
            this.app.navigateTo('add-book');
        });

        // View book details
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const bookId = event.target.dataset.bookId;
                this.app.navigateTo('details', { bookId });
            });
        });

        // Delete book
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const bookId = event.target.dataset.bookId;
                this.handleDeleteBook(bookId);
            });
        });
    }

    handleDeleteBook(bookId) {
        // Confirm deletion
        const confirmDelete = confirm('Are you sure you want to delete this book?');
        
        if (confirmDelete) {
            const deleteResult = BooksController.deleteBook(bookId);
            
            if (deleteResult.success) {
                alert('Book deleted successfully');
                // Re-render book list
                this.renderBookList();
            } else {
                alert('Failed to delete book');
            }
        }
    }
}