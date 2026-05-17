import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ohgwhekwwykmeynczqaq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZ3doZWt3d3lrbWV5bmN6cWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTEzNzAsImV4cCI6MjA5Mzk4NzM3MH0.5jOuo6PDgWijeorV53hQRgWQyhUH1DX46cWJQI7sMZI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);