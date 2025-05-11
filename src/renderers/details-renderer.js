// src/renderers/details-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class DetailsRenderer {
    constructor(app) {
        this.app = app;
        this.currentBook = null;
        this.currentUser = null;
        this.isEditMode = false;
    }

    render(container, bookId) {
        // Clear previous content
        container.innerHTML = '';

        // Get current user
        this.currentUser = UsersController.getCurrentUser();

        // Find book by ID
        this.currentBook = BooksController.findBookById(bookId);

        if (!this.currentBook) {
            this.renderNotFound(container);
            return;
        }

        // Create details container
        const detailsContainer = Utils.createElement('div', { class: 'container' });
        
        // Render book details using template
        const isAdmin = this.currentUser && this.currentUser.userType === 'admin';
        detailsContainer.innerHTML = Templates.bookDetails(this.currentBook, this.currentUser, isAdmin);

        // Render to main container
        container.appendChild(detailsContainer);

        // Setup event listeners
        this.setupEventListeners(detailsContainer);
    }

    setupEventListeners(container) {
        // Setup edit button for admin
        const editBtn = container.querySelector('#edit-book-btn');
        if (editBtn) {
            editBtn.addEventListener('click', this.toggleEditMode.bind(this));
        }

        // Setup borrow button for users
        const borrowBtn = container.querySelector('#borrow-btn');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', this.handleBorrowAction.bind(this));
        }
        
        // Setup return button for users
        const returnBtn = container.querySelector('#return-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', this.handleReturnAction.bind(this));
        }

        // Setup save edit button for admin
        const saveEditBtn = container.querySelector('#save-edit-btn');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', this.saveBookChanges.bind(this));
        }
        
        // Setup cancel edit button for admin
        const cancelEditBtn = container.querySelector('#cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', this.toggleEditMode.bind(this));
        }

        // Setup login link for non-logged in users
        Utils.delegate(container, 'click', '[data-page="login"]', (event) => {
            event.preventDefault();
            this.app.navigateTo('login');
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        const detailsView = document.getElementById('book-details-view');
        const editView = document.getElementById('book-details-edit');
        
        if (this.isEditMode) {
            detailsView.style.display = 'none';
            editView.style.display = 'block';
        } else {
            detailsView.style.display = 'block';
            editView.style.display = 'none';
        }
    }

    handleBorrowAction() {
        // Strict validation for borrowing
        if (!this.currentUser) {
            Utils.showNotification('Please log in to borrow a book', 'warning', 3000);
            this.app.navigateTo('login');
            return;
        }

        // Prevent borrowing if book is already borrowed
        if (this.currentBook.isBorrowed) {
            Utils.showNotification('This book is currently unavailable', 'warning', 3000);
            return;
        }

        // Ensure only users can borrow
        if (this.currentUser.userType !== 'user') {
            Utils.showNotification('Only users can borrow books', 'warning', 3000);
            return;
        }

        // Perform borrow action
        const updatedBook = BooksController.updateBook(this.currentBook.id, {
            isBorrowed: true,
            borrowedBy: this.currentUser.id
        });

        if (updatedBook.success) {
            // Show success message
            Utils.showNotification(`You have borrowed "${this.currentBook.title}"`, 'success', 3000);
            
            // Update current book reference
            this.currentBook = updatedBook.book;
            
            // Re-render the page to show updated buttons and status
            this.render(document.getElementById('app-container'), this.currentBook.id);
        } else {
            Utils.showNotification('Failed to borrow book', 'danger', 3000);
        }
    }
    
    handleReturnAction() {
        // Perform return action
        const updatedBook = BooksController.updateBook(this.currentBook.id, {
            isBorrowed: false,
            borrowedBy: null
        });

        if (updatedBook.success) {
            // Show success message
            Utils.showNotification(`You have returned "${this.currentBook.title}"`, 'success', 3000);
            
            // Update current book reference
            this.currentBook = updatedBook.book;
            
            // Re-render the page to show updated buttons and status
            this.render(document.getElementById('app-container'), this.currentBook.id);
        } else {
            Utils.showNotification('Failed to return book', 'danger', 3000);
        }
    }

    saveBookChanges() {
        // Collect new values
        const newTitle = document.getElementById('edit-title').value.trim();
        const newAuthor = document.getElementById('edit-author').value.trim();
        const newCategory = document.getElementById('edit-category').value.trim();
        const newDescription = document.getElementById('edit-description').value.trim();

        // Validate inputs
        if (!newTitle || !newAuthor || !newCategory || !newDescription) {
            Utils.showNotification('All fields are required', 'danger', 3000);
            return;
        }

        // Update book
        const updatedBook = BooksController.updateBook(this.currentBook.id, {
            title: newTitle,
            author: newAuthor,
            category: newCategory,
            description: newDescription
        });

        if (updatedBook.success) {
            // Update view
            document.getElementById('book-title').textContent = newTitle;
            document.getElementById('book-author').textContent = newAuthor;
            document.getElementById('book-category').textContent = newCategory;
            document.getElementById('book-description').textContent = newDescription;

            // Exit edit mode
            this.toggleEditMode();

            // Show success message
            Utils.showNotification('Book updated successfully', 'success', 3000);
            
            // Update current book reference
            this.currentBook = updatedBook.book;
        } else {
            Utils.showNotification('Failed to update book', 'danger', 3000);
        }
    }

    renderNotFound(container) {
        const notFoundContainer = Utils.createElement('div', { class: 'not-found container' });
        notFoundContainer.innerHTML = `
            <h2>Book Not Found</h2>
            <p>The book you are looking for does not exist.</p>
            <button id="home-btn" class="btn btn--primary">Go to Home</button>
        `;

        const homeBtn = notFoundContainer.querySelector('#home-btn');
        homeBtn.addEventListener('click', () => this.app.navigateTo('home'));

        container.appendChild(notFoundContainer);
    }
}