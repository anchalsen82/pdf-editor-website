// 3D Background Setup
let scene, camera, renderer, particles;

function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particle system
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;

        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.5, 0.7, 0.5 + Math.random() * 0.3);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 1000;

    function animate() {
        requestAnimationFrame(animate);
        
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
        
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Utility Functions
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Photo Enhancement Feature
let enhanceOriginalFile = null;
let enhanceEnhancedBlob = null;

document.getElementById('enhance-upload').addEventListener('click', () => {
    document.getElementById('enhance-input').click();
});

document.getElementById('enhance-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        enhanceOriginalFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('enhance-original').src = event.target.result;
            document.getElementById('enhance-upload').style.display = 'none';
            document.getElementById('enhance-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('enhance-btn').addEventListener('click', async () => {
    if (!enhanceOriginalFile) {
        showToast('Please upload a photo first');
        return;
    }

    // Check if feature is enabled
    const features = JSON.parse(localStorage.getItem('mediapro_features') || '{"enhance":true}');
    if (!features.enhance) {
        showToast('Photo enhancement is currently disabled');
        return;
    }

    showLoading();
    const quality = document.getElementById('enhance-quality').value;
    
    try {
        // Simulate enhancement process (in production, this would call an API)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width, height;
            
            if (quality === 'hd') {
                width = 1920;
                height = 1080;
            } else {
                width = 3840;
                height = 2160;
            }
            
            // Maintain aspect ratio
            const aspectRatio = img.width / img.height;
            if (width / height > aspectRatio) {
                width = height * aspectRatio;
            } else {
                height = width / aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Use high-quality image scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
                canvas.toBlob((blob) => {
                enhanceEnhancedBlob = blob;
                const url = URL.createObjectURL(blob);
                document.getElementById('enhance-enhanced').src = url;
                hideLoading();
                showToast(`Photo enhanced to ${quality.toUpperCase()} successfully!`);
                // Track usage
                if (typeof trackUsage === 'function') {
                    trackUsage('enhance');
                }
            }, 'image/jpeg', 0.95);
        };
        img.src = URL.createObjectURL(enhanceOriginalFile);
    } catch (error) {
        hideLoading();
        showToast('Error enhancing photo. Please try again.');
        console.error(error);
    }
});

document.getElementById('enhance-download').addEventListener('click', () => {
    if (!enhanceEnhancedBlob) {
        showToast('Please enhance the photo first');
        return;
    }
    
    const url = URL.createObjectURL(enhanceEnhancedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download started!');
});

// Photo Compression Feature
let compressOriginalFile = null;
let compressCompressedBlob = null;

document.getElementById('compress-upload').addEventListener('click', () => {
    document.getElementById('compress-input').click();
});

document.getElementById('compress-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        compressOriginalFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('compress-original').src = event.target.result;
            document.getElementById('compress-original-size').textContent = `(${formatFileSize(file.size)})`;
            document.getElementById('compress-upload').style.display = 'none';
            document.getElementById('compress-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('compress-quality').addEventListener('input', (e) => {
    document.getElementById('compress-quality-value').textContent = e.target.value;
});

document.getElementById('compress-btn').addEventListener('click', async () => {
    if (!compressOriginalFile) {
        showToast('Please upload a photo first');
        return;
    }

    // Check if feature is enabled
    const features = JSON.parse(localStorage.getItem('mediapro_features') || '{"compress":true}');
    if (!features.compress) {
        showToast('Photo compression is currently disabled');
        return;
    }

    showLoading();
    const quality = document.getElementById('compress-quality').value / 100;
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                compressCompressedBlob = blob;
                const url = URL.createObjectURL(blob);
                document.getElementById('compress-compressed').src = url;
                document.getElementById('compress-compressed-size').textContent = `(${formatFileSize(blob.size)})`;
                
                const reduction = ((compressOriginalFile.size - blob.size) / compressOriginalFile.size * 100).toFixed(1);
                hideLoading();
                showToast(`Compressed! Size reduced by ${reduction}%`);
                // Track usage
                if (typeof trackUsage === 'function') {
                    trackUsage('compress');
                }
            }, 'image/jpeg', quality);
        };
        img.src = URL.createObjectURL(compressOriginalFile);
    } catch (error) {
        hideLoading();
        showToast('Error compressing photo. Please try again.');
        console.error(error);
    }
});

document.getElementById('compress-download').addEventListener('click', () => {
    if (!compressCompressedBlob) {
        showToast('Please compress the photo first');
        return;
    }
    
    const url = URL.createObjectURL(compressCompressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download started!');
});

// Photo Link Generation Feature
let shareFile = null;
let shareLinkUrl = null;

document.getElementById('share-upload').addEventListener('click', () => {
    document.getElementById('share-input').click();
});

document.getElementById('share-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        shareFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('share-preview').src = event.target.result;
            document.getElementById('share-upload').style.display = 'none';
            document.getElementById('share-link-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('share-generate-btn').addEventListener('click', async () => {
    if (!shareFile) {
        showToast('Please upload a photo first');
        return;
    }

    // Check if feature is enabled
    const features = JSON.parse(localStorage.getItem('mediapro_features') || '{"share":true}');
    if (!features.share) {
        showToast('Link generation is currently disabled');
        return;
    }

    showLoading();
    
    try {
        // Simulate link generation (in production, upload to server and get link)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create a data URL link (in production, this would be a server URL)
        const reader = new FileReader();
        reader.onload = () => {
            shareLinkUrl = reader.result;
            const linkInput = document.getElementById('share-link');
            
            // In production, this would be a server-generated URL
            const mockUrl = `https://mediapro.studio/share/${btoa(shareFile.name).substring(0, 20)}`;
            linkInput.value = mockUrl;
            
            hideLoading();
            showToast('Shareable link generated!');
            // Track usage
            if (typeof trackUsage === 'function') {
                trackUsage('share');
            }
        };
        reader.readAsDataURL(shareFile);
    } catch (error) {
        hideLoading();
        showToast('Error generating link. Please try again.');
        console.error(error);
    }
});

document.getElementById('share-copy-btn').addEventListener('click', () => {
    const linkInput = document.getElementById('share-link');
    if (!linkInput.value) {
        showToast('Please generate a link first');
        return;
    }
    
    linkInput.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!');
});

// PDF Editor Feature
let pdfDoc = null; // pdf-lib document for editing
let pdfJsDoc = null; // pdf.js document for rendering
let pdfPageNum = 1;
let pdfPageCount = 0;
let pdfCanvas = null;
let pdfContext = null;
let pdfFileData = null;

document.getElementById('pdf-upload').addEventListener('click', () => {
    document.getElementById('pdf-input').click();
});

document.getElementById('pdf-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        // Check if feature is enabled
        const features = JSON.parse(localStorage.getItem('mediapro_features') || '{"pdf":true}');
        if (!features.pdf) {
            showToast('PDF editor is currently disabled');
            return;
        }
        
        showLoading();
        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfFileData = arrayBuffer;
            
            // Load with pdf-lib for editing
            pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            pdfPageCount = pdfDoc.getPageCount();
            pdfPageNum = 1;
            
            // Load with pdf.js for rendering (if available)
            if (typeof pdfjsLib !== 'undefined') {
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                pdfJsDoc = await loadingTask;
                pdfPageCount = pdfJsDoc.numPages;
            }
            
            await renderPDFPage();
            
            document.getElementById('pdf-upload').style.display = 'none';
            document.getElementById('pdf-editor').style.display = 'block';
            updatePDFPageInfo();
            hideLoading();
            showToast('PDF loaded successfully!');
            // Track usage
            if (typeof trackUsage === 'function') {
                trackUsage('pdf');
            }
        } catch (error) {
            hideLoading();
            showToast('Error loading PDF. Please try again.');
            console.error(error);
        }
    } else {
        showToast('Please select a valid PDF file');
    }
});

async function renderPDFPage() {
    if (!pdfDoc && !pdfJsDoc) return;
    
    pdfCanvas = document.getElementById('pdf-canvas');
    pdfContext = pdfCanvas.getContext('2d');
    
    try {
        // Use pdf.js for rendering if available
        if (pdfJsDoc && typeof pdfjsLib !== 'undefined') {
            const page = await pdfJsDoc.getPage(pdfPageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: pdfContext,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
        } else {
            // Fallback rendering
            pdfCanvas.width = 800;
            pdfCanvas.height = 1000;
            pdfContext.fillStyle = '#ffffff';
            pdfContext.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
            pdfContext.fillStyle = '#000000';
            pdfContext.font = '20px Arial';
            pdfContext.fillText(`PDF Page ${pdfPageNum} of ${pdfPageCount}`, 50, 50);
            pdfContext.fillText('PDF loaded successfully', 50, 100);
            pdfContext.fillText('Use the toolbar to edit your PDF', 50, 150);
        }
    } catch (error) {
        console.error('Error rendering PDF:', error);
        pdfCanvas.width = pdfCanvas.width || 800;
        pdfCanvas.height = pdfCanvas.height || 600;
        pdfContext.fillStyle = '#ffffff';
        pdfContext.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
        pdfContext.fillStyle = '#ff0000';
        pdfContext.font = '16px Arial';
        pdfContext.fillText('Error rendering PDF page', 50, 50);
    }
}

function updatePDFPageInfo() {
    document.getElementById('pdf-page-info').textContent = `Page ${pdfPageNum} of ${pdfPageCount}`;
}

document.getElementById('pdf-prev').addEventListener('click', async () => {
    if (pdfPageNum > 1) {
        pdfPageNum--;
        await renderPDFPage();
        updatePDFPageInfo();
    }
});

document.getElementById('pdf-next').addEventListener('click', async () => {
    if (pdfPageNum < pdfPageCount) {
        pdfPageNum++;
        await renderPDFPage();
        updatePDFPageInfo();
    }
});

document.getElementById('pdf-add-text').addEventListener('click', async () => {
    if (!pdfDoc) {
        showToast('Please load a PDF first');
        return;
    }
    
    const text = prompt('Enter text to add:');
    if (text) {
        try {
            const page = pdfDoc.getPage(pdfPageNum - 1);
            const { width, height } = page.getSize();
            page.drawText(text, {
                x: 50,
                y: height - 50,
                size: 12,
                color: PDFLib.rgb(0, 0, 0),
            });
            // Re-render with updated pdf-lib document
            const pdfBytes = await pdfDoc.save();
            if (typeof pdfjsLib !== 'undefined') {
                const loadingTask = pdfjsLib.getDocument({ data: pdfBytes }).promise;
                pdfJsDoc = await loadingTask;
            }
            await renderPDFPage();
            showToast('Text added successfully!');
        } catch (error) {
            showToast('Error adding text');
            console.error(error);
        }
    }
});

document.getElementById('pdf-rotate').addEventListener('click', async () => {
    if (!pdfDoc) {
        showToast('Please load a PDF first');
        return;
    }
    
    try {
        const page = pdfDoc.getPage(pdfPageNum - 1);
        const currentRotation = page.getRotation();
        page.setRotation(currentRotation + 90);
        // Re-render with updated pdf-lib document
        const pdfBytes = await pdfDoc.save();
        if (typeof pdfjsLib !== 'undefined') {
            const loadingTask = pdfjsLib.getDocument({ data: pdfBytes }).promise;
            pdfJsDoc = await loadingTask;
        }
        await renderPDFPage();
        showToast('Page rotated!');
    } catch (error) {
        showToast('Error rotating page');
        console.error(error);
    }
});

document.getElementById('pdf-delete-page').addEventListener('click', async () => {
    if (!pdfDoc || pdfPageCount <= 1) {
        showToast('Cannot delete the only page');
        return;
    }
    
    if (confirm('Are you sure you want to delete this page?')) {
        try {
            pdfDoc.removePage(pdfPageNum - 1);
            pdfPageCount--;
            if (pdfPageNum > pdfPageCount) {
                pdfPageNum = pdfPageCount;
            }
            // Re-render with updated pdf-lib document
            const pdfBytes = await pdfDoc.save();
            if (typeof pdfjsLib !== 'undefined') {
                const loadingTask = pdfjsLib.getDocument({ data: pdfBytes }).promise;
                pdfJsDoc = await loadingTask;
                pdfPageCount = pdfJsDoc.numPages;
            }
            await renderPDFPage();
            updatePDFPageInfo();
            showToast('Page deleted!');
        } catch (error) {
            showToast('Error deleting page');
            console.error(error);
        }
    }
});

document.getElementById('pdf-save').addEventListener('click', async () => {
    if (!pdfDoc) {
        showToast('Please load a PDF first');
        return;
    }
    
    showLoading();
    try {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-pdf-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        hideLoading();
        showToast('PDF saved successfully!');
    } catch (error) {
        hideLoading();
        showToast('Error saving PDF');
        console.error(error);
    }
});

document.getElementById('pdf-download').addEventListener('click', async () => {
    if (!pdfDoc) {
        showToast('Please load a PDF first');
        return;
    }
    
    showLoading();
    try {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pdf-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        hideLoading();
        showToast('PDF downloaded!');
    } catch (error) {
        hideLoading();
        showToast('Error downloading PDF');
        console.error(error);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Drag and drop functionality
function setupDragAndDrop(uploadAreaId, inputId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const input = document.getElementById(inputId);
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'rgba(102, 126, 234, 0.8)';
            uploadArea.style.background = 'rgba(102, 126, 234, 0.15)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        }, false);
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            input.files = files;
            input.dispatchEvent(new Event('change'));
        }
    }, false);
}

// Initialize drag and drop for all upload areas
setupDragAndDrop('enhance-upload', 'enhance-input');
setupDragAndDrop('compress-upload', 'compress-input');
setupDragAndDrop('share-upload', 'share-input');
setupDragAndDrop('pdf-upload', 'pdf-input');

// Initialize 3D background when page loads
window.addEventListener('load', () => {
    init3DBackground();
});
