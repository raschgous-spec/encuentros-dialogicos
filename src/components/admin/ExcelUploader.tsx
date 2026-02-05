 import { useState, useCallback } from 'react';
 import * as XLSX from 'xlsx';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { toast } from 'sonner';
 import { Upload, FileSpreadsheet, Check, X, Loader2, Download } from 'lucide-react';
 import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
 
 interface CoordinadorRow {
  [key: string]: string;
   sede: string;
   facultad: string;
   programa: string;
   nombre_completo: string;
   correo: string;
 }
 
 interface EstudianteRow {
  [key: string]: string;
   sede: string;
   facultad: string;
   programa: string;
   documento: string;
   nombre_completo: string;
   correo: string;
 }
 
 type UploadType = 'coordinadores' | 'estudiantes';
 
 interface ExcelUploaderProps {
   type: UploadType;
 }
 
 const COORDINADOR_COLUMNS = ['sede', 'facultad', 'programa', 'nombre_completo', 'correo'];
 const ESTUDIANTE_COLUMNS = ['sede', 'facultad', 'programa', 'documento', 'nombre_completo', 'correo'];
 
 export const ExcelUploader = ({ type }: ExcelUploaderProps) => {
   const [file, setFile] = useState<File | null>(null);
   const [data, setData] = useState<(CoordinadorRow | EstudianteRow)[]>([]);
   const [errors, setErrors] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);
  const [progress, setProgress] = useState(0);
 
   const expectedColumns = type === 'coordinadores' ? COORDINADOR_COLUMNS : ESTUDIANTE_COLUMNS;
 
   const validateRow = (row: Record<string, any>, index: number): string[] => {
     const rowErrors: string[] = [];
     
     expectedColumns.forEach(col => {
       if (!row[col] || String(row[col]).trim() === '') {
         rowErrors.push(`Fila ${index + 1}: Campo "${col}" vacío`);
       }
     });
 
     if (row.correo && !String(row.correo).includes('@')) {
       rowErrors.push(`Fila ${index + 1}: Correo inválido "${row.correo}"`);
     }
 
     return rowErrors;
   };
 
   const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
     const selectedFile = e.target.files?.[0];
     if (!selectedFile) return;
 
     setFile(selectedFile);
     setData([]);
     setErrors([]);
     setUploadResult(null);
     setIsLoading(true);
 
     try {
       const buffer = await selectedFile.arrayBuffer();
       const workbook = XLSX.read(buffer, { type: 'array' });
       const sheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[sheetName];
       const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
 
       if (jsonData.length === 0) {
         setErrors(['El archivo está vacío']);
         setIsLoading(false);
         return;
       }
 
       // Normalize column names
       const normalizedData = jsonData.map(row => {
         const normalized: Record<string, any> = {};
         Object.keys(row).forEach(key => {
           const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
           normalized[normalizedKey] = String(row[key]).trim();
         });
         return normalized;
       });
 
       // Check for required columns
       const firstRow = normalizedData[0];
       const missingColumns = expectedColumns.filter(col => !(col in firstRow));
       
       if (missingColumns.length > 0) {
         setErrors([`Columnas faltantes: ${missingColumns.join(', ')}`]);
         setIsLoading(false);
         return;
       }
 
       // Validate all rows
       const allErrors: string[] = [];
       normalizedData.forEach((row, index) => {
         const rowErrors = validateRow(row, index);
         allErrors.push(...rowErrors);
       });
 
       if (allErrors.length > 0) {
         setErrors(allErrors.slice(0, 20)); // Show max 20 errors
         if (allErrors.length > 20) {
           setErrors(prev => [...prev, `... y ${allErrors.length - 20} errores más`]);
         }
       }
 
       setData(normalizedData as (CoordinadorRow | EstudianteRow)[]);
     } catch (error) {
       console.error('Error parsing Excel:', error);
       setErrors(['Error al leer el archivo. Asegúrese de que sea un archivo Excel válido.']);
     } finally {
       setIsLoading(false);
     }
   }, [expectedColumns, type]);
 
  const handleUpload = useCallback(async () => {
    if (data.length === 0 || errors.length > 0) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // For large datasets, use the edge function
      const payload = type === 'coordinadores' 
        ? { type: 'coordinadores', coordinadores: data, estudiantes: [] }
        : { type: 'estudiantes', coordinadores: [], estudiantes: data };

      const { data: result, error } = await supabase.functions.invoke('import-excel', {
        body: payload,
      });

      if (error) throw error;

      const successCount = type === 'coordinadores' 
        ? result.results.coordinadores.inserted 
        : result.results.estudiantes.inserted;
      const failedCount = type === 'coordinadores'
        ? result.results.coordinadores.errors
        : result.results.estudiantes.errors;

      setUploadResult({ success: successCount, failed: failedCount });
      setProgress(100);
      
      if (failedCount === 0) {
        toast.success(`${successCount} registros importados exitosamente`);
      } else {
        toast.warning(`${successCount} importados, ${failedCount} fallidos`);
       }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error al cargar los datos');
    } finally {
      setIsUploading(false);
    }
  }, [data, errors, type]);
 
   const downloadTemplate = () => {
     const templateData = type === 'coordinadores' 
       ? [{ sede: 'Fusagasugá', facultad: 'Ingeniería', programa: 'Ingeniería de Sistemas', nombre_completo: 'Juan Pérez', correo: 'juan@ucundinamarca.edu.co' }]
       : [{ sede: 'Fusagasugá', facultad: 'Ingeniería', programa: 'Ingeniería de Sistemas', documento: '1234567890', nombre_completo: 'María García', correo: 'maria@ucundinamarca.edu.co' }];
     
     const ws = XLSX.utils.json_to_sheet(templateData);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
     XLSX.writeFile(wb, `plantilla_${type}.xlsx`);
   };
 
   const resetUploader = () => {
     setFile(null);
     setData([]);
     setErrors([]);
     setUploadResult(null);
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <FileSpreadsheet className="h-5 w-5" />
           Importar {type === 'coordinadores' ? 'Coordinadores' : 'Estudiantes'}
         </CardTitle>
         <CardDescription>
           Cargue un archivo Excel con los datos de {type === 'coordinadores' ? 'coordinadores autorizados' : 'estudiantes autorizados'}
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         {isUploading && (
           <Progress value={progress} className="w-full" />
         )}
 
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={downloadTemplate}>
             <Download className="h-4 w-4 mr-2" />
             Descargar Plantilla
           </Button>
         </div>
 
         <div className="space-y-2">
           <Label>Columnas requeridas:</Label>
           <div className="flex flex-wrap gap-2">
             {expectedColumns.map(col => (
               <Badge key={col} variant="secondary">{col}</Badge>
             ))}
           </div>
         </div>
 
         <div className="space-y-2">
           <Label htmlFor="excel-file">Archivo Excel</Label>
           <Input
             id="excel-file"
             type="file"
             accept=".xlsx,.xls"
             onChange={handleFileChange}
             disabled={isLoading || isUploading}
           />
         </div>
 
         {isLoading && (
           <div className="flex items-center gap-2 text-muted-foreground">
             <Loader2 className="h-4 w-4 animate-spin" />
             Procesando archivo...
           </div>
         )}
 
         {errors.length > 0 && (
           <Alert variant="destructive">
             <X className="h-4 w-4" />
             <AlertDescription>
               <ul className="list-disc pl-4 space-y-1">
                 {errors.map((error, i) => (
                   <li key={i}>{error}</li>
                 ))}
               </ul>
             </AlertDescription>
           </Alert>
         )}
 
         {data.length > 0 && errors.length === 0 && (
           <>
             <Alert>
               <Check className="h-4 w-4" />
               <AlertDescription>
                 {data.length} registros listos para importar
               </AlertDescription>
             </Alert>
 
             <ScrollArea className="h-64 rounded-md border">
               <Table>
                 <TableHeader>
                   <TableRow>
                     {expectedColumns.map(col => (
                       <TableHead key={col}>{col}</TableHead>
                     ))}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {data.slice(0, 50).map((row, i) => (
                     <TableRow key={i}>
                       {expectedColumns.map(col => (
                         <TableCell key={col} className="text-xs">
                           {String((row as Record<string, any>)[col] || '')}
                         </TableCell>
                       ))}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </ScrollArea>
             {data.length > 50 && (
               <p className="text-sm text-muted-foreground">
                 Mostrando 50 de {data.length} registros
               </p>
             )}
           </>
         )}
 
         {uploadResult && (
           <Alert variant={uploadResult.failed === 0 ? 'default' : 'destructive'}>
             <AlertDescription>
               Resultado: {uploadResult.success} exitosos, {uploadResult.failed} fallidos
             </AlertDescription>
           </Alert>
         )}
 
         <div className="flex gap-2">
           <Button 
             onClick={handleUpload} 
             disabled={data.length === 0 || errors.length > 0 || isUploading}
           >
             {isUploading ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 Importando...
               </>
             ) : (
               <>
                 <Upload className="h-4 w-4 mr-2" />
                 Importar {data.length} registros
               </>
             )}
           </Button>
           {(data.length > 0 || file) && (
             <Button variant="outline" onClick={resetUploader}>
               Limpiar
             </Button>
           )}
         </div>
       </CardContent>
     </Card>
   );
 };