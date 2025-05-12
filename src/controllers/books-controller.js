class BooksController {
    static API_BASE_URL = 'http://localhost:8000/api/';

    static async getAllBooks() {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/`);
            if (!response.ok) {
                console.error('Failed to fetch books:', response.status, await response.text());
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error in getAllBooks:', error.message);
            return [];
        }
    }

    static async createBook(bookData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            const result = await response.json();
            return response.ok ? { success: true, book: result } : { success: false, error: result.detail };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async findBookById(bookId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/${bookId}/`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error in findBookById:', error.message);
            return null;
        }
    }

    static async updateBook(bookId, updatedData) {
        try {
            // Normalize updatedData to match backend field names
            const normalizedData = {
                            ...(updatedData.title        && { title:        updatedData.title }),
                            ...(updatedData.author       && { author:       updatedData.author }),
                            ...(updatedData.category     && { category:     updatedData.category }),
                            ...(updatedData.description  && { description:  updatedData.description }),
                            ...(typeof updatedData.is_borrowed === 'boolean' && { is_borrowed: updatedData.is_borrowed }),
                           // map JS borrowedBy → DRF write-only borrowed_by_id
                            ...(updatedData.borrowedBy !== undefined && { borrowed_by_id: updatedData.borrowedBy })
                };
    
                const response = await fetch(`${this.API_BASE_URL}books/${bookId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(normalizedData)
            });
            const result = await response.json();
            console.log('Update book response:', response.status, result);
            if (response.ok) {
                return { success: true, book: result };
            } else {
                console.error('Update book failed:', response.status, result);
                return { success: false, error: result.detail || result.message || 'Failed to update book' };
            }
        } catch (error) {
            console.error('Error in updateBook:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async deleteBook(bookId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/${bookId}/`, {
                method: 'DELETE'
            });
            return response.ok ? { success: true } : { success: false, error: 'Book not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async batchCreateBooks(booksData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/batch/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booksData)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, errors: [{ error: error.message }] };
        }
    }

    static async getBooksBorrowedByUser(userId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/borrowed/${userId}/`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error in getBooksBorrowedByUser:', error.message);
            return [];
        }
    }

    static async searchBooks(query) {
        try {
            const response = await fetch(`${this.API_BASE_URL}books/search/?query=${encodeURIComponent(query)}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error in searchBooks:', error.message);
            return [];
        }
    }
}

export default BooksController;