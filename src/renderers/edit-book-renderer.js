import BooksController from "../controllers/books-controller.js";
import Templates from "../components/templates.js";
import Utils from "../components/utils.js";

export default class EditBookRenderer {
  constructor(app) {
    this.app = app;
    this.currentBook = null;
  }

  async render(container, bookId) {
    // Clear container
    container.innerHTML = "";

    // Find book and handle not found scenario
    this.currentBook = await BooksController.findBookById(bookId);
    if (!this.currentBook) {
      this.renderNotFound(container);
      return;
    }

    // Create edit container using Templates for consistency
    const editContainer = Utils.createElement("div", {
      class: "container-management",
    });
    editContainer.innerHTML = this.createEditFormHTML();

    container.appendChild(editContainer);
    this.setupEventListeners(editContainer);
  }

  createEditFormHTML() {
    // Use Templates for form generation to maintain consistency
    return `
            <h2 class="form-title">Edit Book</h2>
            <form id="edit-book-form">
                ${Templates.formInput(
                  "title",
                  "Title*",
                  "text",
                  true,
                  "Enter book title",
                  this.currentBook.title
                )}
                ${Templates.formInput(
                  "author",
                  "Author*",
                  "text",
                  true,
                  "Enter book author",
                  this.currentBook.author
                )}
                ${Templates.formInput(
                  "category",
                  "Category*",
                  "text",
                  true,
                  "Enter book category",
                  this.currentBook.category
                )}
                ${Templates.textarea(
                  "description",
                  "Description*",
                  true,
                  "Enter book description",
                  this.currentBook.description
                )}
                
                <div class="form-group">
                    <label for="imageUrl" class="form-label">Image URL*</label>
                    <input type="url" id="imageUrl" class="form-control" 
                           value="${this.currentBook.imageUrl}"
                           placeholder="https://example.com/image.jpg" required>
                    <p class="form-text">Enter a valid URL for the book cover image</p>
                </div>
                
                <div class="image-preview-container">
                    <p>Image Preview:</p>
                    <div id="image-preview-container" class="image-preview">
                        <img src="${
                          this.currentBook.imageUrl
                        }" alt="Current Book Image" class="preview-image">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn--primary" id="save-book-btn">Save Changes</button>
                    <button type="button" class="btn btn--secondary" id="cancel-edit-btn">Cancel</button>
                </div>
            </form>
        `;
  }

  setupEventListeners(container) {
    const form = container.querySelector("#edit-book-form");
    const imageUrlInput = container.querySelector("#imageUrl");

    // Use form submission instead of button click for better UX
    form.addEventListener("submit", this.handleSaveChanges.bind(this));

    // Cancel button
    const cancelBtn = container.querySelector("#cancel-edit-btn");
    cancelBtn.addEventListener("click", this.handleCancelEdit.bind(this));

    // Image preview
    imageUrlInput.addEventListener("input", this.handleImagePreview.bind(this));
  }

  async handleSaveChanges(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Collect form values
    const formData = {
      title: document.querySelector("#title").value.trim(),
      author: document.querySelector("#author").value.trim(),
      category: document.querySelector("#category").value.trim(),
      description: document.querySelector("#description").value.trim(),
      imageUrl: document.querySelector("#imageUrl").value.trim(),
    };

    // Comprehensive validation
    const validationErrors = this.validateBookData(formData);
    if (validationErrors.length > 0) {
      Utils.showNotification(validationErrors.join(", "), "danger");
      return;
    }

    // Attempt to update book
    const updateResult = await BooksController.updateBook(
      this.currentBook.id,
      formData
    );

    if (updateResult.success) {
      Utils.showNotification("Book updated successfully", "success");
      this.app.navigateTo("admin-dashboard");
    } else {
      Utils.showNotification(
        updateResult.error || "Failed to update book",
        "danger"
      );
    }
  }

  validateBookData(data) {
    const errors = [];

    // Title validation
    if (!data.title || data.title.length < 2 || data.title.length > 100) {
      errors.push("Title must be between 2 and 100 characters");
    }

    // Author validation
    if (!data.author || data.author.length < 2 || data.author.length > 100) {
      errors.push("Author must be between 2 and 100 characters");
    }

    // Category validation
    if (
      !data.category ||
      data.category.length < 2 ||
      data.category.length > 50
    ) {
      errors.push("Category must be between 2 and 50 characters");
    }

    // Description validation
    if (
      !data.description ||
      data.description.length < 10 ||
      data.description.length > 500
    ) {
      errors.push("Description must be between 10 and 500 characters");
    }

    // Image URL validation
    if (!data.imageUrl || !Utils.isValidUrl(data.imageUrl)) {
      errors.push("Please enter a valid image URL");
    }

    return errors;
  }

  handleCancelEdit() {
    // Confirm cancellation to prevent accidental data loss
    const confirmCancel = confirm(
      "Are you sure you want to cancel? Unsaved changes will be lost."
    );
    if (confirmCancel) {
      this.app.navigateTo("admin-dashboard");
    }
  }

  handleImagePreview() {
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const imagePreviewContainer = document.querySelector(
      "#image-preview-container"
    );

    if (imageUrl && Utils.isValidUrl(imageUrl)) {
      imagePreviewContainer.innerHTML = `
                <img src="${imageUrl}" alt="Image Preview" class="preview-image">
            `;
    } else {
      imagePreviewContainer.innerHTML = `
                <p class="no-preview">Enter a valid URL to see preview</p>
            `;
    }
  }

  renderNotFound(container) {
    container.innerHTML = `
            <div class="not-found container">
                <h2>Book Not Found</h2>
                <p>The book you are trying to edit does not exist.</p>
                <button id="back-to-dashboard" class="btn btn--primary">Back to Dashboard</button>
            </div>
        `;

    const backButton = container.querySelector("#back-to-dashboard");
    backButton.addEventListener("click", () =>
      this.app.navigateTo("admin-dashboard")
    );
  }
}
