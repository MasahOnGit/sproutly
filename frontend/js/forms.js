import { api } from './api.js';
import { state } from './state.js';

import {
    loadPlants,
    loadWeather,
    loadCareGuide,
    buildPlantPayload
} from './features.js';

/**
 * Shortcut for selecting a single element from the page.
 *
 * @param {string} selector CSS selector
 * @returns {Element|null} matching element or null
 */
const qs = (selector) => document.querySelector(selector);

/**
 * Stores the currently active camera stream.
 *
 * This is used so the stream can later be stopped properly.
 */
let cameraStream = null;

/**
 * Sets up all plant camera and plant scanning functionality.
 *
 * This includes:
 * - Starting the device camera
 * - Capturing a plant photo
 * - Previewing the captured image
 * - Sending the image to the plant identification API
 */
function setupPlantCamera() {

    // Camera-related elements
    const video = qs('#plantCamera');
    const canvas = qs('#plantCanvas');
    const preview = qs('#capturedPlantPreview');
    const photoUrlInput = qs('#photoUrlInput');

    // Camera action buttons
    const startBtn = qs('#startCameraBtn');
    const captureBtn = qs('#capturePlantBtn');
    const stopBtn = qs('#stopCameraBtn');
    const analyzeBtn = qs('#analyzePlantBtn');

    // Status message area
    const message = qs('#cameraMessage');

    // Plant creation form
    const plantForm = qs('#plantForm');

    // Stop setup if required elements are missing
    if (!video || !canvas || !startBtn) return;

    /**
     * Starts the device camera.
     *
     * Uses the environment-facing camera when available.
     */
    async function startCamera() {
        try {
            message.textContent = '';

            // Request camera access from the browser
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            // Attach the stream to the video preview
            video.srcObject = cameraStream;

            // Update UI state
            video.classList.remove('hidden');
            captureBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');

        } catch (error) {
            message.textContent =
                error.message || 'Plant scanning failed.';

            console.error(error);
        }
    }

    /**
     * Stops the active camera stream and resets the UI.
     */
    function stopCamera() {

        // Stop all active camera tracks
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }

        // Remove video stream
        video.srcObject = null;

        // Reset camera UI
        video.classList.add('hidden');
        captureBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }

    /**
     * Captures the current camera frame as an image.
     *
     * The image is converted into a base64 data URL
     * and stored inside the form.
     */
    function capturePhoto() {

        // Ensure the camera is active
        if (!cameraStream) {
            message.textContent = 'Start the camera first.';
            return;
        }

        const width = video.videoWidth;
        const height = video.videoHeight;

        // Resize the canvas to match the video frame
        canvas.width = width;
        canvas.height = height;

        // Draw the current video frame onto the canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, width, height);

        // Convert the canvas image into a compressed JPEG data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Store the image inside the hidden form field
        photoUrlInput.value = imageDataUrl;

        // Show image preview
        preview.src = imageDataUrl;
        preview.classList.remove('hidden');

        message.textContent =
            'Photo captured. You can now add the plant.';

        // Stop the camera after capture
        stopCamera();
    }

    /**
     * Sends the captured image to the backend plant identification API.
     *
     * The API response is used to automatically fill parts
     * of the plant form.
     */
    async function analyzePlant() {

        // Get the captured image
        const image = photoUrlInput.value;

        console.log('Scan button clicked');
        console.log('Image exists:', !!image);
        console.log('Sending scan request to /plant-identify');

        // Ensure an image exists before scanning
        if (!image) {
            message.textContent =
                'Take a photo first, then scan it.';

            return;
        }

        try {
            message.textContent = 'Scanning plant...';

            // Send image to the backend API
            const result = await api('/plant-identify', {
                method: 'POST',

                body: JSON.stringify({
                    image,

                    // Provide a fallback hint to improve detection
                    hint:
                        plantForm.querySelector('[name="type"]')?.value ||
                        plantForm.querySelector('[name="name"]')?.value ||
                        'Basil'
                })
            });

            // Form fields that may be automatically updated
            const nameInput =
                plantForm.querySelector('[name="name"]');

            const typeInput =
                plantForm.querySelector('[name="type"]');

            const speciesSlugInput =
                plantForm.querySelector('[name="speciesSlug"]');

            const notesInput =
                plantForm.querySelector('[name="notes"]');

            // Fill common name
            if (result.commonName) {
                nameInput.value = result.commonName;
                typeInput.value = result.commonName;
            }

            // Fill scientific name slug
            if (result.scientificName) {
                speciesSlugInput.value = result.scientificName
                    .toLowerCase()
                    .replaceAll(' ', '-');
            }

            // Fill care tips
            if (result.careTips) {
                notesInput.value = result.careTips;
            }

            // Show scan result message
            message.textContent = result.commonName
                ? `Looks like: ${result.commonName}`
                : 'Scan finished, but no plant match was found.';

        } catch (error) {

            // Show fallback message if scanning fails
            message.textContent =
                'Plant scanning needs a backend API at /plant-identify.';
        }
    }

    // Camera action event listeners
    startBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', capturePhoto);
    stopBtn.addEventListener('click', stopCamera);
    analyzeBtn.addEventListener('click', analyzePlant);
}

/**
 * Sets up all dashboard form functionality.
 *
 * This includes:
 * - Plant creation
 * - Plant editing
 * - Weather lookup
 * - Care guide lookup
 * - Plant list refresh
 */
export function setupDashboardForms() {

    // Dashboard form elements
    const plantForm = qs('#plantForm');
    const weatherForm = qs('#weatherForm');
    const careForm = qs('#careForm');

    // Dashboard controls
    const refreshPlantsBtn = qs('#refreshPlantsBtn');

    // Guest mode warning message
    const guestLimitMessage = qs('#guestLimitMessage');

    // Initialize camera functionality
    setupPlantCamera();

    /**
     * Handles plant form submission.
     */
    plantForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        guestLimitMessage.textContent = '';

        const editingId = plantForm.dataset.editingId || null;

        // Build plant object from form fields
        const payload = buildPlantPayload(plantForm);

        console.log('Current mode:', state.mode);
        console.log('Saving payload:', payload);

        // Guest mode logic
        if (state.mode === 'guest') {
            try {
                if (editingId) {
                    const i = state.guestPlants.findIndex(p => String(p.id) === String(editingId));
                    if (i !== -1) {
                        // map form values to fields
                        const updatePayload = {
                            name: plantForm.elements['name']?.value ?? '',
                            type: plantForm.elements['type']?.value ?? '',
                            speciesSlug: plantForm.elements['speciesSlug']?.value ?? '',
                            photoUrl: plantForm.elements['photoUrl']?.value ?? '',
                            location: plantForm.elements['location']?.value ?? '',
                            notes: plantForm.elements['notes']?.value ?? '',
                            wateringIntervalDays: Number(plantForm.elements['wateringIntervalDays']?.value || 7),
                            //lastWatered: plantForm.elements['lastWatered']?.value ?? payload.lastWatered,
                        };
                        state.guestPlants[i] = { ...state.guestPlants[i], ...updatePayload };
                    }
                } else {
                    // Limit guest users to one plant
                    if (state.guestPlants.length >= 1) {
                        guestLimitMessage.textContent =
                            'Guest users can only add one plant.';

                        return;
                    }

                    // Create temporary guest plant
                    payload.id = Date.now();

                    state.guestPlants = [payload];
                }

                // Refresh UI
                await loadPlants();

                // Load care guide for the added plant
                await loadCareGuide(
                    payload.type || payload.name || 'Monstera'
                );

                // Reset form
                delete plantForm.dataset.editingId;
                plantForm.reset();
                qs('#capturedPlantPreview')?.classList.add('hidden');
                const interval = plantForm.querySelector('input[name="wateringIntervalDays"]');
                if (interval) interval.value = 7;
            }

            catch (error) {
                guestLimitMessage.textContent = error.message || 'Could not save plant.';// Hide image preview
                qs('#capturedPlantPreview')?.classList.add('hidden');
            }

            return;
        }

        // Logged-in user logic
        try {
            if (editingId) {
                const updatePayload = {
                    name: plantForm.elements['name']?.value || null,
                    type: plantForm.elements['type']?.value || null,
                    speciesSlug: plantForm.elements['speciesSlug']?.value || null,
                    photoUrl: plantForm.elements['photoUrl']?.value || null,
                    location: plantForm.elements['location']?.value || null,
                    notes: plantForm.elements['notes']?.value || null,
                    wateringIntervalDays: (plantForm.elements['wateringIntervalDays']?.value !== ''
                        ? Number(plantForm.elements['wateringIntervalDays'].value)
                        : null),
                    //lastWatered: plantForm.elements['lastWatered']? (plantForm.elements['lastWatered'].value || null)
                    //: null,

                };

                await api(`/plants/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });
            } else {
                // Save plant to backend database
                await api('/plants', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            // Reset form
            delete plantForm.dataset.editingId;
            plantForm.reset();
            qs('#capturedPlantPreview')?.classList.add('hidden');
            const interval = plantForm.querySelector('input[name="wateringIntervalDays"]');
            if (interval) interval.value = 7;

            // Hide image preview
            qs('#capturedPlantPreview')?.classList.add('hidden');

            // Reload plants
            await loadPlants();

            // Load care guide for the new plant
            await loadCareGuide(
                payload.type || payload.name || 'Monstera'
            );

        } catch (error) {
            guestLimitMessage.textContent =
                error.message || 'Could not add plant.';
        }
    });

    /**
     * Handles weather search form submission.
     */
    weatherForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const city =
            qs('#cityInput')?.value?.trim() || 'Vienna';

        await loadWeather(city);
    });

    /**
     * Handles care guide search form submission.
     */
    careForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const plant =
            qs('#careInput')?.value?.trim() || 'Monstera';

        await loadCareGuide(plant);
    });

    /**
     * Reloads the plant list when the refresh button is clicked.
     */
    refreshPlantsBtn?.addEventListener('click', async () => {
        guestLimitMessage.textContent = '';

        await loadPlants();
    });

    /**
     * Reusing creation form for edit plant
     */

    const grid = document.querySelector('#plantGrid');
    grid?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-edit]');
        if (!btn) return;

        // Use parseInt to avoid any "Number is not defined" confusion
        const id = parseInt(btn.dataset.edit, 10);
        const list = state.mode === 'guest' ? state.guestPlants : state.plants;
        const plant = list.find(p => parseInt(p.id, 10) === id);
        if (plant) startEditPlant(plant);
    });
}

export function startEditPlant(plant) {
    const form = qs('#plantForm');
    const submitBtn = qs('#addPlantBtn');
    const heading = qs('.section-head h2');

    if (!form || !submitBtn) return;

    // Prefill form with existing data
    form.elements['name'].value = plant.name ?? '';
    if (form.elements['type']) {
        form.elements['type'].value = plant.type ?? plant.species ?? '';
    }
    if (form.elements['speciesSlug']) {
        form.elements['speciesSlug'].value =
            plant.speciesSlug ?? (plant.species?.toLowerCase().replaceAll(' ', '-') || '');
    }
    if (form.elements['photoUrl']) {
        form.elements['photoUrl'].value = plant.photoUrl ?? '';
    }
    if (form.elements['location']) {
        form.elements['location'].value = plant.location ?? '';
    }
    if (form.elements['wateringIntervalDays']) {
        form.elements['wateringIntervalDays'].value = (plant.wateringIntervalDays ?? 7);
    }
    if (form.elements['notes']) {
        form.elements['notes'].value = plant.notes ?? '';
    }
    // Optional expansion of form: last Watered edit?
    // if (form.elements['lastWatered']) form.elements['lastWatered'].value = plant.lastWatered ?? '';

    // mark form as editing and store id
    form.dataset.editingId = plant.id;

    // update UI labels
    submitBtn.textContent = 'Save changes';
    if (heading) heading.textContent = 'Edit plant';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function cancelEditPlant() {
    const form = qs('#plantForm');
    const submitBtn = qs('#addPlantBtn');
    const heading = qs('.section-head h2');

    if (!form || !submitBtn) return;

    delete form.dataset.editingId;
    form.reset();
    const interval = form.querySelector('input[name="wateringIntervalDays"]');
    if (interval) {
        interval.value = 7;
    }

    submitBtn.textContent = 'Add plant';
    if (heading) {
        heading.textContent = 'Plant dashboard'
    }

    qs('#capturedPlantPreview')?.classList.add('hidden');
}