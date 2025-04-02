import BooksController from '../controllers/books-controller.js';

export default class HomeRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create home page container
        const homeContainer = document.createElement('div');
        homeContainer.className = 'home-page';

        // Create search bar
        const searchBar = this.createSearchBar();

        // Create book list container
        const bookList = document.createElement('div');
        bookList.id = 'book-list';
        bookList.className = 'book-list';

        // Create search results indicator
        const searchResults = document.createElement('div');
        searchResults.id = 'search-results';
        searchResults.className = 'search-results';
        searchResults.style.display = 'none'; // THIS IS IMPORTANT WITHOUT IT WE'LL HAVE 
                                              // A SEARCH RESULTS DIV WITHOUT CONTENT

        // Append elements to the home container
        homeContainer.appendChild(searchBar);
        homeContainer.appendChild(searchResults);
        homeContainer.appendChild(bookList);

        // Render to main container
        container.appendChild(homeContainer);

        // Populate books
        this.renderBooks(bookList);

        // Setup search functionality
        this.setupSearchFunctionality(homeContainer);
    }

    createSearchBar() {
        const searchBar = document.createElement('div');
        searchBar.className = 'search-container';
        searchBar.innerHTML = `
            <input type="text" id="search-bar" class="search-bar" 
                   placeholder="Search books by title, author, or category...">
            <button id="search-button" class="search-button">Search</button>
            <button id="clear-search" class="clear-search-button" style="display:none;">Clear Search</button>
        `;
        return searchBar;
    }

    renderBooks(bookList, books = null) {
        bookList.innerHTML = '';

        // Use provided books or get all books (provided i.e. search results)
        // default is fetching all books using the controller and rendering them
        const booksToRender = books || BooksController.getAllBooks();

        if (booksToRender.length === 0) {
            bookList.innerHTML = '<p class="no-books">No books found matching your search.</p>';
            return;
        }

        // Render each book
        booksToRender.forEach(book => {
            const bookCard = this.createBookCard(book);
            bookList.appendChild(bookCard);
        });
    }

    createBookCard(book) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.setAttribute('data-book-id', book.id);
        // Set book ID for easy access later
        // We use fixed size for the image to maintain layout and avoid shifts
        bookCard.innerHTML = `
            <img src="${book.imageUrl}" width="150" height="200" alt="${book.title}">
            <div style="flex-direction:row; justify-content: space-between;">
                <h3>${book.title}</h3>
                <p>By ${book.author}</p>
                <p class="book-category">${book.category}</p>
                <p class="book-status ${book.isBorrowed ? 'unavailable' : 'available'}">
                    ${book.isBorrowed ? 'Borrowed' : 'Available'}
                </p>
            </div>

            <a href="#" data-page="details" data-book-id="${book.id}" class="book-link">
                View Details
            </a>
        `;

        // Add click event for book details
        const detailsLink = bookCard.querySelector('.book-link');
        detailsLink.addEventListener('click', (event) => {
            event.preventDefault();
            this.app.navigateTo('details', { bookId: book.id });
        });

        return bookCard;
    }

    setupSearchFunctionality(homeContainer) {
        // WE COULD USE getELementById BUT querySelector IS MORE FLEXIBLE
        const searchInput = homeContainer.querySelector('#search-bar');
        const searchButton = homeContainer.querySelector('#search-button');
        const clearSearchButton = homeContainer.querySelector('#clear-search');
        const bookList = homeContainer.querySelector('#book-list');
        const searchResults = homeContainer.querySelector('#search-results');
        
        // Debounce function to prevent searching on EVERY KEY STROKE.
        const debounce = (func, delay) => { 
            let timeoutId;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(context, args);
                }, delay);
            };
        };
        
        const handleSearch = () => {
            const query = searchInput.value.trim();
            
            if (query) {
                // Perform search. It is delegated to the controller to keep view logic separated
                const searchResults = BooksController.searchBooks(query);
                
                // Update search results indicator
                const resultElement = document.getElementById('search-results');
                resultElement.textContent = `Found ${searchResults.length} ${searchResults.length === 1 ? 'book' : 'books'} matching "${query}"`;
                resultElement.style.display = 'block'; // remember we left it hidden
                
                // Show clear search button
                clearSearchButton.style.display = 'inline-block';
                
                // Render search results using the returned books from the controller
                this.renderBooks(bookList, searchResults);
            } else {
                // If search is empty, show all books
                this.clearSearch();
            }
        };
         
        const debouncedSearch = debounce(handleSearch, 300);

        // Handle clear search
        this.clearSearch = () => {
            searchInput.value = '';
            clearSearchButton.style.display = 'none';
            searchResults.style.display = 'none';
            this.renderBooks(bookList);
        };

        // Setup event listeners
        searchInput.addEventListener('input', debouncedSearch);
        searchButton.addEventListener('click', handleSearch);
        clearSearchButton.addEventListener('click', this.clearSearch);
        
        // Handle Enter key in search field
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
    }
}