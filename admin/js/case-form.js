/* ============================================================
   Case Form JS – Add / Edit Case
   
   Determines mode from URL: ?id=xxx = edit, no param = new.
   
   Image handling:
   - existingImages: URLs already saved in DB (edit mode)
   - pendingFiles:   File objects chosen but not yet uploaded
   - deletedUrls:    Existing URLs the user removed (deleted on save)
   ============================================================ */

/* ---- State ------------------------------------------------ */
let quill        = null;          // Quill editor instance
let editId       = null;          // UUID of the case being edited (null = new)
let existingImages = [];          // Array of URL strings from DB
let pendingFiles   = [];          // Array of { file: File, previewUrl: string }
let deletedUrls    = [];          // Existing URLs to delete from storage on save
let featuredUrl    = null;        // The current featured image URL

/* ---- Utility: Toast notifications ------------------------ */

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('is-hiding');
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

/* ---- Init ------------------------------------------------ */

document.addEventListener('DOMContentLoaded', async () => {
    // Auth guard
    const session = await checkAuth();
    if (!session) return;
    await updateUserDisplay();

    // Detect edit mode
    const params = new URLSearchParams(window.location.search);
    editId = params.get('id') || null;

    // Set page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = editId ? 'Edit Case' : 'Add New Case';

    // Init Quill rich text editor
    quill = new Quill('#descriptionEditor', {
        theme: 'snow',
        placeholder: 'Describe the case, treatment approach, outcome...',
        modules: {
            toolbar: [
                [{ header: [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean']
            ]
        }
    });

    // If editing, load existing data into the form
    if (editId) {
        await loadCaseForEdit(editId);
    }

    // Set up image upload zone
    initImageUpload();

    // Set up form submit
    document.getElementById('caseForm').addEventListener('submit', handleSubmit);
});

/* ---- Load case data for editing -------------------------- */

async function loadCaseForEdit(id) {
    const formEl = document.getElementById('caseForm');
    formEl.style.opacity = '.5';
    formEl.style.pointerEvents = 'none';

    try {
        const c = await fetchCaseById(id);

        // Populate text fields
        document.getElementById('title').value         = c.title || '';
        document.getElementById('category').value      = c.category || '';
        document.getElementById('patientAge').value    = c.patient_age || '';
        document.getElementById('treatmentType').value = c.treatment_type || '';

        // Set status radio buttons
        const statusVal = c.status === 'published' ? 'published' : 'draft';
        document.querySelector(`input[name="status"][value="${statusVal}"]`).checked = true;

        // Set featured toggle
        document.getElementById('isFeatured').checked = !!c.is_featured;

        // Set Quill content
        if (c.description) {
            quill.root.innerHTML = c.description;
        }

        // Load existing videos
        if (window.__setExistingVideos) {
            window.__setExistingVideos(Array.isArray(c.videos) ? c.videos : []);
        }

        // Load existing images
        existingImages = Array.isArray(c.images) ? [...c.images] : [];
        featuredUrl    = c.featured_image || null;
        renderImagePreviews();

    } catch (err) {
        showToast('Failed to load case data. ' + err.message, 'error');
    } finally {
        formEl.style.opacity = '1';
        formEl.style.pointerEvents = 'auto';
    }
}

/* ---- Image Upload Zone ---------------------------------- */

function initImageUpload() {
    const zone      = document.getElementById('uploadZone');
    const fileInput = document.getElementById('imageInput');

    // Click to open file picker
    zone.addEventListener('click', () => fileInput.click());

    // Handle file picker selection
    fileInput.addEventListener('change', (e) => {
        addFiles(Array.from(e.target.files));
        e.target.value = ''; // reset so same file can be added again
    });

    // Drag and drop
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('is-dragging');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragging'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('is-dragging');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addFiles(files);
    });
}

function addFiles(files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize    = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
        if (!validTypes.includes(file.type)) {
            showToast(`"${file.name}" is not a supported image type.`, 'error');
            continue;
        }
        if (file.size > maxSize) {
            showToast(`"${file.name}" exceeds the 10 MB size limit.`, 'error');
            continue;
        }
        const previewUrl = URL.createObjectURL(file);
        pendingFiles.push({ file, previewUrl });
    }

    renderImagePreviews();
}

/* ---- Render Image Preview Grid -------------------------- */

function renderImagePreviews() {
    const container = document.getElementById('imagePreviews');
    if (!container) return;

    // Combine existing (saved) images and pending (local) images
    const allImages = [
        ...existingImages.map(url => ({ url, isPending: false })),
        ...pendingFiles.map(({ previewUrl }) => ({ url: previewUrl, isPending: true }))
    ];

    if (allImages.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = allImages.map(({ url, isPending }, idx) => {
        const isFeatured = url === featuredUrl || (idx === 0 && !featuredUrl);
        return `
        <div class="image-preview ${isFeatured ? 'is-featured' : ''}" data-url="${escHtml(url)}" data-pending="${isPending}">
            <img src="${escHtml(url)}" alt="Case image ${idx + 1}" loading="lazy">
            ${isFeatured ? '<div class="image-preview__badge">Featured</div>' : ''}
            <div class="image-preview__actions">
                ${!isFeatured ? `<button type="button" class="image-preview__btn image-preview__btn--feature" onclick="setFeaturedImage('${escHtml(url)}')">⭐ Feature</button>` : ''}
                <button type="button" class="image-preview__btn image-preview__btn--delete" onclick="removeImage('${escHtml(url)}', ${isPending})">🗑️ Remove</button>
            </div>
        </div>`;
    }).join('');

    // Sync featured URL if it's the implicit first image
    if (!featuredUrl && allImages.length > 0) {
        featuredUrl = allImages[0].url;
    }
}

function setFeaturedImage(url) {
    featuredUrl = url;
    renderImagePreviews();
}

function removeImage(url, isPending) {
    if (isPending) {
        // Remove from pendingFiles
        pendingFiles = pendingFiles.filter(p => p.previewUrl !== url);
        URL.revokeObjectURL(url); // free memory
    } else {
        // Mark existing image for deletion on save
        existingImages = existingImages.filter(u => u !== url);
        deletedUrls.push(url);
    }

    // If removed image was featured, reset to first remaining
    if (featuredUrl === url) {
        const remaining = [
            ...existingImages,
            ...pendingFiles.map(p => p.previewUrl)
        ];
        featuredUrl = remaining.length > 0 ? remaining[0] : null;
    }

    renderImagePreviews();
}

/* ---- Form Submission ------------------------------------- */

async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const draftBtn  = document.getElementById('draftBtn');

    // Which button was pressed?
    const clickedId = document.activeElement?.id || '';
    const forceDraft = clickedId === 'draftBtn';

    // Validate required fields
    const title = document.getElementById('title').value.trim();
    if (!title) {
        showToast('Please enter a case title.', 'error');
        document.getElementById('title').focus();
        return;
    }

    // Disable buttons and show loading
    submitBtn.disabled = true;
    draftBtn.disabled  = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
        // 1. Delete images removed by the user (existing images only)
        for (const url of deletedUrls) {
            const path = getImagePathFromUrl(url);
            if (path) await deleteImage(path);
        }
        deletedUrls = [];

        // 2. Upload all pending (new) image files
        let uploadedUrls = [];
        if (pendingFiles.length > 0) {
            showToast('Uploading images...', 'info');
            for (const { file } of pendingFiles) {
                const result = await uploadImage(file);
                uploadedUrls.push(result.url);
            }
        }

        // 3. Build the final images array (existing + newly uploaded)
        const allImageUrls = [...existingImages, ...uploadedUrls];

        // 4. Resolve the featured image URL
        // If the featured image was a pending preview URL, map it to the uploaded URL
        let resolvedFeatured = featuredUrl;
        if (featuredUrl && !existingImages.includes(featuredUrl)) {
            // It was a pending file – find its uploaded URL by position
            const pendingIdx = pendingFiles.findIndex(p => p.previewUrl === featuredUrl);
            if (pendingIdx !== -1 && uploadedUrls[pendingIdx]) {
                resolvedFeatured = uploadedUrls[pendingIdx];
            }
        }
        if (!resolvedFeatured && allImageUrls.length > 0) {
            resolvedFeatured = allImageUrls[0];
        }

        // 5b. Upload pending video files
        let uploadedVideoUrls = [];
        const videoState = window.__getVideoState ? window.__getVideoState() : { existingVideoUrls: [], pendingVideoFiles: [] };
        for (const file of videoState.pendingVideoFiles) {
            try {
                const result = await uploadVideo(file);
                uploadedVideoUrls.push(result.url);
            } catch (e) {
                console.warn('Video upload failed:', e.message);
            }
        }
        const allVideoUrls = [...videoState.existingVideoUrls, ...uploadedVideoUrls];

        // 5. Collect form data
        const statusChecked = document.querySelector('input[name="status"]:checked');
        const status = forceDraft ? 'draft' : (statusChecked?.value || 'draft');

        const caseData = {
            title,
            description:    quill.root.innerHTML,
            category:       document.getElementById('category').value    || null,
            patient_age:    parseInt(document.getElementById('patientAge').value) || null,
            treatment_type: document.getElementById('treatmentType').value.trim() || null,
            images:         allImageUrls,
            featured_image: resolvedFeatured,
            videos:         allVideoUrls,
            is_featured:    document.getElementById('isFeatured').checked,
            status
        };

        // 6. Save to Supabase
        if (editId) {
            await updateCase(editId, caseData);
            showToast('Case updated successfully!', 'success');
        } else {
            await createCase(caseData);
            showToast('Case created successfully!', 'success');
        }

        // 7. Redirect to cases list after short delay
        setTimeout(() => { window.location.href = 'cases.html'; }, 1000);

    } catch (err) {
        showToast('Error: ' + err.message, 'error');
        console.error(err);
        submitBtn.disabled = false;
        draftBtn.disabled  = false;
        submitBtn.innerHTML = editId ? 'Update Case' : 'Publish Case';
    }
}
