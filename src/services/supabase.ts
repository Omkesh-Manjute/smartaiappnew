import { createClient } from '@supabase/supabase-js';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloY253dWF4Y3lsYml2dXZ6dWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODc5OTEsImV4cCI6MjA4Nzk2Mzk5MX0.NYHI7L2yWXoWP_NGj0onvycRB7qQ9f7DslmZdCBsU_o';

// Production: Vercel proxy (India ISP block bypass - no VPN needed)
// Development: Direct Supabase
const supabaseUrl = import.meta.env.PROD
  ? `${window.location.origin}/api/proxy`
  : 'https://ihcnwuaxcylbivuvzubz.supabase.co';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, SUPABASE_ANON_KEY);
export default supabase;