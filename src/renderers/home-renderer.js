// src/renderers/home-renderer.js
import BooksController from '../controllers/books-controller.js';
import Templates from '../components/templates.js';
import Utils from '../components/utils.js';

export default class HomeRenderer {
    constructor(app) {
        this.app = app;
    }

    render(container) {
        // Clear previous content
        container.innerHTML = '';

        // Create home page container
        const homeContainer = Utils.createElement('div', { class: 'container' });

        // Add hero section
        const heroSection = Utils.createElement('div', { 
            class: 'hero-section',
            style: 'background-image: url("resources/online_library5.jpg");'
        });
        
        heroSection.innerHTML = `
            <div class="hero-text">
                <h1>Welcome to Ktaby Library</h1>
                <p>Discover, borrow, and enjoy a world of books at your fingertips</p>
            </div>
        `;

        // Create search section
        const searchContainer = Utils.createElement('div', { class: 'search-container' });
        searchContainer.innerHTML = `
            <input type="text" id="search-bar" class="search-bar" 
                placeholder="Search books by title, author, or category...">
            <button id="search-button" class="btn btn--primary search-button">Search</button>
            <button id="clear-search" class="btn btn--secondary clear-search-button" style="display:none;">Clear</button>
        `;

        // Create search results indicator
        const searchResults = Utils.createElement('div', { 
            id: 'search-results', 
            class: 'search-results',
            style: 'display: none;'
        });

        // Create featured books section
        const featuredSection = Utils.createElement('section', { class: 'featured-books' });
        featuredSection.innerHTML = '<h2 class="text-center mb-4">Featured Books</h2>';

        // Create book list container
        const bookListContainer = Utils.createElement('div', { id: 'book-list-container' });
        featuredSection.appendChild(bookListContainer);

        // Append elements to container
        homeContainer.appendChild(heroSection);
        homeContainer.appendChild(searchContainer);
        homeContainer.appendChild(searchResults);
        homeContainer.appendChild(featuredSection);
        container.appendChild(homeContainer);

        // Render initial book list
        this.renderBooks();
        
        // Setup event handlers
        this.setupEventHandlers(homeContainer);
    }

    async renderBooks(books = null) {
        const bookListContainer = document.getElementById('book-list-container');
        try {
            const booksToRender = books || await BooksController.getAllBooks();
            console.log('Books to render:', booksToRender); // Debug
            bookListContainer.innerHTML = Templates.bookList(
                booksToRender, 
                'default', 
                'No books found matching your search.'
            );
        } catch (error) {
            console.error('Error rendering books:', error);
            bookListContainer.innerHTML = '<p class="no-books">Error loading books</p>';
        }
    }

    setupEventHandlers(container) {
        const searchInput = container.querySelector('#search-bar');
        const searchButton = container.querySelector('#search-button');
        const clearSearchButton = container.querySelector('#clear-search');
        const searchResults = container.querySelector('#search-results');
        
        // Debounced search function
        const debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);
        
        // Search input handler
        searchInput.addEventListener('input', (event) => {
            debouncedSearch(event, searchResults, clearSearchButton);
        });
        
        // Search button handler
        searchButton.addEventListener('click', (event) => {
            this.handleSearch(event, searchResults, clearSearchButton);
        });
        
        // Clear search button handler
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchButton.style.display = 'none';
            searchResults.style.display = 'none';
            this.renderBooks();
        });
        
        // Enter key in search field
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSearch(event, searchResults, clearSearchButton);
            }
        });
        
        // Book card action delegation using Utils.delegate
        Utils.delegate(container, 'click', '[data-page="details"]', (event) => {
            event.preventDefault();
            const bookId = event.target.dataset.bookId;
            this.app.navigateTo('details', { bookId });
        });
    }

    handleSearch(event, searchResults, clearSearchButton) {
        const searchInput = document.querySelector('#search-bar');
        const query = searchInput.value.trim();
        
        if (query) {
            // Perform search
            const searchResultsData = BooksController.searchBooks(query);
            
            // Update search results indicator
            searchResults.textContent = `Found ${searchResultsData.length} ${
                searchResultsData.length === 1 ? 'book' : 'books'
            } matching "${query}"`;
            searchResults.style.display = 'block';
            
            // Show clear search button
            clearSearchButton.style.display = 'inline-block';
            
            // Render search results
            this.renderBooks(searchResultsData);
        } else {
            // If search is empty, show all books
            clearSearchButton.style.display = 'none';
            searchResults.style.display = 'none';
            this.renderBooks();
        }
    }
}