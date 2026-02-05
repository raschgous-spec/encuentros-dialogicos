import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { ExcelUploader } from './ExcelUploader';
import { UserCog, GraduationCap, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
 
 export const ImportManager = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    coordinadores: { inserted: number; errors: number };
    estudiantes: { inserted: number; errors: number };
  } | null>(null);

  const handleImportPreloadedData = async () => {
    setIsImporting(true);
    setProgress(10);
    setImportResult(null);

    try {
      // Fetch the Excel file from public folder
      const response = await fetch('/data/Data_Encuentros_Dialogicos.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      setProgress(20);
      
      // Parse the Excel file
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      
      // Parse coordinadores (Sheet 1)
      const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
      const rawCoords = XLSX.utils.sheet_to_json<any[]>(sheet1, { header: 1 });
      
      const coordinadores: any[] = [];
      let currentFacultad = '';
      
      for (let i = 1; i < rawCoords.length; i++) {
        const row = rawCoords[i] as any[];
        if (!row || row.length < 8) continue;
        
        if (row[1] && String(row[1]).trim()) {
          currentFacultad = String(row[1]).trim();
        }
        
        const programa = row[2] ? String(row[2]).trim().replace(/<br\/>/g, ' / ') : '';
        const sede = row[4] ? String(row[4]).trim() : '';
        const nombreCompleto = row[6] ? String(row[6]).trim() : '';
        let correo = row[8] ? String(row[8]).trim() : '';
        correo = correo.replace(/\\@/g, '@').replace(/<|>/g, '').toLowerCase();
        
        if (nombreCompleto && correo && correo.includes('@')) {
          coordinadores.push({
            facultad: currentFacultad,
            programa,
            sede,
            nombre_completo: nombreCompleto,
            correo,
          });
        }
      }
      
      setProgress(40);
      
      // Parse estudiantes (Sheet 2)
      const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
      const rawStudents = XLSX.utils.sheet_to_json<any[]>(sheet2, { header: 1 });
      
      const estudiantes: any[] = [];
      
      for (let i = 1; i < rawStudents.length; i++) {
        const row = rawStudents[i] as any[];
        if (!row || row.length < 6) continue;
        
        const sede = row[0] ? String(row[0]).trim() : '';
        const facultad = row[1] ? String(row[1]).trim() : '';
        const programa = row[2] ? String(row[2]).trim() : '';
        const documento = row[3] ? String(row[3]).trim() : '';
        const nombres = row[4] ? String(row[4]).trim() : '';
        let correo = row[5] ? String(row[5]).trim() : '';
        correo = correo.replace(/\\@/g, '@').toLowerCase();
        
        if (documento && nombres && correo && correo.includes('@')) {
          estudiantes.push({
            sede,
            facultad,
            programa,
            documento,
            nombre_completo: nombres,
            correo,
          });
        }
      }
      
      setProgress(60);
      
      console.log(`Parsed: ${coordinadores.length} coordinadores, ${estudiantes.length} estudiantes`);
      
      // Send to edge function
      const { data, error } = await supabase.functions.invoke('import-excel', {
        body: {
          type: 'both',
          coordinadores,
          estudiantes,
        },
      });
      
      if (error) throw error;
      
      setProgress(100);
      setImportResult(data.results);
      
      toast.success(`Importación completada: ${data.results.coordinadores.inserted} coordinadores, ${data.results.estudiantes.inserted} estudiantes`);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Error al importar datos');
    } finally {
      setIsImporting(false);
    }
  };

   return (
     <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold">Importar Usuarios Autorizados</h2>
         <p className="text-muted-foreground">
           Cargue archivos Excel para importar coordinadores y estudiantes autorizados
         </p>
       </div>
 
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importar Datos del Archivo Preconfigurado
          </CardTitle>
          <CardDescription>
            Carga automáticamente los datos de coordinadores y estudiantes desde el archivo Excel del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isImporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 40 ? 'Procesando archivo...' : progress < 60 ? 'Extrayendo datos...' : 'Importando a la base de datos...'}
              </p>
            </div>
          )}
          
          {importResult && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Coordinadores:</strong> {importResult.coordinadores.inserted} importados, {importResult.coordinadores.errors} errores</p>
                  <p><strong>Estudiantes:</strong> {importResult.estudiantes.inserted} importados, {importResult.estudiantes.errors} errores</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleImportPreloadedData} 
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Importar Datos Completos (Coordinadores + Estudiantes)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

       <Tabs defaultValue="coordinadores" className="space-y-4">
         <TabsList>
           <TabsTrigger value="coordinadores" className="gap-2">
             <UserCog className="h-4 w-4" />
             Coordinadores
           </TabsTrigger>
           <TabsTrigger value="estudiantes" className="gap-2">
             <GraduationCap className="h-4 w-4" />
             Estudiantes
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="coordinadores">
           <ExcelUploader type="coordinadores" />
         </TabsContent>
 
         <TabsContent value="estudiantes">
           <ExcelUploader type="estudiantes" />
         </TabsContent>
       </Tabs>
     </div>
   );
 };