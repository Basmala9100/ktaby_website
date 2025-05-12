import UsersController from '../controllers/users-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class SignupRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create signup container
        const signupContainer = Utils.createElement('div', { class: 'form-container' });
        
        // Build signup form using templates
        const formContent = `
            <h2 class="form-title">Sign Up</h2>
            <form id="signup-form">
                ${Templates.formInput('signup-username', 'Username', 'text', true, 'Choose a username')}
                ${Templates.formInput('signup-email', 'Email', 'email', true, 'Enter your email')}
                ${Templates.formInput('signup-password', 'Password', 'password', true, 'Choose a password')}
                ${Templates.formInput('signup-confirm-password', 'Confirm Password', 'password', true, 'Confirm your password')}
                
                <div class="form-group">
                    <label class="form-label">User Type</label>
                    <div class="form-check">
                        <input type="radio" id="user" name="userType" value="user" class="form-check-input" checked>
                        <label for="user" class="form-check-label">User</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" id="admin" name="userType" value="admin" class="form-check-input">
                        <label for="admin" class="form-check-label">Admin</label>
                    </div>
                </div>
                
                <div class="form-actions">
                    ${Templates.button('Sign Up', 'primary', 'signup-button', { type: 'submit' })}
                </div>
                
                <div class="mt-3 text-center">
                    <p>Already have an account? <a href="#" data-page="login">Log in</a></p>
                </div>
            </form>
        `;
        
        signupContainer.innerHTML = formContent;
        
        // Append to main container
        container.appendChild(signupContainer);
        
        // Setup event handlers
        this.setupEventHandlers(signupContainer);
    }
    
    setupEventHandlers(container) {
        // Form submission
        const signupForm = container.querySelector('#signup-form');
        
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleSignup(event);
        });
        
        // Signup link
        Utils.delegate(container, 'click', '[data-page="login"]', (event) => {
            event.preventDefault();
            this.app.navigateTo('login');
        });
    }
    
    async handleSignup(event) {
        // Get form values
        const form = event.target;
        const username = form.querySelector('#signup-username').value.trim();
        const email = form.querySelector('#signup-email').value.trim();
        const password = form.querySelector('#signup-password').value;
        const confirmPassword = form.querySelector('#signup-confirm-password').value;
        const userTypeInput = form.querySelector('input[name="userType"]:checked');
        
        // Basic validation
        if (!username || !email || !password || !confirmPassword) {
            this.showFormError(form, 'All fields are required');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFormError(form, 'Please enter a valid email address');
            return;
        }
        
        // Password match validation
        if (password !== confirmPassword) {
            this.showFormError(form, 'Passwords do not match');
            return;
        }
        
        // Password length validation
        if (password.length < 8) {
            this.showFormError(form, 'Password must be at least 8 characters long');
            return;
        }
        
        // User type validation
        if (!userTypeInput) {
            this.showFormError(form, 'Please select a user type');
            return;
        }
        
        const userType = userTypeInput.value;
        console.log('Selected userType:', userType); // Debug
        
        // Attempt signup
        try {
            const signupResult = await UsersController.signup({
                username,
                email,
                password,
                userType
            });
            console.log('Signup Result:', signupResult); // Debug
            
            if (signupResult.success) {
                // Show success message
                Utils.showNotification('Signup successful! Please log in.', 'success', 3000);
                
                // Navigate to login page
                this.app.navigateTo('login');
            } else {
                // Show error message
                this.showFormError(form, signupResult.error);
            }
        } catch (error) {
            console.error('Error during signup:', error);
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
    }
}