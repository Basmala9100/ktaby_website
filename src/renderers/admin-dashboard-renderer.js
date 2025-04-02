// src/renderers/admin-dashboard-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

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
        const dashboardContainer = Utils.createElement('div', { class: 'dashboard admin-dashboard' });

        // Render dashboard content
        dashboardContainer.innerHTML = `
            <div class="container">
                <h1 class="mb-4">Admin Dashboard</h1>
                
                <section class="card mb-4">
                    <div class="card__header">
                        <div class="row">
                            <div class="col">
                                <h2 class="card__title">Book Management</h2>
                            </div>
                            <div class="col text-right">
                                <button id="add-book-btn" class="btn btn--primary">Add New Book</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card__body">
                        <div class="search-container mb-3">
                            <input type="text" id="admin-search-bar" class="search-bar" 
                                placeholder="Search books...">
                        </div>
                        
                        <div id="book-count" class="mb-3">
                            Total Books: <span id="total-books">0</span>
                        </div>
                        
                        <div id="admin-book-list-container">
                            <!-- Books will be dynamically added here -->
                        </div>
                    </div>
                </section>
            </div>
        `;

        // Render to container
        container.appendChild(dashboardContainer);

        // Populate book list
        this.renderBookList();

        // Setup event listeners
        this.setupEventListeners(dashboardContainer);
    }

    renderBookList(books = null) {
        const bookListContainer = document.getElementById('admin-book-list-container');
        const booksToRender = books || BooksController.getAllBooks();
        
        // Update book count
        document.getElementById('total-books').textContent = booksToRender.length;
      
        // Clear existing content
        bookListContainer.innerHTML = '';
        
        if (booksToRender.length === 0) {
          bookListContainer.innerHTML = '<p class="no-books">No books found.</p>';
          return;
        }
        
        // Create a container specifically for admin book cards
        const adminBookListElement = document.createElement('div');
        adminBookListElement.className = 'admin-book-list';
        
        // Add each book card to the container
        booksToRender.forEach(book => {
          const bookCardHtml = Templates.bookCard(book, 'admin', true);
          adminBookListElement.innerHTML += bookCardHtml;
        });
        
        // Append to the main container
        bookListContainer.appendChild(adminBookListElement);
      }

    setupEventListeners(container) {
        // Add new book button
        const addBookBtn = container.querySelector('#add-book-btn');
        addBookBtn.addEventListener('click', () => {
            this.app.navigateTo('add-book');
        });

        // Admin search functionality
        const searchBar = container.querySelector('#admin-search-bar');
        const debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);
        searchBar.addEventListener('input', debouncedSearch);

        // Book action buttons using event delegation
        Utils.delegate(container, 'click', '[data-action]', (event) => {
            const action = event.target.dataset.action;
            const bookId = event.target.dataset.bookId;
            
            if (!bookId) return;
            
            switch (action) {
                case 'view':
                    this.app.navigateTo('details', { bookId });
                    break;
                case 'edit':
                    this.app.navigateTo('edit-book', { bookId });
                    break;
                case 'delete':
                    this.handleDeleteBook(bookId);
                    break;
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
                // Show notification
                Utils.showNotification('Book deleted successfully', 'success', 3000);
                
                // Re-render book list
                this.renderBookList();
            } else {
                Utils.showNotification('Failed to delete book', 'danger', 3000);
            }
        }
    }
}