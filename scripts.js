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

// for view details page
function openBookDetails(event, title, author, category, image) {
    event.preventDefault(); // Prevent default link behavior

    // Encode values to be URL safe
    const url = `view_details.html?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&category=${encodeURIComponent(category)}&image=${encodeURIComponent(image)}`;

    // Redirect to View Details page with book data
    window.location.href = url;
}
// View Details Page (view_details.html)
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    
    const title = params.get("title");
    const author = params.get("author");
    const category = params.get("category");
    const image = params.get("image");
    const description = params.get("description");

    // Set the book details in the view
    if (title) document.getElementById("book-title").textContent = title;
    if (author) document.getElementById("book-author").textContent = author;
    if (category) document.getElementById("book-category").textContent = category;
    if (description) document.getElementById("book-description").textContent = description;
    if (image) document.getElementById("book-image").src = image;

    // Borrow button event listener
    document.getElementById("borrow-btn").addEventListener("click", function () {
        alert(`You have borrowed "${title}" by ${author}`);
    });
});

// Search Book Functionality
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar");
    const searchButton = document.querySelector(".search-button");
    const books = document.querySelectorAll(".book-card");
    const adminBooks = document.querySelectorAll(".admin-book-card")

    function searchBooks() {
        const query = searchInput.value.toLowerCase();
        books.forEach(book => {
            const title = book.getAttribute("data-title").toLowerCase();
            const author = book.getAttribute("data-author").toLowerCase();
            const category = book.getAttribute("data-category").toLowerCase();

            if (title.includes(query) || author.includes(query) || category.includes(query)) {
                book.style.display = "block";
            } else {
                book.style.display = "none";
            }
        });

        // Search in admin page books
        adminBooks.forEach(book => {
            const bookInfo = book.querySelector(".admin-book-info");
            if (!bookInfo) return;

            const title = bookInfo.getAttribute("data-title").toLowerCase();
            const author = bookInfo.getAttribute("data-author").toLowerCase();
            const category = bookInfo.getAttribute("data-category").toLowerCase();

            if (title.includes(query) || author.includes(query) || category.includes(query)) {
                book.style.display = "block";
            } else {
                book.style.display = "none";
            }
        });
    }
    // Search on input change
    searchInput.addEventListener("input", searchBooks);
        
    // Search on button click
    searchButton.addEventListener("click", searchBooks);
});

// JavaScript for Menu Toggle and Deletion
function toggleMenu(menuId) {
    let menu = document.getElementById(menuId);
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}
// view details for toggle menu
document.addEventListener("DOMContentLoaded", function () {
    let bookDetails = JSON.parse(localStorage.getItem("selectedBook"));

    if (bookDetails) {
        document.getElementById("bookName").value = bookDetails.title;
        document.getElementById("bookAuthor").value = bookDetails.author;
        document.getElementById("bookCategory").value = bookDetails.category;
        document.getElementById("bookDescription").value = bookDetails.description;
        document.getElementById("bookBorrowed").value = bookDetails.status.includes("Borrowed") ? "Yes" : "No";
    }
});
function viewBookDetails(element) {
    // Get the book's info
    let bookInfo = element.closest(".admin-book-card").querySelector(".admin-book-info");

    let bookDetails = {
        title: bookInfo.getAttribute("data-title"),
        author: bookInfo.getAttribute("data-author"),
        category: bookInfo.getAttribute("data-category"),
        description: bookInfo.querySelector("p:nth-of-type(2)").textContent, // Description
        status: bookInfo.querySelector(".status").textContent.trim() // Borrowed/Not Borrowed
    };

    // Store in local storage
    localStorage.setItem("selectedBook", JSON.stringify(bookDetails));

    // Redirect to manage_books.html
    window.location.href = "manage_books.html";
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

