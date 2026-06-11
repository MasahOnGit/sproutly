import { startEditPlant } from './forms.js';
import { state } from './state.js';

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
 * Displays a screen and hides all others.
 *
 * The selected screen receives the "screen-active" class.
 *
 * @param {string} screenId ID of the screen to display
 */
export function showScreen(screenId) {

    // Hide all screens
    qsa('.screen').forEach((screen) =>
        screen.classList.remove('screen-active')
    );

    // Show the selected screen
    qs(`#${screenId}`).classList.add('screen-active');
}

/**
 * Initializes the light/dark theme toggle system.
 *
 * The initial theme follows the user's system preference.
 */
export function setupTheme() {

    const root = document.documentElement;

    // Detect preferred color scheme
    let theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    // Apply initial theme
    root.setAttribute('data-theme', theme);

    // Update theme button icon
    qs('#themeToggle').textContent =
        theme === 'dark' ? '☾' : '☼';

    /**
     * Toggles between light and dark mode.
     */
    qs('#themeToggle').addEventListener('click', () => {

        // Switch theme value
        theme = theme === 'dark' ? 'light' : 'dark';

        // Apply updated theme
        root.setAttribute('data-theme', theme);

        // Update theme icon
        qs('#themeToggle').textContent =
            theme === 'dark' ? '☾' : '☼';
    });
}

/**
 * Sets up login/register tab switching.
 *
 * Clicking a tab activates its matching form.
 */
export function setupTabs() {

    qsa('.tab').forEach((tab) => {

        tab.addEventListener('click', () => {

            // Remove active state from all tabs
            qsa('.tab').forEach((item) =>
                item.classList.remove('active')
            );

            // Hide all forms
            qsa('.auth-form').forEach((form) =>
                form.classList.remove('active')
            );

            // Activate selected tab
            tab.classList.add('active');

            // Show matching form
            qs(`#${tab.dataset.tab}Form`)
                .classList.add('active');
        });
    });
}

/**
 * Updates the dashboard UI based on the current mode.
 *
 * This changes:
 * - Guest/user labels
 * - Descriptions
 * - Welcome text
 * - Logout button visibility
 */
export function updateModeUI() {

    const isGuest = state.mode === 'guest';

    // Update mode labels
    qs('#modeBadge').textContent =
        isGuest ? 'Guest' : 'Logged In';

    qs('#modeTitle').textContent =
        isGuest ? 'Guest Mode' : 'Full Experience';

    // Update mode description
    qs('#modeDescription').textContent = isGuest
        ? 'You can add one plant and get care guidance.'
        : 'Your plants are stored in the database and you have the full experience.';

    // Hide logout button in guest mode
    qs('#logoutBtn')
        .classList.toggle('hidden', isGuest);

    // Personalized dashboard welcome text
    if (state.loggedInUser) {

        qs('#dashboardIntro').textContent =
            `Welcome back, ${state.loggedInUser.displayName || state.loggedInUser.email}. Your plants and routines are saved.`;

    } else {

        qs('#dashboardIntro').textContent =
            'You are exploring Sproutly as a guest. Add one plant and check care guidance.';
    }
}

/**
 * Renders plant cards inside the dashboard.
 *
 * This function:
 * - Updates dashboard statistics
 * - Displays guest mode limitations
 * - Renders empty states
 * - Generates plant cards dynamically
 *
 * @param {Array<Object>} plants list of plant objects
 * @param {Object} handlers plant action handlers
 */
export function renderPlants(plants, handlers) {

    const grid = qs('#plantGrid');

    // Count plants that need watering soon
    const countSoon = plants.filter((plant) =>
        handlers.daysUntilWatering(plant) <= 2
    ).length;

    // Update dashboard statistics
    qs('#plantCount').textContent = plants.length;
    qs('#wateringCount').textContent = countSoon;

    // Show guest mode warnings
    if (state.mode === 'guest') {

        qs('#guestLimitMessage').textContent =
            plants.length >= 1
                ? 'Guest mode limit reached: you can only add one plant.'
                : 'Guest mode: one plant only, not saved to the database.';

    } else {

        qs('#guestLimitMessage').textContent = '';
    }

    // Show empty state if no plants exist
    if (!plants.length) {

        grid.innerHTML = `
      <div class="soft-panel">
        <h3>No plants yet</h3>
        <p>
          ${state.mode === 'guest'
            ? 'Add one plant to instantly see care information.'
            : 'Add your first plant to start tracking care routines.'}
        </p>
      </div>
    `;

        return;
    }

    // Render plant cards
    grid.innerHTML = plants.map((plant) => {

        // Calculate watering status
        const days = handlers.daysUntilWatering(plant);

        const status =
            days <= 0
                ? 'Water today'
                : days === 1
                    ? 'Water tomorrow'
                    : `${days} days left`;

        return `
      <article class="plant-card">

        <!-- Plant image -->
        <img
          src="${plant.photoUrl || 'https://picsum.photos/seed/sproutly-plant/800/600'}"
          alt="${plant.name}"
        >

        <div class="plant-card-content">

          <div>
            <h3>${plant.name}</h3>
            <p class="plant-type">${plant.type}</p>
          </div>

          <!-- Plant metadata -->
          <div class="tag-row">
            <span class="tag">${plant.location || 'Indoors'}</span>
            <span class="tag">${status}</span>
          </div>

          <!-- User notes -->
          <p>${plant.notes || 'No notes yet.'}</p>

          <!-- Plant action buttons -->
          <div class="card-actions">

            ${state.mode === 'guest'

            ? `
                <button
                  class="ghost-button"
                  data-care="${plant.type || plant.name}"
                >
                  View care guide
                </button>

                <button
                    class="ghost-button"
                    data-edit="${plant.id}"
                >
                Edit
                </button>

                <button
                  class="ghost-button"
                  data-remove-guest="true"
                >
                  Remove
                </button>
              `

            : `
                <button
                  class="ghost-button"
                  data-water="${plant.id}"
                >
                  Mark watered
                </button>

                <button
                    class="ghost-button"
                    data-edit="${plant.id}"
                >
                Edit
                </button>

                <button
                  class="ghost-button"
                  data-delete="${plant.id}"
                >
                  Delete
                </button>
              `}
          </div>
        </div>
      </article>
    `;
    }).join('');
}

/**
 * Binds click handlers for plant card actions.
 *
 * Handles:
 * - Watering plants
 * - Deleting plants
 * - Opening care guides
 * - Removing guest plants
 * - Editing plants (reusing the add form)
 *
 * @param {Object} handlers plant action handlers
 */
export function bindPlantCardActions(handlers) {

    const grid = qs('#plantGrid');

    // Stop if the plant grid does not exist
    if (!grid) return;

    /**
     * Handles delegated click events inside the plant grid.
     */
    grid.onclick = async (event) => {

        // Action buttons
        const waterButton =
            event.target.closest('[data-water]');

        const deleteButton =
            event.target.closest('[data-delete]');

        const careButton =
            event.target.closest('[data-care]');

        const removeGuestButton =
            event.target.closest('[data-remove-guest]');

        const editButton = 
            event.target.closest('[data-edit]');

        // Water plant
        if (waterButton) {

            await handlers.waterPlant(
                Number(waterButton.dataset.water)
            );

            return;
        }        

        // Delete plant
        if (deleteButton) {

            await handlers.deletePlant(
                Number(deleteButton.dataset.delete)
            );

            return;
        }

        // Load care guide
        if (careButton) {

            await handlers.loadCareGuide(
                careButton.dataset.care
            );

            return;
        }

        // Remove guest plant
        if (removeGuestButton) {
            handlers.removeGuestPlant();
        }
    };
}