import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://phbwyxrtmjzcqeixgngi.supabase.co";
const supabaseKey = "sb_publishable_T7pRqniHlbq1rh_BnRHRvA_wZjn89PF";

export const supabase = createClient(supabaseUrl, supabaseKey);
