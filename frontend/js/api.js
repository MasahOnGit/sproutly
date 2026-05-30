/**
 * Base URL for all backend API requests.
 */
export const API_BASE = 'http://localhost:8080/api';

/**
 * Sends an HTTP request to the backend API.
 *
 * This helper function:
 * - Builds the full API URL
 * - Applies default request settings
 * - Includes session credentials for authentication
 * - Handles request errors
 * - Automatically parses JSON responses
 *
 * @param {string} path API endpoint path
 * @param {Object} [options={}] fetch configuration options
 * @returns {Promise<Object|null>} parsed response data or null
 * @throws {Error} if the request fails
 */
export async function api(path, options = {}) {

    // Send the HTTP request to the backend
    const response = await fetch(`${API_BASE}${path}`, {

        // Use GET by default unless another method is provided
        method: options.method || 'GET',

        // Default request headers
        headers: {
            'Content-Type': 'application/json',

            // Merge custom headers if provided
            ...(options.headers || {})
        },

        // Include cookies/session credentials
        credentials: 'include',

        // Allow custom fetch options to override defaults
        ...options
    });

    // Handle failed requests
    if (!response.ok) {

        // Attempt to read the error message from the response body
        const message = await response.text();

        throw new Error(message || 'Request failed');
    }

    // Handle successful requests with no content
    if (response.status === 204) {
        return null;
    }

    // Read the response body as text
    const text = await response.text();

    // Return null if the response body is empty
    if (!text) {
        return null;
    }

    // Convert the response text into JSON
    return JSON.parse(text);
}