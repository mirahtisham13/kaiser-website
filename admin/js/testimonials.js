/* ============================================================
   Testimonials CRUD – All database operations for 'testimonials'
   
   Public: fetchPublicTestimonials() – only published rows
   Admin: full CRUD requires authenticated session
   ============================================================ */

/* ---- Admin CRUD ------------------------------------------ */

async function fetchAllTestimonials() {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

async function fetchTestimonialById(id) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

async function createTestimonial(payload) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .insert([payload])
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function updateTestimonial(id, payload) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function deleteTestimonial(id) {
    const { error } = await supabaseClient
        .from('testimonials')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

async function toggleTestimonialPublished(id, current) {
    return await updateTestimonial(id, { is_published: !current });
}

/* ---- Public API ------------------------------------------ */

async function fetchPublicTestimonials(limit = 6) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .select('id, name, rating, text, source, avatar_letter')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}
