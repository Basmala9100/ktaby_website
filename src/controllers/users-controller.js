// src/controllers/users-controller.js

class UsersController {
    // Key for storing users in local storage
    static STORAGE_KEY = 'ktaby_users';
    static CURRENT_USER_KEY = 'ktaby_current_user';

    /**
     * Get all users from local storage
     * @returns {Array} List of users
     */
    static getAllUsers() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    }

    /**
     * Save users to local storage
     * @param {Array} users 
     */
    static saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }

    /**
     * Signup a new user
     * @param {Object} userData 
     * @returns {Object} Signup result
     */
    static signup(userData) {
        // Validate input
        if (!userData.username || !userData.password || !userData.email) {
            return { 
                success: false, 
                error: 'All fields are required' 
            };
        }

        // Get existing users
        const users = this.getAllUsers();

        // Check if username already exists
        if (users.some(user => user.username === userData.username)) {
            return { 
                success: false, 
                error: 'Username already exists' 
            };
        }

        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
            return { 
                success: false, 
                error: 'Email already in use' 
            };
        }

        // Create new user object
        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // In a real app, this should be hashed
            userType: userData.userType || 'user',
            createdAt: new Date().toISOString()
        };

        // Add new user
        users.push(newUser);

        // Save to local storage
        this.saveUsers(users);

        return { 
            success: true, 
            user: newUser 
        };
    }

    /**
     * Login user
     * @param {string} username 
     * @param {string} password 
     * @returns {Object} Login result
     */
    static login(username, password) {
        // Validate input
        if (!username || !password) {
            return { 
                success: false, 
                error: 'Username and password are required' 
            };
        }

        // Get existing users
        const users = this.getAllUsers();

        // Find user
        const user = users.find(
            u => u.username === username && u.password === password
        );

        if (!user) {
            return { 
                success: false, 
                error: 'Invalid username or password' 
            };
        }

        // Store current user in local storage
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

        return { 
            success: true, 
            user: user 
        };
    }

    /**
     * Get current logged-in user
     * @returns {Object|null} Current user or null
     */
    static getCurrentUser() {
        const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
        return currentUser ? JSON.parse(currentUser) : null;
    }

    /**
     * Logout current user
     */
    static logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }
}

export default UsersController;