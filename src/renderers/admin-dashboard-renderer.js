// src/renderers/admin-dashboard-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';

export default class AdminDashboardRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Check if user is admin
        const currentUser = UsersController.getCurrentUser();
        if (!currentUser || currentUser.userType !== 'admin') {
            this.app.navigateTo('home');
            return;
        }

        // Clear previous content
        container.innerHTML = '';

        // Create dashboard container
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'admin-dashboard';

        // Render dashboard content
        dashboardContainer.innerHTML = `
            <h1>Admin Dashboard</h1>
            
            <section class="admin-controls">
                <div class="search-container admin-search">
                    <input type="text" id="admin-search-bar" class="search-bar" 
                        placeholder="Search books...">
                </div>
                <div class="actions">
                    <button id="add-book-btn" class="btn primary-btn">Add New Book</button>
                </div>
            </section>
            
            <section class="book-management">
                <h2>Book Management</h2>
                <div id="book-count" class="book-count">
                    Total Books: <span id="total-books">0</span>
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

    renderBookList(books = null) {
        const bookList = document.getElementById('book-list');
        const booksToRender = books || BooksController.getAllBooks();
        
        // Update book count
        document.getElementById('total-books').textContent = booksToRender.length;

        bookList.innerHTML = ''; // Clear existing books

        if (booksToRender.length === 0) {
            bookList.innerHTML = '<p class="no-books">No books found.</p>';
            return;
        }

        // Render each book
        booksToRender.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'admin-book-card';
            bookCard.innerHTML = `
                <div class="admin-book-thumb">
                    <img src="${book.imageUrl}" alt="${book.title}" class="admin-book-image">
                </div>
                <div class="admin-book-info">
                    <h3>${book.title}</h3>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Category:</strong> ${book.category}</p>
                    <p class="status ${book.isBorrowed ? 'unavailable' : 'available'}">
                        ${book.isBorrowed ? 'Borrowed' : 'Available'}
                    </p>
                </div>
                <div class="book-actions">
                    <button class="view-btn" data-book-id="${book.id}">View Details</button>
                    <button class="edit-btn" data-book-id="${book.id}">Edit</button>
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

        // Admin search functionality
        const searchBar = document.getElementById('admin-search-bar');
        searchBar.addEventListener('input', this.handleSearch.bind(this));

        // Setup delegation for book actions
        const bookList = document.getElementById('book-list');
        bookList.addEventListener('click', (event) => {
            const target = event.target;
            
            // Get book ID from clicked element
            const bookId = target.dataset.bookId;
            if (!bookId) return;
            
            // Handle different actions
            if (target.classList.contains('view-btn')) {
                this.app.navigateTo('details', { bookId });
            } else if (target.classList.contains('edit-btn')) {
                this.app.navigateTo('edit-book', { bookId });
            } else if (target.classList.contains('delete-btn')) {
                this.handleDeleteBook(bookId);
            }
        });
    }

    handleSearch(event) {
        const query = event.target.value.trim();
        if (query) {
            const searchResults = BooksController.searchBooks(query);
            this.renderBookList(searchResults);
        } else {
            this.renderBookList();
        }
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