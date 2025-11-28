// --- DOM Elements ---
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('select-files-btn');
const processBtn = document.getElementById('process-btn');
const clearBtn = document.getElementById('clear-btn'); // New element
const statusMessage = document.getElementById('status-message');
const statusMessageResults = document.getElementById('status-message-results'); // New element for results section status
const fileList = document.getElementById('file-list');
const downloadZipBtn = document.getElementById('download-zip-btn');
const resultsSection = document.getElementById('results-section'); // New element to show/hide results

// --- Settings Elements ---
const outputFormatEl = document.getElementById('output-format');
const maxWidthEl = document.getElementById('max-width');
const qualityEl = document.getElementById('quality');
const qualityValueEl = document.getElementById('quality-value');

// --- Global State ---
let imageFiles = [];
let processedBlobs = [];
const mimeMap = {
    'webp': 'image/webp',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'keep': 'keep'
};

// --- Initial Event Listeners ---

// 1. Handle File Input (Button Click)
selectFilesBtn.addEventListener('click', () => fileInput.click());

// 2. Handle File Drop/Select
dropArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// 3. Handle Process Button Click
processBtn.addEventListener('click', processImages);

// 4. Handle ZIP Download Button Click
downloadZipBtn.addEventListener('click', downloadZip);

// 5. Handle Clear Button
clearBtn.addEventListener('click', clearFiles);

// 6. Listener for Range Slider to update the number display
qualityEl.addEventListener('input', (e) => {
    qualityValueEl.textContent = e.target.value;
});

// 7. Drag and Drop visual feedback handlers
dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#2c333a'; dropArea.style.borderColor = '#61afef'; });
dropArea.addEventListener('dragleave', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#242930'; dropArea.style.borderColor = '#3c4450'; });
dropArea.addEventListener('dragenter', (e) => { e.preventDefault(); dropArea.style.backgroundColor = '#2c333a'; dropArea.style.borderColor = '#61afef'; });


// --- Main Functions ---

function clearFiles() {
    imageFiles = [];
    processedBlobs = [];
    fileInput.value = '';
    statusMessage.textContent = '0 file(s) ready';
    processBtn.disabled = true;
    resultsSection.style.display = 'none';
    fileList.innerHTML = '';
}

function handleDrop(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#242930';
    dropArea.style.borderColor = '#3c4450';
    const dt = e.dataTransfer;
    handleFiles(dt.files);
}

function handleFiles(files) {
    // Filter for only image files
    imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    processedBlobs = [];
    fileList.innerHTML = '';
    
    if (imageFiles.length > 0) {
        statusMessage.textContent = `${imageFiles.length} file(s) ready`;
        processBtn.disabled = false;
        resultsSection.style.display = 'none';
    } else {
        clearFiles();
    }
}

async function processImages() {
    if (imageFiles.length === 0) return;

    processBtn.disabled = true;
    downloadZipBtn.disabled = true;
    resultsSection.style.display = 'block';
    statusMessageResults.textContent = `Processing ${imageFiles.length} images...`;
    fileList.innerHTML = '';
    processedBlobs = [];

    const format = outputFormatEl.value;
    const maxWidth = parseInt(maxWidthEl.value);
    const quality = parseFloat(qualityEl.value);
    const targetMimeType = format === 'keep' ? null : mimeMap[format];

    for (const file of imageFiles) {
        // Wait for each image to be processed before moving to the next
        await processSingleImage(file, maxWidth, targetMimeType, quality);
    }

    statusMessageResults.textContent = `Finished processing ${imageFiles.length} images!`;
    if (processedBlobs.length > 0) {
        downloadZipBtn.disabled = false;
    }
    processBtn.disabled = false;
}

function processSingleImage(file, maxWidth, targetMimeType, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Determine final dimensions
                if (maxWidth > 0 && width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Determine the mime type for output
                const outputMimeType = targetMimeType || file.type;
                
                // Get the blob from the canvas
                canvas.toBlob((blob) => {
                    const originalSizeKB = (file.size / 1024).toFixed(1);
                    const newSizeKB = (blob.size / 1024).toFixed(1);

                    // Determine the new file name
                    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    // Get extension based on the final output mime type
                    const extension = outputMimeType.split('/')[1] || file.name.split('.').pop(); 
                    const newFileName = `${baseName}_optimized.${extension}`;

                    processedBlobs.push({ blob, name: newFileName });

                    // Display Results
                    displayResult({
                        originalName: file.name,
                        newName: newFileName,
                        originalSize: originalSizeKB,
                        newSize: newSizeKB
                    });
                    
                    resolve();
                }, outputMimeType, outputMimeType === 'image/png' ? 1.0 : quality); // PNG quality is ignored, so use 1.0
            };
            img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function displayResult(info) {
    const div = document.createElement('div');
    div.classList.add('file-info');
    
    const sizeComparison = `<span style="color: ${info.newSize < info.originalSize ? '#28a745' : '#dc3545'};">
        ${info.originalSize} KB &rarr; ${info.newSize} KB
    </span>`;

    div.innerHTML = `
        <span>${info.originalName} &rarr; ${info.newName}</span>
        ${sizeComparison}
    `;
    fileList.appendChild(div);
}

function downloadZip() {
    const zip = new JSZip();
    
    statusMessageResults.textContent = 'Generating ZIP file...';
    downloadZipBtn.disabled = true;
    
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
        statusMessageResults.textContent = 'ZIP file downloaded successfully!';
        downloadZipBtn.disabled = false;
    })
    .catch(() => {
        statusMessageResults.textContent = 'Error creating ZIP file.';
        downloadZipBtn.disabled = false;
    });
}
