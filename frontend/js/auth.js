import { api } from './api.js';
import { state } from './state.js';
import { showScreen, updateModeUI } from './ui.js';
import { loadPlants, loadWeather, loadCareGuide } from './features.js';

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

export function goToDashboard() {
    showScreen('dashboardScreen');
    updateModeUI();
}

export function goToWelcome() {
    showScreen('welcomeScreen');
    updateModeUI();
}

export function setupAuthForms() {
    const loginForm = qs('#loginForm');
    const registerForm = qs('#registerForm');
    const guestBtn = qs('#guestBtn');
    const logoutBtn = qs('#logoutBtn');
    const authMessage = qs('#authMessage');

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';

        const payload = Object.fromEntries(new FormData(loginForm).entries());

        try {
            const result = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            state.mode = 'user';
            state.loggedInUser = result.user ?? null;

            authMessage.textContent = `Welcome back, ${result.user?.displayName || result.user?.email || 'plant lover'}.`;
            goToDashboard();

            await Promise.all([
                loadPlants(),
                loadWeather(),
                loadCareGuide()
            ]);
        } catch (error) {
            authMessage.textContent = error.message || 'Login failed. Please try again.';
        }
    });

    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';

        const payload = Object.fromEntries(new FormData(registerForm).entries());

        try {
            const result = await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            authMessage.textContent = result.message || 'Account created. Please log in.';
            qsa('.tab').forEach((tab) => tab.classList.remove('active'));
            qsa('.auth-form').forEach((form) => form.classList.remove('active'));

            const loginTab = document.querySelector('[data-tab="login"]');
            loginTab?.classList.add('active');
            loginForm?.classList.add('active');
        } catch (error) {
            authMessage.textContent = error.message || 'Registration failed. Please try again.';
        }
    });

    guestBtn?.addEventListener('click', async () => {
        state.mode = 'guest';
        state.loggedInUser = null;
        state.guestPlants = [];
        authMessage.textContent = '';

        goToDashboard();

        await Promise.all([
            loadPlants(),
            loadWeather(),
            loadCareGuide()
        ]);
    });

    logoutBtn?.addEventListener('click', async () => {
        try {
            await api('/auth/logout', { method: 'POST' });
        } catch (error) {
            // ignore backend logout failure and clear UI state anyway
        }

        state.mode = 'guest';
        state.loggedInUser = null;
        state.guestPlants = [];
        state.plants = [];
        authMessage.textContent = '';

        goToWelcome();
    });
}