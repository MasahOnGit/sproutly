import { api } from './api.js';
import { state } from './state.js';
import {
    loadPlants,
    loadWeather,
    loadCareGuide,
    buildPlantPayload
} from './features.js';

const qs = (selector) => document.querySelector(selector);

let cameraStream = null;

function setupPlantCamera() {
    const video = qs('#plantCamera');
    const canvas = qs('#plantCanvas');
    const preview = qs('#capturedPlantPreview');
    const photoUrlInput = qs('#photoUrlInput');
    const startBtn = qs('#startCameraBtn');
    const captureBtn = qs('#capturePlantBtn');
    const stopBtn = qs('#stopCameraBtn');
    const analyzeBtn = qs('#analyzePlantBtn');
    const message = qs('#cameraMessage');
    const plantForm = qs('#plantForm');

    if (!video || !canvas || !startBtn) return;

    async function startCamera() {
        try {
            message.textContent = '';

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            video.srcObject = cameraStream;
            video.classList.remove('hidden');
            captureBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
        } catch (error) {
            message.textContent = error.message || 'Plant scanning failed.';
            console.error(error);        }
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }

        video.srcObject = null;
        video.classList.add('hidden');
        captureBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }

    function capturePhoto() {
        if (!cameraStream) {
            message.textContent = 'Start the camera first.';
            return;
        }

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, width, height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        photoUrlInput.value = imageDataUrl;
        preview.src = imageDataUrl;
        preview.classList.remove('hidden');

        message.textContent = 'Photo captured. You can now add the plant.';
        stopCamera();
    }

    async function analyzePlant() {
        const image = photoUrlInput.value;

        console.log('Scan button clicked');
        console.log('Image exists:', !!image);
        console.log('Sending scan request to /plant-identify');

        if (!image) {
            message.textContent = 'Take a photo first, then scan it.';
            return;
        }

        try {
            message.textContent = 'Scanning plant...';

            const result = await api('/plant-identify', {
                method: 'POST',
                body: JSON.stringify({
                    image,
                    hint: plantForm.querySelector('[name="type"]')?.value ||
                        plantForm.querySelector('[name="name"]')?.value ||
                        'Basil'
                })
            });

            const nameInput = plantForm.querySelector('[name="name"]');
            const typeInput = plantForm.querySelector('[name="type"]');
            const speciesSlugInput = plantForm.querySelector('[name="speciesSlug"]');
            const notesInput = plantForm.querySelector('[name="notes"]');

            if (result.commonName) {
                nameInput.value = result.commonName;
                typeInput.value = result.commonName;
            }

            if (result.scientificName) {
                speciesSlugInput.value = result.scientificName
                    .toLowerCase()
                    .replaceAll(' ', '-');
            }

            if (result.careTips) {
                notesInput.value = result.careTips;
            }

            message.textContent = result.commonName
                ? `Looks like: ${result.commonName}`
                : 'Scan finished, but no plant match was found.';
        } catch (error) {
            message.textContent = 'Plant scanning needs a backend API at /plant-identify.';
        }
    }

    startBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', capturePhoto);
    stopBtn.addEventListener('click', stopCamera);
    analyzeBtn.addEventListener('click', analyzePlant);
}

export function setupDashboardForms() {
    const plantForm = qs('#plantForm');
    const weatherForm = qs('#weatherForm');
    const careForm = qs('#careForm');
    const refreshPlantsBtn = qs('#refreshPlantsBtn');
    const guestLimitMessage = qs('#guestLimitMessage');

    setupPlantCamera();

    plantForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        guestLimitMessage.textContent = '';

        const payload = buildPlantPayload(plantForm);

        console.log('Current mode:', state.mode);
        console.log('Saving payload:', payload);

        if (state.mode === 'guest') {
            if (state.guestPlants.length >= 1) {
                guestLimitMessage.textContent = 'Guest users can only add one plant.';
                return;
            }

            payload.id = Date.now();
            state.guestPlants = [payload];

            await loadPlants();
            await loadCareGuide(payload.type || payload.name || 'Monstera');
            plantForm.reset();

            qs('#capturedPlantPreview')?.classList.add('hidden');
            return;
        }

        try {
            await api('/plants', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            plantForm.reset();
            qs('#capturedPlantPreview')?.classList.add('hidden');

            await loadPlants();
            await loadCareGuide(payload.type || payload.name || 'Monstera');
        } catch (error) {
            guestLimitMessage.textContent = error.message || 'Could not add plant.';
        }
    });

    weatherForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const city = qs('#cityInput')?.value?.trim() || 'Vienna';
        await loadWeather(city);
    });

    careForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plant = qs('#careInput')?.value?.trim() || 'Monstera';
        await loadCareGuide(plant);
    });

    refreshPlantsBtn?.addEventListener('click', async () => {
        guestLimitMessage.textContent = '';
        await loadPlants();
    });
}