/**
 * Renders the application's welcome and authentication screen.
 *
 * This screen includes:
 * - Introductory hero section
 * - Application feature highlights
 * - Login form
 * - Registration form
 * - Guest mode access
 *
 * Dynamic form behavior and authentication handling
 * are managed later using JavaScript event listeners.
 *
 * @returns {string} HTML markup for the welcome screen
 */
export function renderWelcomeScreen() {
    return `
    <div class="welcome-layout">

      <!-- Welcome hero section -->
      <section class="welcome-hero card glass">

        <!-- Introductory text content -->
        <div class="welcome-copy">
          <p class="eyebrow accent">A calm home for your plants</p>

          <h2>
            Track care beautifully, and never forget a plant again.
          </h2>

          <p class="lede">
            Log in for the full experience and saved data,
            or continue as a guest to quickly add a plant
            and view care guidelines.
          </p>

          <!-- Application feature highlights -->
          <div class="welcome-points">

            <div class="mini-feature">
              <span class="mini-dot"></span>
              <p>Weather-based watering suggestions</p>
            </div>

            <div class="mini-feature">
              <span class="mini-dot"></span>
              <p>Plant care guidelines</p>
            </div>

            <div class="mini-feature">
              <span class="mini-dot"></span>
              <p>Soft mobile-friendly dashboard</p>
            </div>
          </div>
        </div>

        <!-- Decorative plant illustration -->
        <div class="hero-illustration premium-plant" aria-hidden="true">

          <div class="hero-glow"></div>

          <div class="soil"></div>

          <div class="pot-body"></div>
          <div class="pot-lip"></div>

          <div class="pot-pattern pot-pattern-1"></div>
          <div class="pot-pattern pot-pattern-2"></div>

          <div class="stem-trunk stem-left"></div>
          <div class="stem-trunk stem-center"></div>
          <div class="stem-trunk stem-right"></div>

          <!-- Decorative leaves -->
          <div class="monster-leaf leaf-one">
            <span class="vein"></span>
          </div>

          <div class="monster-leaf leaf-two">
            <span class="vein"></span>
          </div>

          <div class="monster-leaf leaf-three">
            <span class="vein"></span>
          </div>
        </div>
      </section>

      <!-- Authentication panel -->
      <section class="auth-shell card">

        <!-- Login/Register tab controls -->
        <div
          class="tabs"
          role="tablist"
          aria-label="Authentication"
        >
          <button class="tab active" data-tab="login">
            Login
          </button>

          <button class="tab" data-tab="register">
            Register
          </button>
        </div>

        <!-- Login form -->
        <form id="loginForm" class="auth-form active">

          <label>
            Email
            <input
              type="email"
              name="email"
              value="demo@sproutly.app"
              required
            >
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value="demo123"
              required
            >
          </label>

          <button
            type="submit"
            class="primary-button full-width"
          >
            Log in
          </button>
        </form>

        <!-- Registration form -->
        <form id="registerForm" class="auth-form">

          <label>
            Name
            <input
              type="text"
              name="displayName"
              required
            >
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              required
            >
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              required
            >
          </label>

          <button
            type="submit"
            class="primary-button full-width"
          >
            Create account
          </button>
        </form>

        <!-- Divider between authentication and guest mode -->
        <div class="divider-row">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <!-- Guest mode button -->
        <button
          id="guestBtn"
          class="guest-button full-width"
        >
          Continue as guest
        </button>

        <!-- Guest mode explanation -->
        <p class="helper-note">
          Guest mode lets you add one plant and view care guidance,
          but it will not be saved to the database.
        </p>

        <!-- Authentication status/error messages -->
        <p id="authMessage" class="helper-text"></p>
      </section>
    </div>
  `;
}