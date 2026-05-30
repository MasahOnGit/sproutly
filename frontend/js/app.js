import { renderWelcomeScreen } from '../components/welcome-screen.js';
import { renderDashboardScreen } from '../components/dashboard-screen.js';

import {
  setupTheme,
  setupTabs,
  updateModeUI,
  showScreen
} from './ui.js';

import {
  restoreSession,
  setupAuthForms
} from './auth.js';

import { setupDashboardForms } from './forms.js';

/**
 * Renders the application's main screens into the DOM.
 *
 * This function inserts:
 * - The welcome/authentication screen
 * - The dashboard screen
 */
function mountScreens() {

  // Render the welcome screen
  document.querySelector('#welcomeScreen').innerHTML =
      renderWelcomeScreen();

  // Render the dashboard screen
  document.querySelector('#dashboardScreen').innerHTML =
      renderDashboardScreen();
}

/**
 * Initializes the application.
 *
 * This function:
 * - Renders the UI screens
 * - Sets up theme switching
 * - Enables login/register tabs
 * - Initializes authentication forms
 * - Initializes dashboard forms
 * - Updates the current UI mode
 * - Restores an existing user session
 */
function bootstrap() {

  // Render application screens
  mountScreens();

  // Initialize UI features
  setupTheme();
  setupTabs();

  // Initialize authentication forms and handlers
  setupAuthForms();

  // Initialize dashboard form functionality
  setupDashboardForms();

  // Update guest/authenticated mode UI
  updateModeUI();

  // Restore existing login session if available
  restoreSession();
}

/**
 * Starts the application once the HTML document has fully loaded.
 */
document.addEventListener('DOMContentLoaded', bootstrap);