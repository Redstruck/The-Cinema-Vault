// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tbrjovpzinjjrrttwebq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicmpvdnB6aW5qanJydHR3ZWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTQwMDcsImV4cCI6MjA2NTA5MDAwN30.phpuz3Qa2mnX9Ns22s34yKU3JAw9qVosPirPV7LHYwc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);