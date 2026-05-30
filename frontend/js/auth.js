import { api } from './api.js';
import { state } from './state.js';
import { showScreen, updateModeUI } from './ui.js';
import { loadPlants, loadWeather, loadCareGuide } from './features.js';

/**
 * Shortcut for selecting a single element from the page.
 *
 * @param {string} selector CSS selector
 * @returns {Element|null} matching element or null
 */
const qs = (selector) => document.querySelector(selector);

/**
 * Shortcut for selecting multiple elements from the page.
 *
 * @param {string} selector CSS selector
 * @returns {NodeListOf<Element>} matching elements
 */
const qsa = (selector) => document.querySelectorAll(selector);

/**
 * Shows the dashboard screen and updates the UI
 * based on the current user mode.
 */
export function goToDashboard() {
    showScreen('dashboardScreen');
    updateModeUI();
}

/**
 * Shows the welcome screen and updates the UI
 * based on the current user mode.
 */
export function goToWelcome() {
    showScreen('welcomeScreen');
    updateModeUI();
}

/**
 * Sets up all authentication-related event listeners.
 *
 * This includes:
 * - Login form submission
 * - Registration form submission
 * - Guest mode button
 * - Logout button
 */
export function setupAuthForms() {
    const loginForm = qs('#loginForm');
    const registerForm = qs('#registerForm');
    const guestBtn = qs('#guestBtn');
    const logoutBtn = qs('#logoutBtn');
    const authMessage = qs('#authMessage');

    // Handle user login
    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';

        // Convert form fields into a plain object
        const payload = Object.fromEntries(new FormData(loginForm).entries());

        try {
            // Send login request to the backend
            const result = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Store authenticated user state
            state.mode = 'user';
            state.loggedInUser = result.user ?? null;

            // Show welcome message
            authMessage.textContent =
                `Welcome back, ${result.user?.displayName || result.user?.email || 'plant lover'}.`;

            // Move to dashboard after successful login
            goToDashboard();

            // Load dashboard data
            await Promise.all([
                loadPlants(),
                loadWeather(),
                loadCareGuide()
            ]);
        } catch (error) {
            authMessage.textContent =
                error.message || 'Login failed. Please try again.';
        }
    });

    // Handle user registration
    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';

        // Convert form fields into a plain object
        const payload = Object.fromEntries(new FormData(registerForm).entries());

        try {
            // Send registration request to the backend
            const result = await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Show success message
            authMessage.textContent =
                result.message || 'Account created. Please log in.';

            // Switch back to the login tab after successful registration
            qsa('.tab').forEach((tab) => tab.classList.remove('active'));
            qsa('.auth-form').forEach((form) => form.classList.remove('active'));

            const loginTab = document.querySelector('[data-tab="login"]');
            loginTab?.classList.add('active');
            loginForm?.classList.add('active');
        } catch (error) {
            authMessage.textContent =
                error.message || 'Registration failed. Please try again.';
        }
    });

    // Continue without logging in
    guestBtn?.addEventListener('click', async () => {
        // Reset state for guest mode
        state.mode = 'guest';
        state.loggedInUser = null;
        state.guestPlants = [];
        authMessage.textContent = '';

        // Show dashboard in guest mode
        goToDashboard();

        // Load guest dashboard data
        await Promise.all([
            loadPlants(),
            loadWeather(),
            loadCareGuide()
        ]);
    });

    // Handle logout
    logoutBtn?.addEventListener('click', async () => {
        try {
            // Ask backend to clear the server-side session
            await api('/auth/logout', { method: 'POST' });
        } catch (error) {
            // Ignore logout errors and clear frontend state anyway
        }

        // Clear frontend user state
        state.mode = 'guest';
        state.loggedInUser = null;
        state.guestPlants = [];
        state.plants = [];
        authMessage.textContent = '';

        // Return to welcome screen
        goToWelcome();
    });
}

/**
 * Restores an existing authenticated session when the app loads.
 *
 * If the backend still has a valid session, the user is taken
 * directly to the dashboard. Otherwise, the app starts in guest mode.
 */
export async function restoreSession() {
    try {
        // Check whether the backend recognizes the current session
        const result = await api('/auth/me');

        // Restore logged-in user state
        state.mode = 'user';
        state.loggedInUser = result.user;

        // Show dashboard
        goToDashboard();

        // Load dashboard data
        await Promise.all([
            loadPlants(),
            loadWeather(),
            loadCareGuide()
        ]);
    } catch {
        // No valid session found, so start as guest
        state.mode = 'guest';
        state.loggedInUser = null;

        // Show welcome screen
        goToWelcome();
    }
}