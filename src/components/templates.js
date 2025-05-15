// src/components/templates.js - Reusable UI component templates

/**
 * Templates module providing reusable UI components
 */
const Templates = {
  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {string} type - Button type (primary, secondary, danger, etc.)
   * @param {string} id - Optional button ID
   * @param {Object} attributes - Additional attributes (data-*, classes, etc.)
   * @returns {string} Button HTML
   */
  button(text, type = "primary", id = null, attributes = {}) {
    const idAttr = id ? `id="${id}"` : "";
    const attrString = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    return `
        <button ${idAttr} class="btn btn--${type}" ${attrString}>
          ${text}
        </button>
      `;
  },

  /**
   * Create a book card
   * @param {Object} book - Book data
   * @param {string} variant - Card variant (default, admin, borrowed)
   * @param {boolean} includeActions - Whether to include action buttons
   * @returns {string} Book card HTML
   */
  bookCard(book, variant = "default", includeActions = true) {
    // Determine status class
    const statusClass = book.is_borrowed
      ? "book-card__status--borrowed"
      : "book-card__status--available";

    // Determine card class based on variant
    const cardClass =
      variant === "default" ? "book-card" : `book-card book-card--${variant}`;

    // Generate actions based on variant and whether to include them
    let actionsHtml = "";

    if (includeActions) {
      if (variant === "admin") {
        actionsHtml = `
            <div class="book-card__menu">
                <button class="book-card__menu-trigger" data-book-id="${book.id}">
                <strong>...</strong>
                </button>
                <div class="book-card__dropdown">
                <ul class="book-card__dropdown-menu">
                    <li><button class="dropdown-item" data-action="view" data-book-id="${book.id}">View Details</button></li>
                    <li><button class="dropdown-item" data-action="edit" data-book-id="${book.id}">Edit</button></li>
                    <li><button class="dropdown-item dropdown-item--danger" data-action="delete" data-book-id="${book.id}">Delete</button></li>
                </ul>
                </div>
            </div>
            `;
      } else if (variant === "borrowed") {
        actionsHtml = `
            <div class="book-card__actions">
                <button class="btn btn--danger" data-action="return" data-book-id="${book.id}">Return Book</button>
            </div>
            `;
      } else {
        actionsHtml = `
            <div class="book-card__actions">
                <a href="#" class="btn btn--primary" data-page="details" data-book-id="${book.id}">View Details</a>
            </div>
            `;
      }
    }

    // Generate status text
    const statusText = book.is_borrowed ? "Borrowed" : "Available";

    // Create a unified card structure for all variants
    if (variant === "admin") {
      return `
            <div class="${cardClass}" data-book-id="${book.id}">
            ${actionsHtml}
            <img src="${book.imageUrl}" alt="${book.title}" class="book-card__image">
            <div class="book-card__content">
                <h3 class="book-card__title">${book.title}</h3>
                <p class="book-card__author"><strong>Author:</strong> ${book.author}</p>
                <p><strong>Category:</strong> <span class="book-card__category">${book.category}</span></p>
                <p class="book-card__status ${statusClass}">${statusText}</p>
            </div>
            </div>
        `;
    } else {
      return `
            <div class="${cardClass}" data-book-id="${book.id}">
            <img src="${book.imageUrl}" alt="${book.title}" class="book-card__image">
            <div class="book-card__content">
                <h3 class="book-card__title">${book.title}</h3>
                <p class="book-card__author">By ${book.author}</p>
                <p class="book-card__category">${book.category}</p>
                <p class="book-card__status ${statusClass}">${statusText}</p>
                ${actionsHtml}
            </div>
            </div>
        `;
    }
  },

  /**
   * Create a list of book cards
   * @param {Array} books - Array of book objects
   * @param {string} variant - Card variant to use
   * @param {string} emptyMessage - Message to display when no books found
   * @returns {string} Book list HTML
   */
  bookList(books, variant = "default", emptyMessage = "No books found.") {
    if (!Array.isArray(books) || books.length === 0) {
        console.warn('bookList: No valid books array provided:', books);
        return `<p class="no-books">${emptyMessage}</p>`;
    }

    try {
        const booksHtml = books
            .map((book) => this.bookCard(book, variant))
            .join("");

        return `
            <div class="book-list ${variant === "admin" ? "book-list--admin" : ""}">
                ${booksHtml}
            </div>
        `;
    } catch (error) {
        console.error('Error generating book list:', error);
        return `<p class="no-books">Error loading books</p>`;
    }
},

  /**
   * Create a form input field
   * @param {string} id - Input ID
   * @param {string} label - Input label
   * @param {string} type - Input type (text, password, email, etc.)
   * @param {boolean} required - Whether the field is required
   * @param {string} placeholder - Input placeholder text
   * @param {string} value - Default value
   * @returns {string} Form input HTML
   */
  formInput(
    id,
    label,
    type = "text",
    required = false,
    placeholder = "",
    value = ""
  ) {
    return `
        <div class="form-group">
          <label for="${id}" class="form-label">${label}</label>
          <input 
            type="${type}" 
            id="${id}" 
            class="form-control" 
            placeholder="${placeholder}"
            value="${value}"
            ${required ? "required" : ""}
          >
        </div>
      `;
  },

  /**
   * Create an alert message
   * @param {string} message - Alert message
   * @param {string} type - Alert type (primary, success, danger, etc.)
   * @param {boolean} dismissible - Whether the alert can be dismissed
   * @returns {string} Alert HTML
   */
  alert(message, type = "info", dismissible = false) {
    let dismissibleHtml = "";

    if (dismissible) {
      dismissibleHtml = `
          <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        `;
    }

    const alertClass = dismissible
      ? `alert alert-${type} alert-dismissible`
      : `alert alert-${type}`;

    return `
        <div class="${alertClass}" role="alert">
          ${message}
          ${dismissibleHtml}
        </div>
      `;
  },

  /**
   * Create a form group with validation
   * @param {string} id - Input ID
   * @param {string} label - Input label
   * @param {string} type - Input type
   * @param {boolean} required - Whether the field is required
   * @param {string} placeholder - Input placeholder
   * @param {string} value - Input value
   * @param {string} error - Validation error message
   * @returns {string} Form group HTML with validation
   */
  formGroupWithValidation(
    id,
    label,
    type = "text",
    required = false,
    placeholder = "",
    value = "",
    error = ""
  ) {
    const inputClass = error ? "form-control is-invalid" : "form-control";
    const errorHtml = error
      ? `<div class="invalid-feedback">${error}</div>`
      : "";

    return `
        <div class="form-group">
          <label for="${id}" class="form-label">${label}</label>
          <input 
            type="${type}" 
            id="${id}" 
            class="${inputClass}" 
            placeholder="${placeholder}"
            value="${value}"
            ${required ? "required" : ""}
          >
          ${errorHtml}
        </div>
      `;
  },

  /**
   * Create a textarea field
   * @param {string} id - Textarea ID
   * @param {string} label - Textarea label
   * @param {boolean} required - Whether the field is required
   * @param {string} placeholder - Textarea placeholder
   * @param {string} value - Default value
   * @param {number} rows - Number of rows
   * @returns {string} Textarea HTML
   */
  textarea(
    id,
    label,
    required = false,
    placeholder = "",
    value = "",
    rows = 4
  ) {
    return `
        <div class="form-group">
          <label for="${id}" class="form-label">${label}</label>
          <textarea 
            id="${id}" 
            class="form-control" 
            placeholder="${placeholder}"
            rows="${rows}"
            ${required ? "required" : ""}
          >${value}</textarea>
        </div>
      `;
  },

  /**
   * Create a select dropdown
   * @param {string} id - Select ID
   * @param {string} label - Select label
   * @param {Array} options - Array of {value, text} option objects
   * @param {string} selectedValue - Currently selected value
   * @param {boolean} required - Whether the field is required
   * @returns {string} Select HTML
   */
  select(id, label, options = [], selectedValue = "", required = false) {
    const optionsHtml = options
      .map((option) => {
        const selected = option.value === selectedValue ? "selected" : "";
        return `<option value="${option.value}" ${selected}>${option.text}</option>`;
      })
      .join("");

    return `
        <div class="form-group">
          <label for="${id}" class="form-label">${label}</label>
          <select 
            id="${id}" 
            class="form-control"
            ${required ? "required" : ""}
          >
            ${optionsHtml}
          </select>
        </div>
      `;
  },

  /**
   * Create a radio button group
   * @param {string} name - Radio group name
   * @param {string} label - Group label
   * @param {Array} options - Array of {value, text} option objects
   * @param {string} selectedValue - Currently selected value
   * @returns {string} Radio group HTML
   */
  radioGroup(name, label, options = [], selectedValue = "") {
    const optionsHtml = options
      .map((option) => {
        const id = `${name}-${option.value}`;
        const checked = option.value === selectedValue ? "checked" : "";

        return `
          <div class="form-check">
            <input 
              type="radio" 
              id="${id}" 
              name="${name}" 
              value="${option.value}" 
              class="form-check-input"
              ${checked}
            >
            <label for="${id}" class="form-check-label">${option.text}</label>
          </div>
        `;
      })
      .join("");

    return `
        <div class="form-group">
          <label class="form-label">${label}</label>
          ${optionsHtml}
        </div>
      `;
  },

  /**
   * Create a notification element
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @returns {string} Notification HTML
   */
  notification(message, type = "info") {
    return `
        <div class="notification alert alert-${type}">
          ${message}
          <button type="button" class="close" data-dismiss="notification" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
  },

  /**
   * Create a navbar
   * @param {Object} user - Current user object or null
   * @returns {string} Navbar HTML
   */
  navbar(user = null) {
    let linksHtml = "";

    if (user) {
      // User is logged in
      if (user.userType === "admin") {
        // Admin navigation
        linksHtml = `
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="home">Home</a></li>
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="admin-dashboard">Dashboard</a></li>
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="add-book">Add Book</a></li>
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="logout">Logout</a></li>
          `;
      } else {
        // Regular user navigation
        linksHtml = `
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="home">Home</a></li>
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="user-dashboard">My Books</a></li>
            <li class="navbar__item"><a href="#" class="navbar__link" data-page="logout">Logout</a></li>
          `;
      }
    } else {
      // No user logged in
      linksHtml = `
          <li class="navbar__item"><a href="#" class="navbar__link" data-page="home">Home</a></li>
          <li class="navbar__item"><a href="#" class="navbar__link" data-page="signup">Sign Up</a></li>
          <li class="navbar__item"><a href="#" class="navbar__link" data-page="login">Log In</a></li>
        `;
    }

    return `
        <div class="navbar__content">
          <a href="#" class="navbar__brand" data-page="home">Ktaby</a>
          <button class="navbar__toggle" aria-label="Toggle navigation">
            <span class="navbar__toggle-icon"></span>
          </button>
          <ul class="navbar__links">
            ${linksHtml}
          </ul>
        </div>
      `;
  },

  /**
   * Create a book details view
   * @param {Object} book - Book data
   * @param {Object} user - Current user object or null
   * @param {boolean} isAdmin - Whether the current user is an admin
   * @returns {string} Book details HTML
   */
  bookDetails(book, user = null, isAdmin = false) {
    // Generate action button based on user status
    let actionButtonHtml = "";

    if (!user) {
      actionButtonHtml = `
          <p class="login-prompt">
            Please <a href="#" data-page="login">log in</a> to borrow this book.
          </p>
        `;
    } else if (user.userType === "user") {
      // Check if this user has borrowed the book
      const userBorrowed = book.is_borrowed && book.borrowed_by === user.id;

      if (userBorrowed) {
        actionButtonHtml = `
            <button id="return-btn" class="btn btn--danger">Return Book</button>
          `;
      } else {
        actionButtonHtml = `
            <button 
              id="borrow-btn" 
              class="btn btn--primary ${book.is_borrowed ? "btn--disabled" : ""}"
              ${book.is_borrowed ? "disabled" : ""}
            >
              ${book.is_borrowed ? "Book Unavailable" : "Borrow"}
            </button>
          `;
      }
    }

    // Generate admin edit button
    const adminEditButtonHtml = isAdmin
      ? `<button id="edit-book-btn" class="btn btn--warning">Edit</button>`
      : "";

    return `
        <div class="book-details-container">
          <div class="book-cover">
            <img id="book-image" src="${book.image_url}" alt="${book.title}">
          </div>
          <div class="book-info">
            <div class="book-header">
              <h2 id="book-title">${book.title}</h2>
              ${adminEditButtonHtml}
            </div>
            
            <div id="book-details-view">
              <p><strong>Author:</strong> <span id="book-author">${
                book.author
              }</span></p>
              <p><strong>Category:</strong> <span id="book-category">${
                book.category
              }</span></p>
              <p><strong>Description:</strong> <span id="book-description">${
                book.description
              }</span></p>
              
              <p>
                <strong>Status:</strong> 
                <span class="${
                  book.is_borrowed ? "status-borrowed" : "status-available"
                }">
                  ${book.is_borrowed ? "Currently Borrowed" : "Available"}
                </span>
              </p>
            </div>
            
            <div id="book-details-edit" style="display:none;">
              <label>Title:</label>
              <input type="text" id="edit-title" class="form-control" value="${
                book.title
              }">
              
              <label>Author:</label>
              <input type="text" id="edit-author" class="form-control" value="${
                book.author
              }">
              
              <label>Category:</label>
              <input type="text" id="edit-category" class="form-control" value="${
                book.category
              }">
              
              <label>Description:</label>
              <textarea id="edit-description" class="form-control">${
                book.description
              }</textarea>
              
              <div class="form-actions mt-3">
                <button id="save-edit-btn" class="btn btn--success">Save Changes</button>
                <button id="cancel-edit-btn" class="btn btn--secondary">Cancel</button>
              </div>
            </div>
            
            ${actionButtonHtml}
          </div>
        </div>
      `;
  },
};

export default Templates;
