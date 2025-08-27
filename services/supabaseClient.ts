import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = "Las credenciales de Supabase no están configuradas correctamente en `services/supabaseClient.ts`";
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="padding: 2rem; color: #ffcdd2; background-color: #2a0000; height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                <h1 style="font-size: 1.5rem; color: #ef9a9a;">Error de Configuración</h1>
                <p style="margin-top: 1rem; max-width: 600px;">${errorMsg}</p>
            </div>
        `;
    }
    throw new Error(errorMsg);
}

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey);