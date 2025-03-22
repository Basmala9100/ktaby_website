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

document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get form values
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const userType = document.querySelector('input[name="userType"]:checked');

    // Validate form inputs
    if (!username || !email || !password || !confirmPassword || !userType) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Store user data in local storage (In real applications, never store raw passwords!)
    const userData = {
        username: username,
        email: email,
        userType: userType.value
    };

    localStorage.setItem("user", JSON.stringify(userData));

    // Redirect to login page
    window.location.href = "login.html";
});


document.addEventListener("DOMContentLoaded", function () {
    // ✅ 1. Search Functionality 
    const searchInput = document.querySelector(".search-bar");
    const books = document.querySelectorAll(".book-card");

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        books.forEach(book => {
            const title = book.querySelector("h3").textContent.toLowerCase();
            const author = book.querySelector("p").textContent.toLowerCase();
            if (title.includes(query) || author.includes(query)) {
                book.style.display = "block";
            } else {
                book.style.display = "none";
            }
        });
    });

    // ✅ 2. Sticky Navbar
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            navbar.classList.add("sticky");
        } else {
            navbar.classList.remove("sticky");
        }
    });

    // ✅ 3. Hero Section Animation (Fade-in effect)
    const heroText = document.querySelector(".hero-section h1");
    heroText.style.opacity = 0;
    heroText.style.transition = "opacity 2s ease-in";
    setTimeout(() => {
        heroText.style.opacity = 1;
    }, 500);

    // ✅ 4. Book Details Popup
    const detailLinks = document.querySelectorAll(".book-link");
    detailLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const bookTitle = this.parentElement.querySelector("h3").textContent;
            const bookAuthor = this.parentElement.querySelector("p").textContent;
            showBookModal(bookTitle, bookAuthor);
        });
    });

    function showBookModal(title, author) {
        const modal = document.createElement("div");
        modal.className = "book-modal";
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${author}</p>
                <button id="closeModal">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById("closeModal").addEventListener("click", function () {
            modal.remove();
        });
    }

    // ✅ 5. Dark Mode Toggle
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Dark Mode";
    toggleBtn.className = "dark-mode-btn";
    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        toggleBtn.textContent = document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
    });
});