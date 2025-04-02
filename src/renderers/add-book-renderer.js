// src/renderers/add-book-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class AddBookRenderer {
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

        // Create add book container
        const addBookContainer = Utils.createElement('div', { class: 'container-management' });

        // Render form content
        addBookContainer.innerHTML = `
            <h2 class="form-title">Add New Book</h2>
            
            <form id="add-book-form">
                ${Templates.formInput('title', 'Title*', 'text', true)}
                ${Templates.formInput('author', 'Author*', 'text', true)}
                ${Templates.formInput('category', 'Category*', 'text', true)}
                ${Templates.textarea('description', 'Description*', true, 'Enter book description')}
                
                <div class="form-group">
                    <label for="imageUrl" class="form-label">Image URL*</label>
                    <input type="url" id="imageUrl" class="form-control" 
                           placeholder="https://example.com/image.jpg" required>
                    <p class="form-text">Enter a valid URL for the book cover image</p>
                </div>
                
                <div class="image-preview-container">
                    <p>Image Preview:</p>
                    <div id="image-preview" class="image-preview">
                        <p class="no-preview">Enter a URL to see preview</p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn--primary" id="save-book-btn">Add Book</button>
                    <button type="button" class="btn btn--secondary" id="cancel-btn">Cancel</button>
                </div>
            </form>
        `;

        // Render to container
        container.appendChild(addBookContainer);

        // Setup event listeners
        this.setupEventListeners(addBookContainer);
    }

    setupEventListeners(container) {
        // Form submission handler
        const form = container.querySelector('#add-book-form');
        form.addEventListener('submit', this.handleAddBook.bind(this));

        // Cancel button
        const cancelBtn = container.querySelector('#cancel-btn');
        cancelBtn.addEventListener('click', () => {
            this.app.navigateTo('admin-dashboard');
        });

        // Image preview handler
        const imageUrlInput = container.querySelector('#imageUrl');
        imageUrlInput.addEventListener('input', this.handleImagePreview.bind(this));
        imageUrlInput.addEventListener('paste', this.handleImagePreview.bind(this));
    }

    handleAddBook(event) {
        event.preventDefault();

        // Get form data
        const form = event.target;
        const title = form.querySelector('#title').value.trim();
        const author = form.querySelector('#author').value.trim();
        const category = form.querySelector('#category').value.trim();
        const description = form.querySelector('#description').value.trim();
        const imageUrl = form.querySelector('#imageUrl').value.trim();

        // Validate inputs
        if (!title || !author || !category || !description || !imageUrl) {
            Utils.showNotification('All fields are required', 'danger', 3000);
            return;
        }

        // Validate image URL
        if (!Utils.isValidUrl(imageUrl)) {
            Utils.showNotification('Please enter a valid image URL', 'danger', 3000);
            return;
        }

        // Create new book
        const createResult = BooksController.createBook({
            title,
            author,
            category,
            description,
            imageUrl
        });

        if (createResult.success) {
            Utils.showNotification('Book added successfully', 'success', 3000);
            this.app.navigateTo('admin-dashboard');
        } else {
            Utils.showNotification(`Failed to add book: ${createResult.error}`, 'danger', 3000);
        }
    }

    handleImagePreview() {
        const imageUrl = document.getElementById('imageUrl').value.trim();
        const imagePreview = document.getElementById('image-preview');

        if (imageUrl && Utils.isValidUrl(imageUrl)) {
            // Display image preview
            imagePreview.innerHTML = `
                <img src="${imageUrl}" alt="Book cover preview" class="preview-image">
            `;
        } else {
            // Show placeholder
            imagePreview.innerHTML = `
                <p class="no-preview">Enter a valid URL to see preview</p>
            `;
        }
    }
}