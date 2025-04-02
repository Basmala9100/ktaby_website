// src/app.js
import HomeRenderer from './renderers/home-renderer.js';
import DetailsRenderer from './renderers/details-renderer.js';
import LoginRenderer from './renderers/login-renderer.js';
import SignupRenderer from './renderers/signup-renderer.js';
import AdminDashboardRenderer from './renderers/admin-dashboard-renderer.js';
import UserDashboardRenderer from './renderers/user-dashboard-renderer.js';
import AddBookRenderer from './renderers/add-book-renderer.js';
import UsersController from './controllers/users-controller.js';

export default class App {
    constructor(container) {
        this.container = container;
        
        // Initialize renderers
        this.renderers = {
            home: new HomeRenderer(this),
            details: new DetailsRenderer(this),
            login: new LoginRenderer(this),
            signup: new SignupRenderer(this),
            //Declared as string because '-' is reservered in JS
            'admin-dashboard': new AdminDashboardRenderer(this), 
            'user-dashboard': new UserDashboardRenderer(this),
            'add-book': new AddBookRenderer(this)
        };

        // Bind methods
        // this is because these methods are used as callbacks which means that this will be lost
        // when the method is called, so we need to bind them to the current instance of the class
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
        // Add click event listeners to navbar links
        const navbar = document.getElementById('main-navbar');
        //we define a click event listener on the navbar(all of it)
        // we identify clicked event using the event's target.closest method. This reduces memory
        // usage and improves performance by not adding individual event listeners to each link
        // this is a common pattern in event delegation
        navbar.addEventListener('click', (event) => {
            // get the attribute containing which page to go to for the clicked element.
            const pageLink = event.target.closest('[data-page]');
        
            if (pageLink) { // check if the clicked element has the data-page attribute
                event.preventDefault(); // stop browser's default action
                const pageName = pageLink.dataset.page; // get the page link
                const params = Object.assign({}, pageLink.dataset);
                delete params.page; // Remove page from params

                // Handle logout
                if (pageName === 'logout') {
                    this.handleLogout();
                    return;
                }

                this.navigateTo(pageName, params);
            }
        });
    }
    // remember that binding this method to the class instance is important
    // because this method is used as a callback for the click event listener
    // and we need to make sure that this refers to the class instance when the method is called
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
        } catch (error) {
            console.error('Navigation error:', error);
            this.renderErrorPage(error);
        }
    }

    updateNavbar() {
        const navbar = document.getElementById('main-navbar');
        const navItems = navbar.querySelector('ul');
        
        // Clear existing items
        navItems.innerHTML = '';

        // Get current user (From the controller)
        const currentUser = UsersController.getCurrentUser();

        if (currentUser) {
            // User is logged in
            if (currentUser.userType === 'admin') {
                // Admin navigation
                navItems.innerHTML = `
                    <li><a href="#" data-page="home">Home</a></li>
                    <li><a href="#" data-page="admin-dashboard">Dashboard</a></li>
                    <li><a href="#" data-page="add-book">Add Book</a></li>
                    <li><a href="#" data-page="logout">Logout</a></li>
                `;
            } else {
                // Regular user navigation
                navItems.innerHTML = `
                    <li><a href="#" data-page="home">Home</a></li>
                    <li><a href="#" data-page="user-dashboard">My Books</a></li>
                    <li><a href="#" data-page="logout">Logout</a></li>
                `;
            }
        } else {
            // No user logged in
            navItems.innerHTML = `
                <li><a href="#" data-page="home">Home</a></li>
                <li><a href="#" data-page="signup">Sign Up</a></li>
                <li><a href="#" data-page="login">Log In</a></li>
            `;
        }
    }

    handleLogout() {
        // Perform logout
        UsersController.logout();

        // Navigate to home page
        this.navigateTo('home');
    }

    renderNotFoundPage() {
        const notFoundContainer = document.createElement('div');
        notFoundContainer.className = 'not-found';
        notFoundContainer.innerHTML = `
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <button id="home-btn" class="btn">Go to Home</button>
        `;
        // using querySelector to get the button element but we can also use getElementById
        const homeBtn = notFoundContainer.querySelector('#home-btn');
        //const homeBtn = notFoundContainer.getElementById('home-btn'); 
        homeBtn.addEventListener('click', () => this.navigateTo('home'));
        this.container.appendChild(notFoundContainer);
    }

    renderErrorPage(error) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-page';
        errorContainer.innerHTML = `
            <h2>An Error Occurred</h2>
            <p>${error.message}</p>
            <button id="home-btn" class="btn">Go to Home</button>
        `;

        const homeBtn = errorContainer.querySelector('#home-btn');
        homeBtn.addEventListener('click', () => this.navigateTo('home'));

        this.container.appendChild(errorContainer);
    }
}

// Initialize the app when the DOM is fully loaded
// This is done through the DOMContentLoaded event
// This event is fired when the initial HTML document has been completely loaded
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const app = new App(appContainer);
    app.init();
});