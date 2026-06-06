/* ============================================================
   Dashboard JS – Stats cards and recent cases table rendering
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    // Guard: redirect to login if no session
    const session = await checkAuth();
    if (!session) return;

    // Show user info in sidebar
    await updateUserDisplay();

    // Load all dashboard data
    await Promise.all([loadStats(), loadRecentCases()]);
});

/* ---- Stats Cards ----------------------------------------- */

async function loadStats() {
    const container = document.getElementById('statsGrid');
    if (!container) return;

    try {
        const stats = await fetchDashboardStats();
        renderStatsCards(stats);
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

function renderStatsCards({ total, published, draft, featured }) {
    document.getElementById('statTotal').textContent     = total;
    document.getElementById('statPublished').textContent = published;
    document.getElementById('statDraft').textContent     = draft;
    document.getElementById('statFeatured').textContent  = featured;
}

/* ---- Recent Cases Table ---------------------------------- */

async function loadRecentCases() {
    const tbody = document.getElementById('recentCasesBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr><td colspan="5" class="loading-state" style="padding:24px;">
            <span class="spinner spinner--dark"></span> Loading...
        </td></tr>`;

    try {
        // Get last 5 cases
        const { data, error } = await supabaseClient
            .from('cases')
            .select('id, title, category, status, is_featured, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const cases = data || [];

        if (cases.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="5" style="text-align:center; padding:32px; color:var(--admin-text-light); font-size:13px;">
                    No cases yet. <a href="case-form.html">Add your first case →</a>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = cases.map(c => `
            <tr>
                <td style="font-weight:600; max-width:220px;">
                    <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escHtml(c.title)}</div>
                </td>
                <td>${escHtml(c.category || '—')}</td>
                <td><span class="badge badge--${c.status}">${c.status}</span></td>
                <td>${c.is_featured ? '<span class="badge badge--featured">⭐ Featured</span>' : '<span style="color:var(--admin-text-muted);">—</span>'}</td>
                <td style="color:var(--admin-text-light); font-size:12px;">${formatDate(c.created_at)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load recent cases:', err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--admin-danger);">
            Failed to load cases. Check your Supabase config.
        </td></tr>`;
    }
}

/* ---- Helpers --------------------------------------------- */

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}
