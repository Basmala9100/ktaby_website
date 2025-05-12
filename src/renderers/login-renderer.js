import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class LoginRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create login container
        const loginContainer = Utils.createElement('div', { class: 'form-container' });
        
        // Build login form using templates
        const formContent = `
            <h2 class="form-title">Log In</h2>
            <form id="login-form">
                ${Templates.formInput('username', 'Username', 'text', true, 'Enter your username')}
                ${Templates.formInput('password', 'Password', 'password', true, 'Enter your password')}
                
                <div class="form-actions">
                    ${Templates.button('Log In', 'primary', 'login-button', { type: 'submit' })}
                </div>
                
                <div class="mt-3 text-center">
                    <p>Don't have an account? <a href="#" data-page="signup">Sign up</a></p>
                </div>
            </form>
        `;
        
        loginContainer.innerHTML = formContent;
        
        // Append to main container
        container.appendChild(loginContainer);
        
        // Setup event handlers
        this.setupEventHandlers(loginContainer);
    }
    
    setupEventHandlers(container) {
        // Form submission
        const loginForm = container.querySelector('#login-form');
        
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleLogin(event);
        });
        
        // Signup link
        Utils.delegate(container, 'click', '[data-page="signup"]', (event) => {
            event.preventDefault();
            this.app.navigateTo('signup');
        });
    }
    
    async handleLogin(event) {
        // Get form values
        const form = event.target;
        const username = form.querySelector('#username').value.trim();
        const password = form.querySelector('#password').value;
        
        // Validate input
        if (!username || !password) {
            this.showFormError(form, 'Username and password are required');
            return;
        }
        
        // Attempt login
        try {
            const loginResult = await UsersController.login(username, password);
            console.log('Login Result:', loginResult); // Debug
            
            if (loginResult.success) {
                // Show success message
                Utils.showNotification('Login successful!', 'success', 2000);
                
                // Determine destination based on user type
                const userType = loginResult.user.user_type; // Fixed from userType
                
                if (userType === 'admin') {
                    this.app.navigateTo('admin-dashboard');
                } else {
                    this.app.navigateTo('user-dashboard');
                }
            } else {
                // Show error message
                this.showFormError(form, loginResult.error);
            }
        } catch (error) {
            console.error('Error during login:', error);
            this.showFormError(form, 'An unexpected error occurred. Please try again.');
        }
    }
    
    showFormError(form, errorMessage) {
        // Clear any existing error
        let errorElement = form.querySelector('.form-error');
        
        if (!errorElement) {
            // Create error element if it doesn't exist
            errorElement = Utils.createElement('div', {
                class: 'form-error alert alert-danger mt-3'
            });
            form.insertBefore(errorElement, form.querySelector('.form-actions'));
        }
        
        // Set error message
        errorElement.textContent = errorMessage;
        
        // Highlight input fields
        form.querySelectorAll('.form-control').forEach(input => {
            input.classList.add('is-invalid');
        });
    }
}