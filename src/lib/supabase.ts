import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client serveur avec la clé secrète : à n'utiliser que derrière une vérification de session.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
