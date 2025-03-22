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
