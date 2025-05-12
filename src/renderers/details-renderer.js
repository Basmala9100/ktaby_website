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

    async render(container, bookId) {
        container.innerHTML = '';
        this.currentUser = UsersController.getCurrentUser();

        try {
            this.currentBook = await BooksController.findBookById(bookId);
            console.log('Book fetched:', this.currentBook); // Debug

            if (!this.currentBook) {
                this.renderNotFound(container);
                return;
            }

            const detailsContainer = Utils.createElement('div', { class: 'container' });
            const isAdmin = this.currentUser && this.currentUser.userType === 'admin'; // Fixed from userType
            detailsContainer.innerHTML = Templates.bookDetails(this.currentBook, this.currentUser, isAdmin);

            container.appendChild(detailsContainer);
            this.setupEventListeners(detailsContainer);
        } catch (error) {
            console.error('Error fetching book:', error);
            this.renderNotFound(container);
        }
    }

    setupEventListeners(container) {
        const editBtn = container.querySelector('#edit-book-btn');
        if (editBtn) {
            editBtn.addEventListener('click', this.toggleEditMode.bind(this));
        }

        const borrowBtn = container.querySelector('#borrow-btn');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', this.handleBorrowAction.bind(this));
        }
        
        const returnBtn = container.querySelector('#return-btn');
        if (returnBtn) {
            returnBtn.addEventListener('click', this.handleReturnAction.bind(this));
        }

        const saveEditBtn = container.querySelector('#save-edit-btn');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', this.saveBookChanges.bind(this));
        }
        
        const cancelEditBtn = container.querySelector('#cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', this.toggleEditMode.bind(this));
        }

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

    async handleBorrowAction() {
        if (!this.currentUser) {
            Utils.showNotification('Please log in to borrow a book', 'warning', 3000);
            this.app.navigateTo('login');
            return;
        }

        if (this.currentBook.is_borrowed) {
            Utils.showNotification('This book is currently unavailable', 'warning', 3000);
            return;
        }

        if (this.currentUser.userType !== 'user') { // Fixed from userType
            Utils.showNotification('Only users can borrow books', 'warning', 3000);
            return;
        }

        try {
            const updatedBook = await BooksController.updateBook(this.currentBook.id, {
                is_borrowed: true,
                borrowedBy: this.currentUser.id
            });
            console.log('Borrow result:', updatedBook); // Debug

            if (updatedBook.success) {
                Utils.showNotification(`You have borrowed "${this.currentBook.title}"`, 'success', 3000);
                this.currentBook = updatedBook.book;
                await this.render(document.getElementById('app-container'), this.currentBook.id);
            } else {
                Utils.showNotification(`Failed to borrow book: ${updatedBook.error}`, 'danger', 3000);
            }
        } catch (error) {
            console.error('Error borrowing book:', error);
            Utils.showNotification('Error borrowing book', 'danger', 3000);
        }
    }
    
    async handleReturnAction() {
        try {
            const updatedBook = await BooksController.updateBook(this.currentBook.id, {
                is_borrowed: false,
                borrowedBy: null
            });
            console.log('Return result:', updatedBook); // Debug

            if (updatedBook.success) {
                Utils.showNotification(`You have returned "${this.currentBook.title}"`, 'success', 3000);
                this.currentBook = updatedBook.book;
                await this.render(document.getElementById('app-container'), this.currentBook.id);
            } else {
                Utils.showNotification(`Failed to return book: ${updatedBook.error}`, 'danger', 3000);
            }
        } catch (error) {
            console.error('Error returning book:', error);
            Utils.showNotification('Error returning book', 'danger', 3000);
        }
    }

    async saveBookChanges() {
        const newTitle = document.getElementById('edit-title').value.trim();
        const newAuthor = document.getElementById('edit-author').value.trim();
        const newCategory = document.getElementById('edit-category').value.trim();
        const newDescription = document.getElementById('edit-description').value.trim();

        if (!newTitle || !newAuthor || !newCategory || !newDescription) {
            Utils.showNotification('All fields are required', 'danger', 3000);
            return;
        }

        try {
            const updatedBook = await BooksController.updateBook(this.currentBook.id, {
                title: newTitle,
                author: newAuthor,
                category: newCategory,
                description: newDescription
            });
            console.log('Update result:', updatedBook); // Debug

            if (updatedBook.success) {
                document.getElementById('book-title').textContent = newTitle;
                document.getElementById('book-author').textContent = newAuthor;
                document.getElementById('book-category').textContent = newCategory;
                document.getElementById('book-description').textContent = newDescription;

                this.toggleEditMode();
                Utils.showNotification('Book updated successfully', 'success', 3000);
                this.currentBook = updatedBook.book;
            } else {
                Utils.showNotification(`Failed to update book: ${updatedBook.error}`, 'danger', 3000);
            }
        } catch (error) {
            console.error('Error updating book:', error);
            Utils.showNotification('Error updating book', 'danger', 3000);
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