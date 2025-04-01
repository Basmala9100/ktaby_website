// src/renderers/add-book-renderer.js
import BooksController from '../controllers/books-controller.js';
import UsersController from '../controllers/users-controller.js';

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
        const addBookContainer = document.createElement('div');
        addBookContainer.className = 'container-management';

        // Render form content
        addBookContainer.innerHTML = `
            <h2>Add New Book</h2>
            
            <form id="add-book-form">
                <div class="form-group">
                    <label for="title">Title*</label>
                    <input type="text" id="title" class="input-field" required>
                </div>
                
                <div class="form-group">
                    <label for="author">Author*</label>
                    <input type="text" id="author" class="input-field" required>
                </div>
                
                <div class="form-group">
                    <label for="category">Category*</label>
                    <input type="text" id="category" class="input-field" required>
                </div>
                
                <div class="form-group">
                    <label for="description">Description*</label>
                    <textarea id="description" class="input-field textarea" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="imageUrl">Image URL*</label>
                    <input type="url" id="imageUrl" class="input-field" 
                           placeholder="https://example.com/image.jpg" required>
                    <p class="input-help">Enter a valid URL for the book cover image</p>
                </div>
                
                <div class="image-preview-container">
                    <p>Image Preview:</p>
                    <div id="image-preview" class="image-preview">
                        <p class="no-preview">Enter a URL to see preview</p>
                    </div>
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="button" id="save-book-btn">Add Book</button>
                    <button type="button" class="button cancel-btn" id="cancel-btn">Cancel</button>
                </div>
            </form>
        `;

        // Render to container
        container.appendChild(addBookContainer);

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission handler
        const form = document.getElementById('add-book-form');
        form.addEventListener('submit', this.handleAddBook.bind(this));

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.addEventListener('click', () => {
            this.app.navigateTo('admin-dashboard');
        });

        // Image preview handler
        const imageUrlInput = document.getElementById('imageUrl');
        imageUrlInput.addEventListener('input', this.handleImagePreview.bind(this));
        imageUrlInput.addEventListener('paste', this.handleImagePreview.bind(this));
    }

    handleAddBook(event) {
        event.preventDefault();

        // Get form data
        const titleInput = document.getElementById('title');
        const authorInput = document.getElementById('author');
        const categoryInput = document.getElementById('category');
        const descriptionInput = document.getElementById('description');
        const imageUrlInput = document.getElementById('imageUrl');

        // Get trimmed values
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const category = categoryInput.value.trim();
        const description = descriptionInput.value.trim();
        const imageUrl = imageUrlInput.value.trim();

        // Validate inputs
        if (!title || !author || !category || !description || !imageUrl) {
            alert('All fields are required');
            return;
        }

        // Validate image URL
        if (!this.isValidUrl(imageUrl)) {
            alert('Please enter a valid image URL');
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
            alert('Book added successfully');
            this.app.navigateTo('admin-dashboard');
        } else {
            alert(`Failed to add book: ${createResult.error}`);
        }
    }

    handleImagePreview() {
        const imageUrl = document.getElementById('imageUrl').value.trim();
        const imagePreview = document.getElementById('image-preview');

        if (imageUrl && this.isValidUrl(imageUrl)) {
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

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
}