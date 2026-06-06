/* ============================================================
   Cases CRUD – All database operations for the 'cases' table
   
   Public-facing functions use fetchPublicCases() which only
   returns rows where status = 'published' (enforced by RLS).
   Admin functions require an authenticated session.
   ============================================================ */

/* ---- Admin CRUD ------------------------------------------ */

/**
 * Fetch all cases (admin view) with optional filters.
 * @param {{ status?: string, category?: string, search?: string }} filters
 * @returns {Promise<Array>}
 */
async function fetchAllCases(filters = {}) {
    let query = supabaseClient
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters.status   && filters.status   !== 'all') query = query.eq('status', filters.status);
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.search)  query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Fetch a single case by ID (admin view – returns draft and published).
 * @param {string} id – UUID
 * @returns {Promise<Object>}
 */
async function fetchCaseById(id) {
    const { data, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

/**
 * Create a new dental case.
 * @param {Object} caseData – Field values matching the cases table
 * @returns {Promise<Object>} – The created row
 */
async function createCase(caseData) {
    const { data, error } = await supabaseClient
        .from('cases')
        .insert([caseData])
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Update an existing case.
 * @param {string} id
 * @param {Object} caseData – Fields to update
 * @returns {Promise<Object>} – The updated row
 */
async function updateCase(id, caseData) {
    const { data, error } = await supabaseClient
        .from('cases')
        .update(caseData)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Delete a case and clean up its images from Supabase Storage.
 * @param {string} id
 */
async function deleteCase(id) {
    // Fetch the case first so we can remove its images from storage
    const caseData = await fetchCaseById(id);

    if (caseData.images && caseData.images.length > 0) {
        for (const url of caseData.images) {
            const path = getImagePathFromUrl(url);
            if (path) await deleteImage(path);
        }
    }

    const { error } = await supabaseClient
        .from('cases')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

/**
 * Toggle the status of a case between 'draft' and 'published'.
 * @param {string} id
 * @param {'draft'|'published'} currentStatus
 * @returns {Promise<Object>}
 */
async function toggleCaseStatus(id, currentStatus) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    return await updateCase(id, { status: newStatus });
}

/**
 * Toggle the is_featured flag of a case.
 * @param {string} id
 * @param {boolean} currentFeatured
 * @returns {Promise<Object>}
 */
async function toggleFeatured(id, currentFeatured) {
    return await updateCase(id, { is_featured: !currentFeatured });
}

/* ---- Dashboard Stats ------------------------------------- */

/**
 * Aggregate stats for the dashboard overview cards.
 * @returns {Promise<{total: number, published: number, draft: number, featured: number}>}
 */
async function fetchDashboardStats() {
    const { data, error } = await supabaseClient
        .from('cases')
        .select('id, status, is_featured');

    if (error) return { total: 0, published: 0, draft: 0, featured: 0 };

    const all = data || [];
    return {
        total:     all.length,
        published: all.filter(c => c.status === 'published').length,
        draft:     all.filter(c => c.status === 'draft').length,
        featured:  all.filter(c => c.is_featured).length
    };
}

/* ---- Public API (used by cases.html and index.html) ------ */

/**
 * Fetch published cases for the public site.
 * RLS ensures unauthenticated users can only see published rows.
 * @param {number|null} limit – Maximum number to return
 * @param {boolean} featuredOnly – If true, only return is_featured = true
 * @param {string|null} category – Filter by category
 * @returns {Promise<Array>}
 */
async function fetchPublicCases(limit = null, featuredOnly = false, category = null) {
    let query = supabaseClient
        .from('cases')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (featuredOnly) query = query.eq('is_featured', true);
    if (category)     query = query.eq('category', category);
    if (limit)        query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}
