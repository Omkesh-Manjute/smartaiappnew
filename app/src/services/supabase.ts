import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ihcnwuaxcylbivuvzubz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY253dWF4Y3lsYml2dXZ6dWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODc5OTEsImV4cCI6MjA4Nzk2Mzk5MX0.NYHI7L2yWXoWP_NGj0onvycRB7qQ9f7DslmZdCBsU_o';

// Production: Use Vercel proxy if possible, but allow direct fallback if proxy fails for specific tables
const supabaseUrl = import.meta.env.PROD
  ? `${window.location.origin}/api/proxy`
  : SUPABASE_URL;

console.log('Supabase initialized with URL:', supabaseUrl, 'Mode:', import.meta.env.MODE);
if (import.meta.env.PROD) {
  console.info('Tip: If you see 403/404 errors, ensure RLS policies are enabled on Supabase for the anon role.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, SUPABASE_ANON_KEY);
export default supabase;