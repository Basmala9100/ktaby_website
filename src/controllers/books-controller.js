// controllers/books-controller.js

class BooksController {
    // Key for storing books in local storage
    static STORAGE_KEY = 'ktaby_books';

    // Initial default books
    static DEFAULT_BOOKS = [
        {
            id: '1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            category: 'Classic',
            description: 'A novel about the American dream',
            imageUrl: 'resources/The Great Gatsby.jpeg',
            isBorrowed: false,
            borrowedBy: null
        },
        {
            id: '2',
            title: '1984',
            author: 'George Orwell',
            category: 'Dystopian',
            description: 'A dystopian novel about totalitarianism',
            imageUrl: 'resources/OIP.jpeg',
            isBorrowed: false,
            borrowedBy: null
        }
    ];
    
    static getAllBooks() {
        let books = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        
        // Initialize with default books if empty
        if (books.length === 0) {
            books = this.DEFAULT_BOOKS.map(book => ({
                ...book,
                id: this.generateUniqueId()
            }));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));
        }

        return books;
    }

    static generateUniqueId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Create a new book
     * @param {Object} bookData - Book data to create
     * @returns {Object} Created book or error
     */
    static createBook(bookData) {
        // Validate input
        if (!bookData.title || !bookData.author) {
            return { 
                success: false, 
                error: 'Title and author are required' 
            };
        }

        const books = this.getAllBooks();

        // Check for existing book with same title and author
        if (books.some(book => 
            book.title === bookData.title && 
            book.author === bookData.author
        )) {
            return { 
                success: false, 
                error: 'Book already exists' 
            };
        }

        // Create new book with additional metadata
        const newBook = {
            ...bookData,
            id: this.generateUniqueId(),
            isBorrowed: false,
            borrowedBy: null,
            createdAt: new Date().toISOString()
        };

        // Add new book and save
        books.push(newBook);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));

        return { 
            success: true, 
            book: newBook 
        };
    }

    /**
     * Find a book by ID
     * @param {string} bookId 
     * @returns {Object|null} Found book or null
     */
    static findBookById(bookId) {
        const books = this.getAllBooks();
        return books.find(book => book.id === bookId);
    }

    /**
     * Update an existing book
     * @param {string} bookId 
     * @param {Object} updatedData 
     * @returns {Object} Update result
     */
    static updateBook(bookId, updatedData) {
        const books = this.getAllBooks();
        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex === -1) {
            return { 
                success: false, 
                error: 'Book not found' 
            };
        }

        // Merge existing book data with updates
        books[bookIndex] = {
            ...books[bookIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };

        // Batch update to local storage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));

        return { 
            success: true, 
            book: books[bookIndex] 
        };
    }

    /**
     * Delete a book
     * @param {string} bookId 
     * @returns {Object} Deletion result
     */
    static deleteBook(bookId) {
        const books = this.getAllBooks();
        const filteredBooks = books.filter(book => book.id !== bookId);

        // Check if any book was actually removed
        if (books.length === filteredBooks.length) {
            return { 
                success: false, 
                error: 'Book not found' 
            };
        }

        // Batch update to local storage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBooks));

        return { 
            success: true 
        };
    }

    /**
     * Batch create books
     * @param {Array} booksData 
     * @returns {Object} Batch creation result
     */
    static batchCreateBooks(booksData) {
        const existingBooks = this.getAllBooks();
        const newBooks = [];
        const errors = [];

        booksData.forEach(bookData => {
            // Validate each book
            if (!bookData.title || !bookData.author) {
                errors.push({
                    bookData,
                    error: 'Invalid book data'
                });
                return;
            }

            // Check for existing book
            if (existingBooks.some(book => 
                book.title === bookData.title && 
                book.author === bookData.author
            )) {
                errors.push({
                    bookData,
                    error: 'Book already exists'
                });
                return;
            }

            // Create book with unique ID
            const newBook = {
                ...bookData,
                id: this.generateUniqueId(),
                isBorrowed: false,
                borrowedBy: null,
                createdAt: new Date().toISOString()
            };

            newBooks.push(newBook);
            existingBooks.push(newBook);
        });

        // Batch update to local storage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingBooks));

        return {
            success: newBooks.length > 0,
            newBooks,
            errors
        };
    }

    /**
     * Get books borrowed by a specific user
     * @param {string} userId 
     * @returns {Array} Books borrowed by the user
     */
    static getBooksBorrowedByUser(userId) {
        const books = this.getAllBooks();
        return books.filter(book => book.isBorrowed && book.borrowedBy === userId);
    }

    /**
     * Search books by query
     * @param {string} query 
     * @returns {Array} Matching books
     */
    static searchBooks(query) {
        const books = this.getAllBooks();
        const lowercaseQuery = query.toLowerCase();

        return books.filter(book => 
            book.title.toLowerCase().includes(lowercaseQuery) ||
            book.author.toLowerCase().includes(lowercaseQuery) ||
            book.category.toLowerCase().includes(lowercaseQuery)
        );
    }
}

export default BooksController;