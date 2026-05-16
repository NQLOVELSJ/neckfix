import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nmmpvuhcemqwdclvwhgt.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbXB2dWhjZW1xd2RjbHZ3aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTc5NDcsImV4cCI6MjA5NDQ5Mzk0N30.Gfs1KKyMnPp5EmCvxonLLi1-z_fmMCHHIYpAIcOVk4I";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export function getSupabase() {
  return createClient();
}
