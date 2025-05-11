// src/renderers/admin-dashboard-renderer.js
import BooksController from "../controllers/books-controller.js";
import UsersController from "../controllers/users-controller.js";
import Templates from "../components/templates.js";
import Utils from "../components/utils.js";

export default class AdminDashboardRenderer {
  constructor(app) {
    this.app = app;
  }

  render(container) {
    // Check if user is admin
    const currentUser = UsersController.getCurrentUser();
    if (!currentUser || currentUser.userType !== "admin") {
      this.app.navigateTo("home");
      return;
    }

    // Clear previous content
    container.innerHTML = "";

    // Create dashboard container
    const dashboardContainer = Utils.createElement("div", {
      class: "dashboard admin-dashboard",
    });

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
    const bookListContainer = document.getElementById(
      "admin-book-list-container"
    );
    const booksToRender = books || BooksController.getAllBooks();

    // Update book count
    document.getElementById("total-books").textContent = booksToRender.length;

    // Clear existing content
    bookListContainer.innerHTML = "";

    if (booksToRender.length === 0) {
      bookListContainer.innerHTML = '<p class="no-books">No books found.</p>';
      return;
    }

    // Create a container specifically for admin book cards
    const adminBookListElement = document.createElement("div");
    adminBookListElement.className = "admin-book-list";

    // Add each book card to the container
    booksToRender.forEach((book) => {
      const bookCardHtml = Templates.bookCard(book, "admin", true);
      adminBookListElement.innerHTML += bookCardHtml;
    });

    // Append to the main container
    bookListContainer.appendChild(adminBookListElement);
  }

  setupEventListeners(container) {
    // Add new book button
    const addBookBtn = container.querySelector("#add-book-btn");
    addBookBtn.addEventListener("click", () => {
      this.app.navigateTo("add-book");
    });

    // Admin search functionality
    const searchBar = container.querySelector("#admin-search-bar");
    const debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);    
    searchBar.addEventListener("input", debouncedSearch);

    // Menu toggle delegation
    // Alternative approach with timeout
    Utils.delegate(container, 'click', '.book-card__menu-trigger', (event) => {
        const menuTrigger = event.target.closest('.book-card__menu-trigger');
        const dropdown = menuTrigger.nextElementSibling;
        const isCurrentlyOpen = dropdown.classList.contains('show');
        
        // Close all dropdowns
        document.querySelectorAll('.book-card__dropdown.show').forEach(d => {
          d.classList.remove('show');
        });
        
        // If the current dropdown wasn't open, open it after a tiny delay
        if (!isCurrentlyOpen) {
          setTimeout(() => {
            dropdown.classList.add('show');
          }, 10); // Small delay to ensure proper toggle behavior
        }
        
        event.stopPropagation();
      });

    // Book action buttons using event delegation
    Utils.delegate(container, "click", "[data-action]", (event) => {
      const action = event.target.dataset.action;
      const bookId = event.target.dataset.bookId;

      if (!bookId) return;

      switch (action) {
        case "view":
          this.app.navigateTo("details", { bookId },true);
          break;
        case "edit":
          this.app.navigateTo("edit-book", { bookId },true);
          break;
        case "delete":
          this.handleDeleteBook(bookId);
          break;
      }

      // Close dropdown after action
      const dropdown = event.target.closest(".book-card__dropdown");
      if (dropdown) {
        dropdown.classList.remove("show");
      }

      // Prevent the event from bubbling up
      event.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".book-card__menu")) {
        const openDropdowns = document.querySelectorAll(
          ".book-card__dropdown.show"
        );
        openDropdowns.forEach((dropdown) => dropdown.classList.remove("show"));
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
  setupDropdownHandlers(container) {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.closeDropdowns);

    // Dropdown toggle delegation
    Utils.delegate(container, 'click', '.book-card__menu-trigger', (event) => {
        event.stopPropagation();
        const menuTrigger = event.target.closest('.book-card__menu-trigger');
        const dropdown = menuTrigger.nextElementSibling;
        
        // Close all other dropdowns
        document.querySelectorAll('.book-card__dropdown.show')
            .forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
        
        // Toggle current dropdown
        dropdown.classList.toggle('show');
    });

    // Keyboard accessibility
    Utils.delegate(container, 'keydown', '.book-card__menu-trigger', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const dropdown = event.target.nextElementSibling;
            dropdown.classList.toggle('show');
        }
    });
}

closeDropdowns = (event) => {
    // Close dropdowns if click is outside any dropdown
    if (!event.target.closest('.book-card__menu')) {
        document.querySelectorAll('.book-card__dropdown.show')
            .forEach(dropdown => dropdown.classList.remove('show'));
    }
}
  handleDeleteBook(bookId) {
    // Confirm deletion
    const confirmDelete = confirm("Are you sure you want to delete this book?");

    if (confirmDelete) {
      const deleteResult = BooksController.deleteBook(bookId);

      if (deleteResult.success) {
        // Show notification
        Utils.showNotification("Book deleted successfully", "success", 3000);

        // Re-render book list
        this.renderBookList();
      } else {
        Utils.showNotification("Failed to delete book", "danger", 3000);
      }
    }
  }
}
