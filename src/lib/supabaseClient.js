import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas');
  console.warn('Adicione no arquivo .env ou .env.local:');
  console.warn('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.warn('VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
});

export default supabase;
