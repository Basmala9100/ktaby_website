// src/components/utils.js - Utility functions

/**
 * Utility functions for common operations
 */
const Utils = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
      let timeoutId;
      return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(context, args);
        }, delay);
      };
    },
  
    /**
     * Event delegation helper
     * @param {HTMLElement} element - Parent element to attach listener to
     * @param {string} eventType - Event type (click, submit, etc.)
     * @param {string} selector - CSS selector to match target elements
     * @param {Function} handler - Event handler function
     */
    delegate(element, eventType, selector, handler) {
      element.addEventListener(eventType, event => {
        const targetElement = event.target.closest(selector);
        
        if (targetElement && element.contains(targetElement)) {
          handler.call(targetElement, event, targetElement);
        }
      });
    },
  
    /**
     * Get form values as an object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form values
     */
    getFormValues(form) {
      const formData = new FormData(form);
      const values = {};
      
      for (const [key, value] of formData.entries()) {
        values[key] = value;
      }
      
      return values;
    },
  
    /**
     * Create an element with attributes and content
     * @param {string} tag - Element tag name
     * @param {Object} attributes - Element attributes
     * @param {string|HTMLElement} content - Element content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, content = '') {
      const element = document.createElement(tag);
      
      // Set attributes
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      
      // Set content
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        element.appendChild(content);
      }
      
      return element;
    },
  
    /**
     * Validate form field
     * @param {string} value - Field value
     * @param {Object} rules - Validation rules
     * @returns {string} Error message or empty string if valid
     */
    validateField(value, rules = {}) {
      // Required validation
      if (rules.required && !value.trim()) {
        return rules.requiredMessage || 'This field is required';
      }
      
      // Minimum length validation
      if (rules.minLength && value.length < rules.minLength) {
        return rules.minLengthMessage || `Minimum length is ${rules.minLength} characters`;
      }
      
      // Maximum length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.maxLengthMessage || `Maximum length is ${rules.maxLength} characters`;
      }
      
      // Email validation
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rules.emailMessage || 'Please enter a valid email address';
      }
      
      // Regex pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.patternMessage || 'Please enter a valid value';
      }
      
      // Custom validation function
      if (rules.validate && typeof rules.validate === 'function') {
        const validationResult = rules.validate(value);
        if (validationResult !== true) {
          return validationResult;
        }
      }
      
      return ''; // No error
    },
  
    /**
     * Validate entire form
     * @param {Object} values - Form values
     * @param {Object} validationRules - Rules for each field
     * @returns {Object} Object with errors for each field
     */
    validateForm(values, validationRules) {
      const errors = {};
      
      Object.entries(validationRules).forEach(([fieldName, rules]) => {
        const value = values[fieldName] || '';
        const error = this.validateField(value, rules);
        
        if (error) {
          errors[fieldName] = error;
        }
      });
      
      return errors;
    },
  
    showNotification(message, type = 'info', duration = 3000) {
      // Create container if it doesn't exist
      let container = document.querySelector('.notification-container');
      
      if (!container) {
        container = this.createElement('div', { class: 'notification-container' });
        document.body.appendChild(container);
      }
      
      // Create notification element
      const notification = this.createElement('div', {
        class: `notification alert alert-${type}`
      });
      
      notification.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="notification" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      `;
      
      // Add to container
      container.appendChild(notification);
      
      // Add click event to close button
      const closeButton = notification.querySelector('.close');
      closeButton.addEventListener('click', () => {
        notification.classList.add('disappear');
        
        // Remove after animation completes
        setTimeout(() => {
          notification.remove();
          
          // Remove container if empty
          if (container.children.length === 0) {
            container.remove();
          }
        }, 500);
      });
      
      // Auto-hide if duration is set
      if (duration > 0) {
        setTimeout(() => {
          // Only hide if the notification still exists
          if (document.body.contains(notification)) {
            notification.classList.add('disappear');
            
            // Remove after animation completes
            setTimeout(() => {
              notification.remove();
              
              // Remove container if empty
              if (container.children.length === 0) {
                container.remove();
              }
            }, 500);
          }
        }, duration);
      }
    },
  
    formatDate(dateString, options = { dateStyle: 'medium' }) {
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', options).format(date);
      } catch (error) {
        return dateString;
      }
    },

    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    },
  

    toTitleCase(str) {
      // Replace underscores and hyphens with spaces
      let result = str.replace(/[_-]/g, ' ');
      
      // Insert space before capital letters
      result = result.replace(/([A-Z])/g, ' $1');
      
      // Capitalize first letter of each word and lowercase the rest
      return result
        .split(' ')
        .map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
        .trim();
    }
  };
  
  export default Utils;