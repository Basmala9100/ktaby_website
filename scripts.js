// Signup & Redirect to Login page
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signup-form").addEventListener("submit", saveUser);
});

function saveUser(event) {
    event.preventDefault(); // Prevent page refresh

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const userTypeElement = document.querySelector('input[name="is_admin"]:checked');

    if (!userTypeElement) {
        alert("Please select a user type (Admin or User).");
        return;
    }
    const userType = userTypeElement.value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Retrieve users from localStorage or initialize empty array
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        alert("Username already exists! Please choose a different one.");
        return;
    }

    const user = { username, email, password, userType };
    users.push(user);

    localStorage.setItem("users", JSON.stringify(users));

    alert("Sign Up Successful! Redirecting to Login Page...");
    window.location.href = "login.html";
}

// Login & Redirect Users Based on Role
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form").addEventListener("submit", loginUser);
});

function loginUser(event) {
    event.preventDefault(); // Stop form from refreshing the page

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.username === username);

    if (!user) {
        alert("User Not Found!");
        return;
    }

    if (user.password !== password) {
        alert("Invalid Password!");
        return;
    }

    alert("Login Successful!");

    // Redirect based on role
    if (user.userType === "admin") {
        window.location.href = "admin_page.html"; // Redirect Admin
    } else {
        window.location.href = "user_page.html"; // Redirect User
    }
}

// JavaScript for Menu Toggle and Deletion
function toggleMenu(menuId) {
    let menu = document.getElementById(menuId);
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}
// JavaScript for Delete books 
function deleteBook(element) {
    let bookCard = element.closest(".admin-book-card"); 
    if (bookCard) {
        bookCard.remove();
        alert("Book deleted successfully.");
    }
}   
// JavaScript for Edit books 
function enableEditing() {
    document.getElementById("bookName").disabled = false;
    document.getElementById("bookAuthor").disabled = false;
    document.getElementById("bookCategory").disabled = false;
    document.getElementById("bookDescription").disabled = false;
    document.getElementById("bookBorrowed").disabled = false;
    document.getElementById("editBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-block";
}
