/* ============================================================
   Storage Utilities – Supabase Storage Image Helpers
   
   Handles upload, deletion, and URL extraction for images
   stored in the 'cases-images' Supabase Storage bucket.
   ============================================================ */

const STORAGE_BUCKET = 'cases-images';

/**
 * Upload a single File to Supabase Storage.
 * @param {File} file – The file object to upload
 * @returns {Promise<{path: string, url: string}>}
 */
async function uploadImage(file) {
    // Generate a unique filename to avoid collisions
    const ext      = file.name.split('.').pop().toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = `cases/${filename}`;

    const { data, error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
        });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return { path: filePath, url: publicUrl };
}

/**
 * Upload multiple files sequentially.
 * @param {FileList|File[]} files
 * @returns {Promise<Array<{path: string, url: string}>>}
 */
async function uploadImages(files) {
    const results = [];
    for (const file of Array.from(files)) {
        const result = await uploadImage(file);
        results.push(result);
    }
    return results;
}

/**
 * Delete a file from Supabase Storage by its storage path.
 * @param {string} path – The path within the bucket (e.g. 'cases/xxx.jpg')
 */
async function deleteImage(path) {
    if (!path) return;
    const { error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .remove([path]);
    if (error) console.warn(`Could not delete image at ${path}:`, error.message);
}

/**
 * Extract the storage path from a full Supabase public URL.
 * @param {string} url – Full public URL
 * @returns {string|null} – Storage path, or null if not parseable
 */
function getImagePathFromUrl(url) {
    if (!url) return null;
    // Match the path after the bucket name in the URL
    const marker = `/cases-images/`;
    const idx = url.indexOf(marker);
    return idx !== -1 ? url.substring(idx + marker.length) : null;
}
