
import UsersController from '../controllers/users-controller.js';

export default class LoginRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create login container
        const loginContainer = document.createElement('div');
        loginContainer.className = 'centered-section';
        loginContainer.innerHTML = `
            <h2 class="title">Log In</h2>
            <form id='login-form'>
                <label for="username">Username</label><br>
                <input type="text" class="input-field" id="username" name="username" placeholder="Username" required><br>

                <label for="password">Password</label><br>
                <input type="password" class="input-field" id="password" name="password" placeholder="Password" required><br><br>
                
                <button type="submit" class="button">Login</button>
            </form>
        `;

        // Add form submission handler
        const loginForm = loginContainer.querySelector('#login-form');
        loginForm.addEventListener('submit', this.handleLogin.bind(this));

        // Render to container
        container.appendChild(loginContainer);
    }

    handleLogin(event) {
        event.preventDefault();

        const usernameInput = event.target.querySelector('#username');
        const passwordInput = event.target.querySelector('#password');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Attempt login
        const loginResult = UsersController.login(username, password);

        if (loginResult.success) {
            // Determine user type and navigate accordingly
            const userType = loginResult.user.userType;
            
            if (userType === 'admin') {
                // Navigate to admin dashboard
                this.app.navigateTo('admin-dashboard');
            } else {
                // Navigate to user dashboard
                this.app.navigateTo('user-dashboard');
            }
        } else {
            // Show error message
            alert(loginResult.error);
        }
    }
}