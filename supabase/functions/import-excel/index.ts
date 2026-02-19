import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req: Request) => {
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
  try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Authenticate the caller
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401, headers: corsHeaders });
      }

      const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }
      const userId = claimsData.claims.sub;

      // Verify admin role
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: adminRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
      }

      const supabase = supabaseAdmin;

     // Get the parsed data from the request (parsed on frontend)
     const { type, coordinadores, estudiantes } = await req.json();
    
    console.log(`Processing import: type=${type}, coordinadores=${coordinadores?.length || 0}, estudiantes=${estudiantes?.length || 0}`);
 
     const results = {
       coordinadores: { inserted: 0, errors: 0 },
       estudiantes: { inserted: 0, errors: 0 },
     };
 
     // Process coordinadores (Sheet 1)
    if ((type === "coordinadores" || type === "both") && coordinadores && coordinadores.length > 0) {
       // Insert coordinadores in batches
       const BATCH_SIZE = 50;
       for (let i = 0; i < coordinadores.length; i += BATCH_SIZE) {
         const batch = coordinadores.slice(i, i + BATCH_SIZE);
         const { error } = await supabase
           .from("coordinadores_autorizados")
           .upsert(batch, { onConflict: "correo", ignoreDuplicates: true });
 
         if (error) {
           console.error("Error inserting coordinadores batch:", error);
           results.coordinadores.errors += batch.length;
         } else {
           results.coordinadores.inserted += batch.length;
         }
       }
     }
 
     // Process estudiantes (Sheet 2)
    if ((type === "estudiantes" || type === "both") && estudiantes && estudiantes.length > 0) {
       // Insert estudiantes in batches
       const BATCH_SIZE = 500;
       for (let i = 0; i < estudiantes.length; i += BATCH_SIZE) {
         const batch = estudiantes.slice(i, i + BATCH_SIZE);
         const { error } = await supabase
           .from("estudiantes_autorizados")
           .upsert(batch, { onConflict: "documento", ignoreDuplicates: true });
 
         if (error) {
           console.error(`Error inserting estudiantes batch ${i}-${i + batch.length}:`, error);
           results.estudiantes.errors += batch.length;
         } else {
           results.estudiantes.inserted += batch.length;
         }
       }
     }
 
     console.log("Import completed:", results);
 
     return new Response(
       JSON.stringify({
         success: true,
         message: "Importación completada",
         results,
       }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 200,
       }
     );
   } catch (error: any) {
     console.error("Error in import-excel function:", error);
     return new Response(
       JSON.stringify({
         success: false,
         error: error.message || "Error al procesar el archivo",
       }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 500,
       }
     );
   }
 });