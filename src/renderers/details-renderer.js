// src/renderers/details-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';

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
        const detailsContainer = this.createDetailsContainer();

        // Render to main container
        container.appendChild(detailsContainer);

        // Setup event listeners
        this.setupEventListeners();
    }

    createDetailsContainer() {
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'book-details-container';
        
        // Base details structure
        detailsContainer.innerHTML = `
            <div class="book-cover">
                <img id="book-image" src="${this.currentBook.imageUrl}" alt="${this.currentBook.title}">
            </div>
            <div class="book-info">
                <div class="book-header">
                    <h2 id="book-title">${this.currentBook.title}</h2>
                    ${this.renderAdminEditButton()}
                </div>
                
                <div id="book-details-view">
                    <p><strong>Author:</strong> <span id="book-author">${this.currentBook.author}</span></p>
                    <p><strong>Category:</strong> <span id="book-category">${this.currentBook.category}</span></p>
                    <p><strong>Description:</strong> <span id="book-description">${this.currentBook.description}</span></p>
                    
                    ${this.renderBookStatusMessage()}
                </div>
                
                <div id="book-details-edit" style="display:none;">
                    <label>Title:</label>
                    <input type="text" id="edit-title" value="${this.currentBook.title}">
                    
                    <label>Author:</label>
                    <input type="text" id="edit-author" value="${this.currentBook.author}">
                    
                    <label>Category:</label>
                    <input type="text" id="edit-category" value="${this.currentBook.category}">
                    
                    <label>Description:</label>
                    <textarea id="edit-description">${this.currentBook.description}</textarea>
                    
                    <button id="save-edit-btn">Save Changes</button>
                </div>
                
                ${this.renderActionButton()}
            </div>
        `;

        return detailsContainer;
    }

    renderBookStatusMessage() {
        // Show book availability status and who borrowed it if applicable
        let statusMessage = this.currentBook.isBorrowed ? 'Currently Borrowed' : 'Available';
        
        return `
            <p>
                <strong>Status:</strong> 
                <span class="${this.currentBook.isBorrowed ? 'status-borrowed' : 'status-available'}">
                    ${statusMessage}
                </span>
            </p>
        `;
    }

    renderAdminEditButton() {
        // Only show edit button for logged-in admins
        if (this.currentUser && this.currentUser.userType === 'admin') {
            return `<button id="edit-book-btn" class="edit-btn">Edit</button>`;
        }
        return '';
    }

    renderActionButton() {
        // Different action based on user type and login status
        if (!this.currentUser) {
            return `
                <p class="login-prompt">
                    Please <a href="#" data-page="login" id="details-login-link">log in</a> to borrow this book.
                </p>
            `;
        }

        if (this.currentUser.userType === 'user') {
            // Check if this specific user has borrowed the book
            const userBorrowed = this.currentBook.isBorrowed && this.currentBook.borrowedBy === this.currentUser.id;
            
            if (userBorrowed) {
                return `
                    <button id="return-btn" class="btn">Return Book</button>
                `;
            } else {
                return `
                    <button 
                        id="borrow-btn" 
                        class="btn ${this.currentBook.isBorrowed ? 'borrowed' : ''}"
                        ${this.currentBook.isBorrowed ? 'disabled' : ''}
                    >
                        ${this.currentBook.isBorrowed ? 'Book Unavailable' : 'Borrow'}
                    </button>
                `;
            }
        }

        return ''; // No action button for admin in details view
    }

    setupEventListeners() {
        // Setup edit button for admin
        const editBtn = document.getElementById('edit-book-btn');
        if (editBtn) {
            editBtn.addEventListener('click', this.toggleEditMode.bind(this));
        }

        // Setup borrow button for users
        const borrowBtn = document.getElementById('borrow-btn');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', this.handleBorrowAction.bind(this));
        }
        
        // Setup return button for users
        const returnBtn = document.getElementById('return-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', this.handleReturnAction.bind(this));
        }

        // Setup save edit button for admin
        const saveEditBtn = document.getElementById('save-edit-btn');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', this.saveBookChanges.bind(this));
        }

        // Setup login link for non-logged in users
        const loginLink = document.getElementById('details-login-link');
        if (loginLink) {
            loginLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.app.navigateTo('login');
            });
        }
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
            alert('Please log in to borrow a book.');
            this.app.navigateTo('login');
            return;
        }

        // Prevent borrowing if book is already borrowed
        if (this.currentBook.isBorrowed) {
            alert('This book is currently unavailable.');
            return;
        }

        // Ensure only users can borrow
        if (this.currentUser.userType !== 'user') {
            alert('Only users can borrow books.');
            return;
        }

        // Perform borrow action
        const updatedBook = BooksController.updateBook(this.currentBook.id, {
            isBorrowed: true,
            borrowedBy: this.currentUser.id
        });

        if (updatedBook.success) {
            const newBook = updatedBook.book;
            
            // Update view
            alert(`You have borrowed "${this.currentBook.title}"`);
            
            // Update current book reference
            this.currentBook = newBook;
            
            // Re-render the page to show updated buttons and status
            this.render(document.getElementById('app-container'), this.currentBook.id);
        }
    }
    
    handleReturnAction() {
        // Perform return action
        const updatedBook = BooksController.updateBook(this.currentBook.id, {
            isBorrowed: false,
            borrowedBy: null
        });

        if (updatedBook.success) {
            alert(`You have returned "${this.currentBook.title}"`);
            
            // Update current book reference
            this.currentBook = updatedBook.book;
            
            // Re-render the page to show updated buttons and status
            this.render(document.getElementById('app-container'), this.currentBook.id);
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
            alert('All fields are required');
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

            alert('Book updated successfully');
        }
    }

    renderNotFound(container) {
        const notFoundContainer = document.createElement('div');
        notFoundContainer.className = 'not-found';
        notFoundContainer.innerHTML = `
            <h2>Book Not Found</h2>
            <p>The book you are looking for does not exist.</p>
            <button id="home-btn" class="btn">Go to Home</button>
        `;

        const homeBtn = notFoundContainer.querySelector('#home-btn');
        homeBtn.addEventListener('click', () => this.app.navigateTo('home'));

        container.appendChild(notFoundContainer);
    }
}