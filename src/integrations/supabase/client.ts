
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://byvkllvtaasnvtfbiolo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dmtsbHZ0YWFzbnZ0ZmJpb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNTM3MTcsImV4cCI6MjA1NjkyOTcxN30.nAgCGySTSEmyeP-HwiKG71NNIwTNuLFULxSlGDSuaCE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
