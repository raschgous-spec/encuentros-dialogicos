import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as XLSX from "npm:xlsx@0.18.5";

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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      throw new Error("fileUrl is required");
    }

    console.log(`Fetching xlsx from: ${fileUrl}`);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    console.log(`Sheets found: ${workbook.SheetNames.join(", ")}`);

    const results = {
      coordinadores: { inserted: 0, errors: 0, skipped: 0 },
      estudiantes: { inserted: 0, errors: 0, skipped: 0 },
    };

    // Process Sheet 1 - Coordinadores
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const coordRows: any[] = XLSX.utils.sheet_to_json(sheet1, { defval: "" });
    console.log(`Sheet 1 raw rows: ${coordRows.length}`);

    // Fill down FACULTAD column (empty cells inherit from above)
    let lastFacultad = "";
    const coordinadores: any[] = [];
    
    for (const row of coordRows) {
      const facultad = (row["FACULTAD"] || "").toString().trim();
      const programa = (row["PROGRAMA"] || "").toString().trim();
      const sede = (row["SEDE/SECCIONALES"] || "").toString().trim();
      const nombre = (row["NOMBRE COMPLETO"] || "").toString().trim();
      const correo = (row["CORREO"] || "").toString().trim().toLowerCase();

      if (facultad) lastFacultad = facultad;

      if (!nombre || !correo) {
        results.coordinadores.skipped++;
        continue;
      }

      coordinadores.push({
        nombre_completo: nombre,
        correo,
        facultad: lastFacultad,
        programa,
        sede,
      });
    }

    console.log(`Valid coordinadores: ${coordinadores.length}`);

    // Upsert coordinadores
    if (coordinadores.length > 0) {
      const BATCH = 50;
      for (let i = 0; i < coordinadores.length; i += BATCH) {
        const batch = coordinadores.slice(i, i + BATCH);
        const { error } = await supabase
          .from("coordinadores_autorizados")
          .upsert(batch, { onConflict: "correo", ignoreDuplicates: false });
        if (error) {
          console.error(`Coord batch error:`, error);
          results.coordinadores.errors += batch.length;
        } else {
          results.coordinadores.inserted += batch.length;
        }
      }
    }

    // Process Sheet 2 - Estudiantes
    const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
    const studRows: any[] = XLSX.utils.sheet_to_json(sheet2, { defval: "" });
    console.log(`Sheet 2 raw rows: ${studRows.length}`);

    const estudiantes: any[] = [];
    for (const row of studRows) {
      const sede = (row["SEDE"] || "").toString().trim();
      const facultad = (row["FACULTAD"] || "").toString().trim();
      const programa = (row["PENSUM"] || "").toString().trim();
      const documento = (row["DOCUMENTO"] || "").toString().trim();
      const nombre = (row["NOMBRES"] || "").toString().trim();
      const correo = (row["CORREO"] || "").toString().trim().toLowerCase();

      if (!documento || !correo || !nombre) {
        results.estudiantes.skipped++;
        continue;
      }

      estudiantes.push({
        nombre_completo: nombre,
        correo,
        documento,
        sede,
        facultad,
        programa,
      });
    }

    console.log(`Valid estudiantes: ${estudiantes.length}`);

    // Upsert estudiantes in batches
    if (estudiantes.length > 0) {
      const BATCH = 500;
      for (let i = 0; i < estudiantes.length; i += BATCH) {
        const batch = estudiantes.slice(i, i + BATCH);
        const { error } = await supabase
          .from("estudiantes_autorizados")
          .upsert(batch, { onConflict: "documento", ignoreDuplicates: false });
        if (error) {
          console.error(`Student batch ${i}-${i + batch.length} error:`, error);
          results.estudiantes.errors += batch.length;
        } else {
          results.estudiantes.inserted += batch.length;
        }
        console.log(`Students processed: ${Math.min(i + BATCH, estudiantes.length)}/${estudiantes.length}`);
      }
    }

    console.log("Import completed:", JSON.stringify(results));

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
