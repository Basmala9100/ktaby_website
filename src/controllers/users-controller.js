class UsersController {
    static STORAGE_KEY = 'ktaby_users';
    static CURRENT_USER_KEY = 'ktaby_current_user';
    static API_BASE_URL = 'http://localhost:8000/api/';

    static async signup(userData) {
        try {
            if (!userData.userType) {
                throw new Error('userType is required');
            }
            const payload = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                user_type: userData.userType // No fallback
            };
            console.log('Signup Payload:', payload); // Debug
            const response = await fetch(`${this.API_BASE_URL}signup/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            console.log('Signup Response:', result); // Debug
            if (!response.ok) {
                console.error('Signup failed:', response.status, result);
                return { success: false, error: result.error || 'Signup failed' };
            }
            result.userType = result.user_type || 'user'; // Fallback to 'user'
            delete result.user_type; // Remove user_type from the result
            
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(result));
            return { success: true, user: result };
        } catch (error) {
            console.error('Error in signup:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async login(username, password) {
        console.log('Login attempt:', { username, password });
        try {
            const response = await fetch(`${this.API_BASE_URL}login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            console.log('Login response:', response.status, result);
            if (!response.ok) {
                console.error('Login failed:', response.status, result);
                return { success: false, error: result.error || 'Login failed' };
            }
            result.userType = result.user_type || 'user'; 
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(result));

            return { success: true, user: result };
        } catch (error) {
            console.error('Error in login:', error.message);
            return { success: false, error: error.message };
        }
    }

    static getCurrentUser() {
        const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
        return currentUser ? JSON.parse(currentUser) : null;
    }

    static logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    static isLoggedIn() {
        return !!localStorage.getItem(this.CURRENT_USER_KEY);
    }
}

export default UsersController;