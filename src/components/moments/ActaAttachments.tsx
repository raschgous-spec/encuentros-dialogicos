import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, Trash2, Image, FileSpreadsheet, Camera } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ActaAttachmentsProps {
  userId: string;
  momento: string;
  isLocked?: boolean;
}

interface UploadedPhoto {
  name: string;
  url: string;
  path: string;
}

export const ActaAttachments = ({ userId, momento, isLocked = false }: ActaAttachmentsProps) => {
  const { toast } = useToast();
  const [attendanceFile, setAttendanceFile] = useState<string | null>(null);
  const [attendanceUrl, setAttendanceUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const basePath = `${userId}/${momento}`;

  const loadAttachments = useCallback(async () => {
    try {
      // Check for attendance file
      const { data: attendanceData } = await supabase.storage
        .from('actas-attachments')
        .list(`${basePath}`, { search: 'asistentes' });

      if (attendanceData && attendanceData.length > 0) {
        const file = attendanceData[0];
        setAttendanceFile(file.name);
        const { data: urlData } = supabase.storage
          .from('actas-attachments')
          .getPublicUrl(`${basePath}/${file.name}`);
        setAttendanceUrl(urlData.publicUrl);
      }

      // Check for photos
      const { data: photosData } = await supabase.storage
        .from('actas-attachments')
        .list(`${basePath}/evidencias`);

      if (photosData && photosData.length > 0) {
        const photoItems: UploadedPhoto[] = photosData
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => {
            const { data: urlData } = supabase.storage
              .from('actas-attachments')
              .getPublicUrl(`${basePath}/evidencias/${f.name}`);
            return {
              name: f.name,
              url: urlData.publicUrl,
              path: `${basePath}/evidencias/${f.name}`,
            };
          });
        setPhotos(photoItems);
      }
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  }, [basePath]);

  useEffect(() => {
    if (userId) loadAttachments();
  }, [userId, loadAttachments]);

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = ['No.', 'Nombre Completo', 'Documento', 'Correo Institucional', 'Programa Académico', 'Facultad', 'Firma'];
    const data = [headers, ['1', '', '', '', '', '', '']];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Asistentes');
    XLSX.writeFile(wb, `plantilla_asistentes_${momento}.xlsx`);
  };

  const handleAttendanceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({ title: 'Formato no válido', description: 'Solo se aceptan archivos Excel (.xlsx, .xls)', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${basePath}/asistentes_${Date.now()}.xlsx`;
      
      // Remove old file if exists
      if (attendanceFile) {
        await supabase.storage.from('actas-attachments').remove([`${basePath}/${attendanceFile}`]);
      }

      const { error } = await supabase.storage
        .from('actas-attachments')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      toast({ title: 'Archivo subido', description: 'La lista de asistentes se ha cargado correctamente' });
      await loadAttachments();
    } catch (error) {
      console.error('Error uploading attendance:', error);
      toast({ title: 'Error', description: 'No se pudo subir el archivo', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const ext = file.name.split('.').pop();
        const filePath = `${basePath}/evidencias/foto_${Date.now()}_${i}.${ext}`;

        const { error } = await supabase.storage
          .from('actas-attachments')
          .upload(filePath, file);

        if (error) throw error;
      }

      toast({ title: 'Fotos subidas', description: `${files.length} evidencia(s) fotográfica(s) cargada(s)` });
      await loadAttachments();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({ title: 'Error', description: 'No se pudieron subir las fotos', variant: 'destructive' });
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const removePhoto = async (photo: UploadedPhoto) => {
    try {
      await supabase.storage.from('actas-attachments').remove([photo.path]);
      setPhotos(prev => prev.filter(p => p.path !== photo.path));
      toast({ title: 'Foto eliminada' });
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const removeAttendance = async () => {
    if (!attendanceFile) return;
    try {
      await supabase.storage.from('actas-attachments').remove([`${basePath}/${attendanceFile}`]);
      setAttendanceFile(null);
      setAttendanceUrl(null);
      toast({ title: 'Archivo eliminado' });
    } catch (error) {
      console.error('Error removing attendance file:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Excel Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Lista de Asistentes al Encuentro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate} disabled={isLocked}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla Excel
            </Button>
            {!isLocked && (
              <Label className="cursor-pointer">
                <Button variant="secondary" size="sm" asChild disabled={uploading}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Cargar Lista de Asistentes'}
                  </span>
                </Button>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleAttendanceUpload}
                  disabled={isLocked || uploading}
                />
              </Label>
            )}
          </div>
          {attendanceFile && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm flex-1">{attendanceFile}</span>
              {attendanceUrl && (
                <a href={attendanceUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {!isLocked && (
                <Button variant="ghost" size="sm" onClick={removeAttendance}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Evidence Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Evidencias Fotográficas del Encuentro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLocked && (
            <Label className="cursor-pointer">
              <Button variant="secondary" size="sm" asChild disabled={uploadingPhotos}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingPhotos ? 'Subiendo...' : 'Subir Evidencias Fotográficas'}
                </span>
              </Button>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isLocked || uploadingPhotos}
              />
            </Label>
          )}
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.path} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-32 object-cover"
                  />
                  {!isLocked && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(photo)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No se han subido evidencias fotográficas aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Utility functions for PDF generation
export const getAttendanceData = async (userId: string, momento: string): Promise<any[][] | null> => {
  try {
    const basePath = `${userId}/${momento}`;
    const { data: files } = await supabase.storage
      .from('actas-attachments')
      .list(basePath, { search: 'asistentes' });

    if (!files || files.length === 0) return null;

    const { data: fileData } = await supabase.storage
      .from('actas-attachments')
      .download(`${basePath}/${files[0].name}`);

    if (!fileData) return null;

    const arrayBuffer = await fileData.arrayBuffer();
    const wb = XLSX.read(arrayBuffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
  } catch (error) {
    console.error('Error reading attendance file:', error);
    return null;
  }
};

export const getEvidencePhotos = async (userId: string, momento: string): Promise<string[]> => {
  try {
    const basePath = `${userId}/${momento}/evidencias`;
    const { data: files } = await supabase.storage
      .from('actas-attachments')
      .list(basePath);

    if (!files || files.length === 0) return [];

    return files
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const { data } = supabase.storage
          .from('actas-attachments')
          .getPublicUrl(`${basePath}/${f.name}`);
        return data.publicUrl;
      });
  } catch (error) {
    console.error('Error loading evidence photos:', error);
    return [];
  }
};
