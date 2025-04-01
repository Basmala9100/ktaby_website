
// src/renderers/signup-renderer.js
import UsersController from '../controllers/users-controller.js';

export default class SignupRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create signup container
        const signupContainer = document.createElement('div');
        signupContainer.className = 'centered-section';
        signupContainer.innerHTML = `
            <h2 class="title">Sign Up</h2>
            <form id="signup-form">
                <label for="username">UserName</label><br>
                <input type="text" class="input-field" id="signup-username" placeholder="Username" required><br>

                <label for="email">Email</label><br>
                <input type="email" class="input-field" id="signup-email" placeholder="Email" required><br>

                <label for="password">Password</label><br>
                <input type="password" class="input-field" id="signup-password" placeholder="Password" required><br>
                
                <label for="password-confirm">Confirm Password</label><br>
                <input type="password" class="input-field" id="signup-confirm-password" placeholder="Confirm Password" required><br>
                
                <label>User Type</label><br>
                <input type="radio" id="admin" name="is_admin" value="admin">
                <label for="admin">Admin</label><br>
                <input type="radio" id="user" name="is_admin" value="user">
                <label for="user">User</label><br><br>

                <button type="submit" class="button">Sign Up</button>
            </form>
        `;

        // Add form submission handler
        const signupForm = signupContainer.querySelector('#signup-form');
        signupForm.addEventListener('submit', this.handleSignup.bind(this));

        // Render to container
        container.appendChild(signupContainer);
    }

    handleSignup(event) {
        event.preventDefault();

        // Get form inputs
        const usernameInput = event.target.querySelector('#signup-username');
        const emailInput = event.target.querySelector('#signup-email');
        const passwordInput = event.target.querySelector('#signup-password');
        const confirmPasswordInput = event.target.querySelector('#signup-confirm-password');
        const userTypeInputs = event.target.querySelectorAll('input[name="is_admin"]');

        // Validate inputs
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check password match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Get selected user type
        const userTypeSelected = Array.from(userTypeInputs).find(input => input.checked);
        if (!userTypeSelected) {
            alert("Please select a user type!");
            return;
        }
        const userType = userTypeSelected.value;

        // Attempt signup
        const signupResult = UsersController.signup({
            username,
            email,
            password,
            userType
        });

        if (signupResult.success) {
            // Navigate to login page or directly log in
            this.app.navigateTo('login');
            alert("Signup successful! Please log in.");
        } else {
            // Show error message
            alert(signupResult.error);
        }
    }
}