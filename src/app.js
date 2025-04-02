// src/app.js
import HomeRenderer from './renderers/home-renderer.js';
import DetailsRenderer from './renderers/details-renderer.js';
import LoginRenderer from './renderers/login-renderer.js';
import SignupRenderer from './renderers/signup-renderer.js';
import AdminDashboardRenderer from './renderers/admin-dashboard-renderer.js';
import UserDashboardRenderer from './renderers/user-dashboard-renderer.js';
import AddBookRenderer from './renderers/add-book-renderer.js';
import UsersController from './controllers/users-controller.js';
import Templates from './components/templates.js';
import Utils from './components/utils.js';

export default class App {
    constructor(container) {
        this.container = container;
        
        // Initialize renderers
        this.renderers = {
            home: new HomeRenderer(this),
            details: new DetailsRenderer(this),
            login: new LoginRenderer(this),
            signup: new SignupRenderer(this),
            'admin-dashboard': new AdminDashboardRenderer(this), 
            'user-dashboard': new UserDashboardRenderer(this),
            'add-book': new AddBookRenderer(this)
        };

        // Bind methods to preserve 'this' context when used as callbacks
        this.navigateTo = this.navigateTo.bind(this);
        this.setupNavigation = this.setupNavigation.bind(this);
        this.updateNavbar = this.updateNavbar.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    init() {
        // Setup navigation listeners
        this.setupNavigation();

        // Update navbar based on current user state
        this.updateNavbar();

        // Default to home page
        this.navigateTo('home');
    }

    setupNavigation() {
        // Add click event listeners to navbar links using delegation
        const navbar = document.getElementById('main-navbar');
        
        Utils.delegate(navbar, 'click', '[data-page]', (event) => {
            event.preventDefault();
            
            const pageName = event.target.dataset.page;
            const params = {...event.target.dataset};
            delete params.page; // Remove page from params

            // Handle logout
            if (pageName === 'logout') {
                this.handleLogout();
                return;
            }

            this.navigateTo(pageName, params);
        });
        
        // Mobile menu toggle for responsive design
        const navbarToggle = navbar.querySelector('.navbar__toggle');
        if (navbarToggle) {
            navbarToggle.addEventListener('click', () => {
                navbarToggle.classList.toggle('is-active');
                navbar.querySelector('.navbar__links').classList.toggle('is-open');
            });
        }
    }

    navigateTo(pageName, params = {}) {
        try {
            // Clear previous content
            this.container.innerHTML = '';

            // Render based on page name
            switch(pageName) {
                case 'home':
                    this.renderers.home.render(this.container);
                    break;
                case 'details':
                    if (!params.bookId) {
                        throw new Error('Book ID is required for details page');
                    }
                    this.renderers.details.render(this.container, params.bookId);
                    break;
                case 'login':
                    this.renderers.login.render(this.container);
                    break;
                case 'signup':
                    this.renderers.signup.render(this.container);
                    break;
                case 'admin-dashboard':
                    this.renderers['admin-dashboard'].render(this.container);
                    break;
                case 'user-dashboard':
                    this.renderers['user-dashboard'].render(this.container);
                    break;
                case 'add-book':
                    this.renderers['add-book'].render(this.container);
                    break;
                default:
                    this.renderNotFoundPage();
            }

            // Update navbar after navigation
            this.updateNavbar();
            
            // Update active nav link
            this.updateActiveNavLink(pageName);
            
            // Close mobile menu if open
            const navbarLinks = document.querySelector('.navbar__links');
            if (navbarLinks && navbarLinks.classList.contains('is-open')) {
                navbarLinks.classList.remove('is-open');
                document.querySelector('.navbar__toggle')?.classList.remove('is-active');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            this.renderErrorPage(error);
        }
    }

    updateNavbar() {
        const navbar = document.getElementById('main-navbar');
        
        // Get current user
        const currentUser = UsersController.getCurrentUser();
        
        // Render navbar with current user state
        navbar.innerHTML = Templates.navbar(currentUser);
        
        // Re-setup toggle functionality after navbar update
        const navbarToggle = navbar.querySelector('.navbar__toggle');
        if (navbarToggle) {
            navbarToggle.addEventListener('click', () => {
                navbarToggle.classList.toggle('is-active');
                navbar.querySelector('.navbar__links').classList.toggle('is-open');
            });
        }
    }
    
    updateActiveNavLink(pageName) {
        // Remove active class from all links
        document.querySelectorAll('.navbar__link').forEach(link => {
            link.classList.remove('navbar__link--active');
        });
        
        // Add active class to current page link
        const activeLink = document.querySelector(`.navbar__link[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('navbar__link--active');
        }
    }

    handleLogout() {
        // Perform logout
        UsersController.logout();
        
        // Show notification
        Utils.showNotification('Logged out successfully', 'success', 2000);

        // Navigate to home page
        this.navigateTo('home');
    }

    renderNotFoundPage() {
        const notFoundContainer = Utils.createElement('div', { class: 'not-found container' });
        notFoundContainer.innerHTML = `
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <button id="home-btn" class="btn btn--primary">Go to Home</button>
        `;
        
        const homeBtn = notFoundContainer.querySelector('#home-btn');
        homeBtn.addEventListener('click', () => this.navigateTo('home'));
        
        this.container.appendChild(notFoundContainer);
    }

    renderErrorPage(error) {
        const errorContainer = Utils.createElement('div', { class: 'error-page container' });
        errorContainer.innerHTML = `
            <h2>An Error Occurred</h2>
            <p>${error.message}</p>
            <button id="home-btn" class="btn btn--primary">Go to Home</button>
        `;

        const homeBtn = errorContainer.querySelector('#home-btn');
        homeBtn.addEventListener('click', () => this.navigateTo('home'));

        this.container.appendChild(errorContainer);
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const app = new App(appContainer);
    app.init();
});