// --- DOM Elements ---
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('select-files-btn');
const processBtn = document.getElementById('process-btn');
const statusMessage = document.getElementById('status-message');
const fileList = document.getElementById('file-list');
const downloadZipBtn = document.getElementById('download-zip-btn');

// --- Settings ---
const outputFormatEl = document.getElementById('output-format');
const maxWidthEl = document.getElementById('max-width');
const qualityEl = document.getElementById('quality');

// --- Global State ---
let imageFiles = [];
let processedBlobs = [];
const mimeMap = {
    'webp': 'image/webp',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
};

// --- Event Listeners ---

// 1. Handle File Input (Button Click)
selectFilesBtn.addEventListener('click', () => fileInput.click());

// 2. Handle File Drop/Select
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#e0ffe0'; });
dropArea.addEventListener('dragleave', () => { dropArea.style.backgroundColor = '#fafafa'; });
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// 3. Handle Process Button Click
processBtn.addEventListener('click', processImages);

// 4. Handle ZIP Download Button Click
downloadZipBtn.addEventListener('click', downloadZip);

// --- Functions ---

function handleDrop(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#fafafa';
    const dt = e.dataTransfer;
    handleFiles(dt.files);
}

function handleFiles(files) {
    // Filter for only image files
    imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    processedBlobs = [];
    fileList.innerHTML = '';
    
    if (imageFiles.length > 0) {
        statusMessage.textContent = `${imageFiles.length} images ready to process.`;
        processBtn.textContent = `Start Processing (${imageFiles.length} files)`;
        processBtn.disabled = false;
        downloadZipBtn.disabled = true;
    } else {
        statusMessage.textContent = 'Awaiting images...';
        processBtn.textContent = 'Start Processing (0 files)';
        processBtn.disabled = true;
    }
}

async function processImages() {
    processBtn.disabled = true;
    downloadZipBtn.disabled = true;
    statusMessage.textContent = 'Processing images... This may take a moment.';
    fileList.innerHTML = '';
    processedBlobs = [];

    const format = outputFormatEl.value;
    const maxWidth = parseInt(maxWidthEl.value);
    const quality = parseFloat(qualityEl.value);
    const mimeType = mimeMap[format];

    for (const file of imageFiles) {
        // Wait for each image to be processed before moving to the next
        await processSingleImage(file, maxWidth, mimeType, quality);
    }

    statusMessage.textContent = `Finished processing ${imageFiles.length} images!`;
    if (processedBlobs.length > 0) {
        downloadZipBtn.disabled = false;
    }
    processBtn.disabled = false;
}

function processSingleImage(file, maxWidth, mimeType, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 1. Resizing logic
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 2. Compression/Format Conversion logic (toBlob does the work)
                canvas.toBlob((blob) => {
                    const originalSizeKB = (file.size / 1024).toFixed(1);
                    const newSizeKB = (blob.size / 1024).toFixed(1);

                    // Determine the new file name
                    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const newFileName = `${baseName}_optimized.${mimeType.split('/')[1]}`;

                    processedBlobs.push({ blob, name: newFileName });

                    // 3. Display Results
                    displayResult({
                        originalName: file.name,
                        newName: newFileName,
                        originalSize: originalSizeKB,
                        newSize: newSizeKB
                    });
                    
                    resolve();
                }, mimeType, quality);
            };
            img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function displayResult(info) {
    const div = document.createElement('div');
    div.classList.add('file-info');
    div.innerHTML = `
        <span>${info.originalName} &rarr; ${info.newName}</span>
        <span style="font-weight: bold; color: ${info.newSize < info.originalSize ? 'green' : 'red'};">
            ${info.originalSize} KB &rarr; ${info.newSize} KB
        </span>
    `;
    fileList.appendChild(div);
}

function downloadZip() {
    const zip = new JSZip();
    
    statusMessage.textContent = 'Generating ZIP file...';
    
    // Add all processed images (blobs) to the ZIP file
    processedBlobs.forEach(item => {
        zip.file(item.name, item.blob);
    });

    // Generate the ZIP file and trigger download
    zip.generateAsync({ type: 'blob' })
    .then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized_images.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        statusMessage.textContent = 'ZIP file downloaded successfully!';
    })
    .catch(() => {
        statusMessage.textContent = 'Error creating ZIP file.';
    });
}

// Additional handlers for drag and drop visual feedback
dropArea.addEventListener('dragenter', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#e0ffe0'; });
dropArea.addEventListener('dragleave', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#fafafa'; });
dropArea.addEventListener('drop', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#fafafa'; });