// CDN Configuration
const PDF_FILENAME = 'BOLETTE 画册_1_1.pdf';

// Embedded Page Flip Sound (Base64) to ensure it works offline/locally without external URL issues
// Short "paper flip" sound
const FLIP_SOUND_BASE64 = 'data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1xUAAldjYtvi91uIwDBsJ9/GYlJvIwDD0/GOIwDfIGGYGHkYBPMKQlk9f85/yTn/aPBQO//iP4//6/w8WSi+WFc6CL9/2/8mZf5/8fP/8f\
8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/\
8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f\
/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f/8f\
/8f/8f/8f/8f/8f/8f/8f/8f/8gAAA0gAAAB5jN6tantAIoAuaVkD4idglTTo+M7J8/kiZvo05e99967Wv9cs//94cM/k+5WREoG8h/nCwBbqa7cKEACjv9wCDgOA1owAAv19v9+C+QJ/FhAGKr7idZ/4wJ//uQRAAAAKGN/3\
rLdAArE3/est0AABAf/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n\
/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1\
n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OAB1n/n358OA==';

let pdfDoc = null;
let pageFlip = null;
let isPageRendering = false;
let flipSound = new Audio(FLIP_SOUND_BASE64);
let currentZoom = 1;

// UI Elements
const loader = document.getElementById('loader');
const container = document.getElementById('flipbook');
const bookContainer = document.querySelector('.book-container'); // Wrapper for zoom
const pageInfo = document.getElementById('page-info');
const errorZone = document.getElementById('error-zone');
const fileInput = document.getElementById('file-upload');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Try to load the default PDF
    loadPDF(PDF_FILENAME).catch(err => {
        console.warn("Auto-load failed. Showing upload option.", err);
        loader.classList.add('hidden');
        errorZone.style.display = 'block';
    });

    // Handle manual upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            errorZone.style.display = 'none';
            loader.classList.remove('hidden');
            loadPDF(fileURL);
        } else {
            alert('Please select a valid PDF file.');
        }
    });

    // Navigation and Zoom Buttons
    document.getElementById('prev-btn').addEventListener('click', () => pageFlip?.flipPrev());
    document.getElementById('next-btn').addEventListener('click', () => pageFlip?.flipNext());

    document.getElementById('zoom-in').addEventListener('click', () => handleZoom(0.2));
    document.getElementById('zoom-out').addEventListener('click', () => handleZoom(-0.2));
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
});

function handleZoom(delta) {
    const newZoom = currentZoom + delta;
    if (newZoom < 1) return; // Prevent zooming out consistently
    if (newZoom > 3) return; // Max zoom

    currentZoom = newZoom;

    // Apply transform
    container.style.transform = `scale(${currentZoom})`;
    container.style.transformOrigin = 'center center';

    // Adjust container overflow
    if (currentZoom > 1) {
        bookContainer.style.overflow = 'auto';
        bookContainer.style.cursor = 'grab';
    } else {
        bookContainer.style.overflow = 'hidden';
        bookContainer.style.cursor = 'default';
        container.style.transform = 'none'; // Clean reset
        currentZoom = 1;
    }
}

function toggleSound() {
    flipSound.muted = !flipSound.muted;
    const btn = document.getElementById('sound-toggle');
    const icon = btn.querySelector('i');

    if (flipSound.muted) {
        icon.className = 'fas fa-volume-mute';
        btn.style.opacity = '0.5';
    } else {
        icon.className = 'fas fa-volume-up';
        btn.style.opacity = '1';
        // Try play a short blip to confirm
        playSound();
    }
}

async function loadPDF(url) {
    try {
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(url);
        pdfDoc = await loadingTask.promise;

        console.log('PDF Loaded. Pages:', pdfDoc.numPages);

        await renderBook();

        loader.classList.add('hidden');
    } catch (error) {
        console.error('Error loading PDF:', error);
        throw error;
    }
}

async function renderBook() {
    container.innerHTML = ''; // Clear existing

    const pixelRatio = window.devicePixelRatio || 1;

    // We need to fetch page 1 to get dimensions
    const page1 = await pdfDoc.getPage(1);
    const viewport = page1.getViewport({ scale: 1 });

    // Determine scale to fit screen
    const availableHeight = window.innerHeight * 0.85;
    const availableWidth = window.innerWidth * 0.9;

    // Scale based on height OR width (for 2 pages)
    const scaleH = availableHeight / viewport.height;
    const scaleW = availableWidth / (viewport.width * 2);

    const scale = Math.min(scaleH, scaleW);

    // Setup the PageFlip
    pageFlip = new St.PageFlip(document.getElementById('flipbook'), {
        width: viewport.width * scale, // base page width
        height: viewport.height * scale, // base page height
        size: 'fixed',
        minWidth: viewport.width * scale,
        minHeight: viewport.height * scale,
        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: false, // Force 2-page spread
        startPage: 0
    });

    // Generate canvases
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const div = document.createElement('div');
        div.className = 'page-content';
        div.style.backgroundColor = 'white';

        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas';
        div.appendChild(canvas);
        container.appendChild(div);
    }

    // Load the FlipBook from the HTML elements
    pageFlip.loadFromHTML(document.querySelectorAll('.page-content'));

    // Update UI events
    pageFlip.on('flip', (e) => {
        updatePageInfo();
        playSound();
        renderVisiblePages();
    });

    // Initial Render
    await renderVisiblePages();
    updatePageInfo();
}

function updatePageInfo() {
    if (!pageFlip) return;
    const current = pageFlip.getCurrentPageIndex() + 1;
    const total = pageFlip.getPageCount();
    pageInfo.textContent = `${current} / ${total}`;
}

async function renderVisiblePages() {
    if (!pageFlip || !pdfDoc) return;

    const current = pageFlip.getCurrentPageIndex();
    const range = [current, current + 1, current + 2, current + 3, current - 1, current - 2];

    const canvasList = document.querySelectorAll('.page-canvas');

    for (const pageIdx of range) {
        if (pageIdx >= 0 && pageIdx < pdfDoc.numPages) {
            await renderPageToCanvas(pageIdx + 1, canvasList[pageIdx]);
        }
    }
}

async function renderPageToCanvas(pageNumber, canvas) {
    if (!canvas || canvas.dataset.rendered === 'true') return;

    try {
        const page = await pdfDoc.getPage(pageNumber);

        // High quality scale for crisp zooming
        const outputScale = 2.0;
        const viewport = page.getViewport({ scale: outputScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        const context = canvas.getContext('2d');
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        canvas.dataset.rendered = 'true';

    } catch (e) {
        console.error("Render error page " + pageNumber, e);
    }
}

function playSound() {
    if (flipSound.muted) return;
    const sound = flipSound.cloneNode();
    sound.volume = 0.5;
    sound.play().catch(e => {
        // console.log("Audio play prevented", e); 
        // Expected if no interaction yet
    });
}
