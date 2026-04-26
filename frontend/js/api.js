export const API_BASE = 'http://localhost:8080/api';

export async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        credentials: 'include',
        ...options
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Request failed');
    }

    return response.json();
}