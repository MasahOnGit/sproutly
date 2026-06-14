/**
 * Renders the main dashboard screen for the application.
 *
 * The dashboard includes:
 * - User statistics
 * - Plant collection management
 * - Plant creation form
 * - Camera-based plant scanning
 * - Weather-based watering advice
 * - Plant care guide lookup
 *
 * Dynamic elements inside this template are updated
 * later using JavaScript event listeners and API responses.
 *
 * @returns {string} HTML markup for the dashboard screen
 */
export function renderDashboardScreen() {
    return `
    <div class="layout-grid">

      <!-- Dashboard hero section -->
      <section class="hero-card card glass dashboard-hero">
        <div>
          <h2>Your dashboard</h2>
          <p class="lede" id="dashboardIntro">Welcome to your care space.</p>
        </div>

        <!-- Decorative plant illustration -->
        <div class="dashboard-plant-art" aria-hidden="true">
          <div class="mini-plant-pot"></div>
          <div class="mini-plant-stem mini-stem-a"></div>
          <div class="mini-plant-stem mini-stem-b"></div>
          <div class="mini-leaf mini-leaf-a"></div>
          <div class="mini-leaf mini-leaf-b"></div>
          <div class="mini-leaf mini-leaf-c"></div>
        </div>
      </section>

      <!-- Current user mode card -->
      <section class="login-card card compact-info">
        <p class="eyebrow">Current mode</p>
        <h3 id="modeTitle">Guest Mode</h3>
        <p id="modeDescription" class="lede small-lede">
          You can add one plant and get care guidance.
        </p>
      </section>

      <!-- Dashboard statistics -->
      <section class="stats-row">
        <article class="card stat-card">
          <p class="stat-label">Plants</p>
          <strong id="plantCount">0</strong>
        </article>

        <article class="card stat-card">
          <p class="stat-label">Need watering soon</p>
          <strong id="wateringCount">0</strong>
        </article>

        <article class="card stat-card">
          <p class="stat-label">Weather</p>
          <strong id="weatherTemp">--°C</strong>
        </article>
      </section>

      <!-- Plant dashboard and plant creation form -->
      <section class="card panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">My collection</p>
            <h2>Plant dashboard</h2>
          </div>
        </div>

        <!-- Form used to add a new plant -->
        <form id="plantForm" class="plant-form">

          <label>
            Name
            <input type="text" name="name" placeholder="Monstera Mia" required>
          </label>

          <label>
            Type
            <input type="text" name="type" placeholder="Monstera" required>
          </label>

          <label>
            Species slug
            <input type="text" name="speciesSlug" placeholder="monstera-deliciosa">
          </label>

          <label>
            Photo URL
            <input
              type="url"
              name="photoUrl"
              id="photoUrlInput"
              placeholder="https://..."
            >
          </label>

          <!-- Camera and plant scanning tools -->
          <div class="camera-box">

            <!-- Live camera preview -->
            <video
              id="plantCamera"
              class="camera-preview hidden"
              autoplay
              playsinline
            ></video>

            <!-- Canvas used for captured image processing -->
            <canvas id="plantCanvas" class="hidden"></canvas>

            <!-- Preview of the captured image -->
            <img
              id="capturedPlantPreview"
              class="captured-preview hidden"
              alt="Captured plant preview"
            >

            <!-- Camera action buttons -->
            <div class="camera-actions">
              <button
                type="button"
                class="ghost-button"
                id="startCameraBtn"
              >
                Use camera
              </button>

              <button
                type="button"
                class="ghost-button hidden"
                id="capturePlantBtn"
              >
                Take photo
              </button>

              <button
                type="button"
                class="ghost-button hidden"
                id="stopCameraBtn"
              >
                Stop camera
              </button>

              <button
                type="button"
                class="ghost-button"
                id="analyzePlantBtn"
              >
                Scan plant
              </button>
            </div>

            <!-- Camera status/error messages -->
            <p id="cameraMessage" class="helper-text"></p>
          </div>

          <label>
            Location
            <input type="text" name="location" placeholder="Living room">
          </label>

          <label>
            Water interval (days)
            <input
              type="number"
              name="wateringIntervalDays"
              min="1"
              max="30"
              value="7"
            >
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              rows="3"
              placeholder="Bright indirect light"
            ></textarea>
          </label>

          <!-- Submits the plant form -->
          <button
            type="submit"
            class="primary-button"
            id="addPlantBtn"
          >
            Add plant
          </button>
        </form>

        <!-- Guest mode limitation message -->
        <p id="guestLimitMessage" class="guest-limit-message"></p>

        <!-- Dynamically rendered plant cards -->
        <div
          id="plantGrid"
          class="plant-grid"
          aria-live="polite"
        ></div>
      </section>

      <!-- Weather advice section -->
      <section class="card panel info-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Weather suggestion</p>
            <h2>Watering tips</h2>
          </div>

          <!-- Weather search form -->
          <form id="weatherForm" class="inline-form">
            <label class="sr-only" for="cityInput">City</label>

            <input
              id="cityInput"
              type="text"
              value="Vienna"
              placeholder="Enter city"
            >

            <button class="ghost-button" type="submit">
              Check
            </button>
          </form>
        </div>

        <!-- Weather results -->
        <div id="weatherCard" class="soft-panel"></div>
      </section>

      <!-- Plant care guide lookup section -->
      <section class="card panel info-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Plant care API</p>
            <h2>Care guide lookup</h2>
          </div>

          <!-- Plant care search form -->
          <form id="careForm" class="inline-form">
            <label class="sr-only" for="careInput">Plant</label>

            <input
              id="careInput"
              type="text"
              value="Monstera"
              placeholder="Search plant care"
            >

            <button class="ghost-button" type="submit">
              Search
            </button>
          </form>
        </div>

        <!-- Care guide results -->
        <div id="careCard" class="soft-panel"></div>
      </section>
    </div>
  `;
}