/* ============================================================
   Dr. Kaiser Dental – Supabase Configuration
   
   ⚠️  IMPORTANT: Replace the placeholder values below with your
   actual Supabase project credentials before using the admin.
   
   Get these from: Supabase Dashboard → Settings → API
   ============================================================ */

const SUPABASE_URL = 'https://ynkqdkesohhhznjyazsp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eahhskoyTnpImscofH8XmQ_oDIosXiR';

// Initialize the Supabase client (available globally as `supabaseClient`)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
