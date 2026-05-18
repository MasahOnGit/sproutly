import { renderWelcomeScreen } from '../components/welcome-screen.js';
import { renderDashboardScreen } from '../components/dashboard-screen.js';
import { setupTheme, setupTabs, updateModeUI, showScreen } from './ui.js';
import {restoreSession, setupAuthForms} from './auth.js';
import { setupDashboardForms } from './forms.js';

function mountScreens() {
  document.querySelector('#welcomeScreen').innerHTML = renderWelcomeScreen();
  document.querySelector('#dashboardScreen').innerHTML = renderDashboardScreen();
}

function bootstrap() {
  mountScreens();
  setupTheme();
  setupTabs();
  setupAuthForms();
  setupDashboardForms();
  updateModeUI();
  restoreSession();
}

document.addEventListener('DOMContentLoaded', bootstrap);