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

    const body = await req.json().catch(() => ({}));
    const { coordinadores, estudiantes, type, fileUrl } = body;

    const results = {
      coordinadores: { inserted: 0, errors: 0 },
      estudiantes: { inserted: 0, errors: 0 },
    };

    let coordData = coordinadores || [];
    let studData = estudiantes || [];

    // If fileUrl provided, fetch and parse XLSX server-side
    if (fileUrl) {
      console.log(`Fetching XLSX from: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Fetch failed: ${response.status}, body preview: ${text.substring(0, 200)}`);
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type") || "";
      console.log(`Content-Type: ${contentType}`);
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`File size: ${arrayBuffer.byteLength} bytes`);
      
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      console.log(`Sheets: ${workbook.SheetNames.join(", ")}`);

      // Parse coordinadores (Sheet 1)
      const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
      const coordRows: any[] = XLSX.utils.sheet_to_json(sheet1, { defval: "" });
      let lastFacultad = "";
      
      for (const row of coordRows) {
        const facultad = (row["FACULTAD"] || "").toString().trim();
        const programa = (row["PROGRAMA"] || "").toString().trim();
        const sede = (row["SEDE/SECCIONALES"] || "").toString().trim();
        const nombre = (row["NOMBRE COMPLETO"] || "").toString().trim();
        let correo = (row["CORREO"] || "").toString().trim().toLowerCase();
        correo = correo.replace(/\\@/g, "@").replace(/<|>/g, "");

        if (facultad) lastFacultad = facultad;
        if (!nombre || !correo || !correo.includes("@")) continue;

        coordData.push({
          nombre_completo: nombre,
          correo,
          facultad: lastFacultad,
          programa,
          sede,
        });
      }

      // Parse estudiantes (Sheet 2)
      const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
      const studRows: any[] = XLSX.utils.sheet_to_json(sheet2, { defval: "" });
      
      for (const row of studRows) {
        const sede = (row["SEDE"] || "").toString().trim();
        const facultad = (row["FACULTAD"] || "").toString().trim();
        const programa = (row["PENSUM"] || "").toString().trim();
        const documento = (row["DOCUMENTO"] || "").toString().trim();
        const nombre = (row["NOMBRES"] || "").toString().trim();
        let correo = (row["CORREO"] || "").toString().trim().toLowerCase();
        correo = correo.replace(/\\@/g, "@");

        if (!documento || !correo || !nombre || !correo.includes("@")) continue;

        studData.push({
          nombre_completo: nombre,
          correo,
          documento,
          sede,
          facultad,
          programa,
        });
      }

      console.log(`Parsed from XLSX: ${coordData.length} coordinadores, ${studData.length} estudiantes`);
    } else {
      console.log(`Direct data: ${coordData.length} coordinadores, ${studData.length} estudiantes`);
    }

    // Upsert coordinadores
    if (coordData.length > 0 && (type !== "estudiantes")) {
      const BATCH = 50;
      for (let i = 0; i < coordData.length; i += BATCH) {
        const batch = coordData.slice(i, i + BATCH);
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

    // Upsert estudiantes
    if (studData.length > 0 && (type !== "coordinadores")) {
      const BATCH = 500;
      for (let i = 0; i < studData.length; i += BATCH) {
        const batch = studData.slice(i, i + BATCH);
        const { error } = await supabase
          .from("estudiantes_autorizados")
          .upsert(batch, { onConflict: "documento", ignoreDuplicates: false });
        if (error) {
          console.error(`Student batch ${i}-${i + batch.length} error:`, error);
          results.estudiantes.errors += batch.length;
        } else {
          results.estudiantes.inserted += batch.length;
        }
        console.log(`Students: ${Math.min(i + BATCH, studData.length)}/${studData.length}`);
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
