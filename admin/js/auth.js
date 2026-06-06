/* ============================================================
   Auth Utilities – Admin Guard, Logout, User Display
   
   Call checkAuth() at the top of every protected admin page.
   It redirects to login.html if no session is found.
   ============================================================ */

/**
 * Verify the user is authenticated. Redirects to login if not.
 * @returns {Promise<Session|null>}
 */
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

/**
 * Sign out and redirect to the login page.
 */
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

/**
 * Populate the sidebar user email + initial avatar.
 * Expects elements with id="adminEmail" and id="userInitial".
 */
async function updateUserDisplay() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const emailEl   = document.getElementById('adminEmail');
    const initialEl = document.getElementById('userInitial');

    if (emailEl)   emailEl.textContent   = user.email;
    if (initialEl) initialEl.textContent = user.email.charAt(0).toUpperCase();
}
