// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qggesmbouvykcgmakdar.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ2VzbWJvdXZ5a2NnbWFrZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjUyMjQsImV4cCI6MjA1MTUwMTIyNH0.qRlUKmNtAa5GmHsxK0xEXRWfKLme1YAugDbq5Y4JgCI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);