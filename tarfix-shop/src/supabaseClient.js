import { createClient } from "@supabase/supabase-js";

// Te dwie wartości znajdziesz w panelu Supabase: Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
