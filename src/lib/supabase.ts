import { createClient } from '@supabase/supabase-js';

// NOTA: Configurar estas variables en .env.local para producción.
// Se usan placeholders válidos (https://...) para evitar el error de inicialización de 'invalid url'.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
