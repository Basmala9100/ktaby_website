// src/app.js
import HomeRenderer from "./renderers/home-renderer.js";
import DetailsRenderer from "./renderers/details-renderer.js";
import LoginRenderer from "./renderers/login-renderer.js";
import SignupRenderer from "./renderers/signup-renderer.js";
import AdminDashboardRenderer from "./renderers/admin-dashboard-renderer.js";
import UserDashboardRenderer from "./renderers/user-dashboard-renderer.js";
import AddBookRenderer from "./renderers/add-book-renderer.js";
import UsersController from "./controllers/users-controller.js";
import Templates from "./components/templates.js";
import Utils from "./components/utils.js";
import BooksController from "./controllers/books-controller.js";
import EditBookRenderer from "./renderers/edit-book-renderer.js";

export default class App {
  constructor(container) {
    this.container = container;

    // Initialize renderers
    this.renderers = {
      home: new HomeRenderer(this),
      details: new DetailsRenderer(this),
      login: new LoginRenderer(this),
      signup: new SignupRenderer(this),
      "admin-dashboard": new AdminDashboardRenderer(this),
      "user-dashboard": new UserDashboardRenderer(this),
      "add-book": new AddBookRenderer(this),
      "edit-book": new EditBookRenderer(this),
    };

    // Bind methods to preserve 'this' context when used as callbacks
    this.navigateTo = this.navigateTo.bind(this);
    this.setupNavigation = this.setupNavigation.bind(this);
    this.updateNavbar = this.updateNavbar.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.setupHistoryNavigation = this.setupHistoryNavigation.bind(this);
    this.handleInitialUrl = this.handleInitialUrl.bind(this);
  }

  init() {
    // Setup navigation listeners
    this.setupNavigation();

    // Setup history navigation
    this.setupHistoryNavigation();

    // Update navbar based on current user state
    this.updateNavbar();
  }

  setupNavigation() {
    // Add click event listeners to navbar links using delegation
    const navbar = document.getElementById("main-navbar");

    Utils.delegate(navbar, "click", "[data-page]", (event) => {
      event.preventDefault();

      const pageName = event.target.dataset.page;
      const params = { ...event.target.dataset };
      delete params.page; // Remove page from params

      // Handle logout
      if (pageName === "logout") {
        this.handleLogout();
        return;
      }

      this.navigateTo(pageName, params);
    });

    // Mobile menu toggle for responsive design
    const navbarToggle = navbar.querySelector(".navbar__toggle");
    if (navbarToggle) {
      navbarToggle.addEventListener("click", () => {
        navbarToggle.classList.toggle("is-active");
        navbar.querySelector(".navbar__links").classList.toggle("is-open");
      });
    }
  }

  setupHistoryNavigation() {
    // Handle back/forward browser buttons
    window.addEventListener("popstate", (event) => {
      if (event.state) {
        // Navigate to the page from history state without adding a new history entry
        this.navigateTo(event.state.pageName, event.state.params, false);
      } else {
        // If no state (e.g., initial page load), default to home
        this.navigateTo("home", {}, false);
      }
    });

    // Handle initial URL on page load
    this.handleInitialUrl();
  }

  async handleInitialUrl() {
    // Parse the current URL hash and query parameters
    const hash = window.location.hash.substring(1) || "home";
    const [pageName, queryString] = hash.split("?");

    // Parse query parameters if they exist
    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Navigate to the parsed page without adding a history entry
    await this.navigateTo(pageName, params, false);
  }

  async navigateTo(pageName, params = {}, addToHistory = true) {
    try {
      // Clear previous content
      this.container.innerHTML = "";

      // Create a URL-friendly state object
      const state = {
        pageName,
        params,
      };

      // Create a URL for the history API
      let url = `#${pageName}`;
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        for (const key in params) {
          queryParams.append(key, params[key]);
        }
        url += `?${queryParams.toString()}`;
      }

      // Add to browser history if requested
      if (addToHistory) {
        window.history.pushState(state, "", url);
      }

      // Render based on page name
      switch (pageName) {
        case "home":
          await this.renderers.home.render(this.container);
          break;
        case "details":
          if (!params.bookId) {
            throw new Error("Book ID is required for details page");
          }
          await this.renderers.details.render(this.container, params.bookId);
          break;
        case "login":
          await this.renderers.login.render(this.container);
          break;
        case "signup":
          await this.renderers.signup.render(this.container);
          break;
        case "admin-dashboard":
          await this.renderers["admin-dashboard"].render(this.container);
          break;
        case "user-dashboard":
          await this.renderers["user-dashboard"].render(this.container);
          break;
        case "add-book":
          await this.renderers["add-book"].render(this.container);
          break;
        case "edit-book":
          await this.renderers["edit-book"].render(this.container, params.bookId);
          break;
        default:
          this.renderNotFoundPage();
      }

      // Update navbar after navigation
      this.updateNavbar();

      // Update active nav link
      this.updateActiveNavLink(pageName);

      // Update page title
      this.updatePageTitle(pageName, params);

      // Close mobile menu if open
      const navbarLinks = document.querySelector(".navbar__links");
      if (navbarLinks && navbarLinks.classList.contains("is-open")) {
        navbarLinks.classList.remove("is-open");
        document
          .querySelector(".navbar__toggle")
          ?.classList.remove("is-active");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      this.renderErrorPage(error);
    }
  }

  updatePageTitle(pageName, params = {}) {
    let title = "Ktaby Library";

    switch (pageName) {
      case "home":
        title = "Home - Ktaby Library";
        break;
      case "details":
        // Try to get the book title if available
        if (params.bookId) {
          const book = BooksController.findBookById(params.bookId);
          if (book) {
            title = `${book.title} - Ktaby Library`;
          } else {
            title = "Book Details - Ktaby Library";
          }
        } else {
          title = "Book Details - Ktaby Library";
        }
        break;
      case "login":
        title = "Login - Ktaby Library";
        break;
      case "signup":
        title = "Sign Up - Ktaby Library";
        break;
      case "admin-dashboard":
        title = "Admin Dashboard - Ktaby Library";
        break;
      case "user-dashboard":
        title = "My Books - Ktaby Library";
        break;
      case "add-book":
        title = "Add New Book - Ktaby Library";
        break;
      case "edit-book":
        // Try to get the book title if available
        if (params.bookId) {
          const book = BooksController.findBookById(params.bookId);
          if (book) {
            title = `${book.title} - Ktaby Library`;
          } else {
            title = "Book Details - Ktaby Library";
          }
        } else {
          title = "Book Details - Ktaby Library";
        }
        break;
      default:
        title = "Ktaby Library";
    }

    document.title = title;
  }

  updateNavbar() {
    const navbar = document.getElementById("main-navbar");

    // Get current user
    const currentUser = UsersController.getCurrentUser();

    // Render navbar with current user state
    navbar.innerHTML = Templates.navbar(currentUser);

    // Re-setup toggle functionality after navbar update
    const navbarToggle = navbar.querySelector(".navbar__toggle");
    if (navbarToggle) {
      navbarToggle.addEventListener("click", () => {
        navbarToggle.classList.toggle("is-active");
        navbar.querySelector(".navbar__links").classList.toggle("is-open");
      });
    }
  }

  updateActiveNavLink(pageName) {
    // Remove active class from all links
    document.querySelectorAll(".navbar__link").forEach((link) => {
      link.classList.remove("navbar__link--active");
    });

    // Add active class to current page link
    const activeLink = document.querySelector(
      `.navbar__link[data-page="${pageName}"]`
    );
    if (activeLink) {
      activeLink.classList.add("navbar__link--active");
    }
  }

  async handleLogout() {
    // Perform logout
    UsersController.logout();

    // Show notification
    Utils.showNotification("Logged out successfully", "success", 2000);

    // Navigate to home page
    await this.navigateTo("home");
  }

  renderNotFoundPage() {
    const notFoundContainer = Utils.createElement("div", {
      class: "not-found container",
    });
    notFoundContainer.innerHTML = `
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <button id="home-btn" class="btn btn--primary">Go to Home</button>
        `;

    const homeBtn = notFoundContainer.querySelector("#home-btn");
    homeBtn.addEventListener("click", () => this.navigateTo("home"));

    this.container.appendChild(notFoundContainer);
  }

  renderErrorPage(error) {
    const errorContainer = Utils.createElement("div", {
      class: "error-page container",
    });
    errorContainer.innerHTML = `
            <h2>An Error Occurred</h2>
            <p>${error.message}</p>
            <button id="home-btn" class="btn btn--primary">Go to Home</button>
        `;

    const homeBtn = errorContainer.querySelector("#home-btn");
    homeBtn.addEventListener("click", () => this.navigateTo("home"));

    this.container.appendChild(errorContainer);
  }

  // Helper methods for history navigation
  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }

  replaceCurrentPage(pageName, params = {}) {
    const state = { pageName, params };

    let url = `#${pageName}`;
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const key in params) {
        queryParams.append(key, params[key]);
      }
      url += `?${queryParams.toString()}`;
    }

    window.history.replaceState(state, "", url);
    this.navigateTo(pageName, params, false);
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app-container");
  const app = new App(appContainer);
  app.init();
});