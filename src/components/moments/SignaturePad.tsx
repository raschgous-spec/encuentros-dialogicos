import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PenTool, Trash2, Save, Check } from 'lucide-react';

interface SignaturePadProps {
  userId: string;
  momento: string;
  role: 'estudiante' | 'coordinador';
  label: string;
  isLocked?: boolean;
}

export const SignaturePad = ({ userId, momento, role, label, isLocked = false }: SignaturePadProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingSignature, setExistingSignature] = useState<string | null>(null);

  const filePath = `${userId}/${momento}/firmas/${role}.png`;

  const loadSignature = useCallback(async () => {
    try {
      const { data } = supabase.storage
        .from('actas-attachments')
        .getPublicUrl(filePath);

      // Check if file exists by trying to fetch it
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        setExistingSignature(data.publicUrl + '?t=' + Date.now());
        setIsSaved(true);
      }
    } catch {
      // No existing signature
    }
  }, [filePath]);

  useEffect(() => {
    if (userId) loadSignature();
  }, [userId, loadSignature]);

  useEffect(() => {
    if (existingSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLocked || isSaved) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isLocked || isSaved) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSaved(false);
    setExistingSignature(null);
  };

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] !== 0) return false;
    }
    return true;
  };

  const saveSignature = async () => {
    if (isCanvasEmpty()) {
      toast({ title: 'Firma vacía', description: 'Por favor dibuje su firma antes de guardar', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Error al generar imagen');

      // Remove old file first
      await supabase.storage.from('actas-attachments').remove([filePath]);

      const { error } = await supabase.storage
        .from('actas-attachments')
        .upload(filePath, blob, { contentType: 'image/png', upsert: true });

      if (error) throw error;

      setIsSaved(true);
      toast({ title: 'Firma guardada', description: `La firma del ${label.toLowerCase()} se ha guardado correctamente` });
    } catch (error) {
      console.error('Error saving signature:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la firma', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const removeSignature = async () => {
    try {
      await supabase.storage.from('actas-attachments').remove([filePath]);
      clearCanvas();
      toast({ title: 'Firma eliminada' });
    } catch (error) {
      console.error('Error removing signature:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <PenTool className="h-4 w-4 text-primary" />
          {label}
          {isSaved && <Check className="h-4 w-4 text-green-600" />}
        </h4>
        {!isLocked && (
          <div className="flex gap-2">
            {!isSaved && (
              <Button variant="default" size="sm" onClick={saveSignature} disabled={isSaving}>
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={isSaved ? removeSignature : clearCanvas}>
              <Trash2 className="h-3 w-3 mr-1" />
              {isSaved ? 'Eliminar' : 'Limpiar'}
            </Button>
          </div>
        )}
      </div>
      <div className={`border-2 rounded-lg overflow-hidden ${isSaved ? 'border-green-300 bg-green-50/30' : 'border-dashed border-muted-foreground/30'}`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-[120px] cursor-crosshair touch-none"
          style={{ background: 'transparent' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      {!isSaved && !isLocked && (
        <p className="text-xs text-muted-foreground">Dibuje su firma en el recuadro usando el mouse o pantalla táctil</p>
      )}
    </div>
  );
};

// Utility: get signature URLs for PDF generation
export const getSignatureUrls = async (userId: string, momento: string): Promise<{ estudiante?: string; coordinador?: string }> => {
  const result: { estudiante?: string; coordinador?: string } = {};

  for (const role of ['estudiante', 'coordinador'] as const) {
    const path = `${userId}/${momento}/firmas/${role}.png`;
    const { data } = supabase.storage.from('actas-attachments').getPublicUrl(path);

    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        result[role] = data.publicUrl;
      }
    } catch {
      // Signature doesn't exist
    }
  }

  return result;
};

// Utility: add signatures section to PDF
export const addSignaturesToPDF = async (doc: any, userId: string, momento: string, yPos: number): Promise<number> => {
  const signatures = await getSignatureUrls(userId, momento);
  if (!signatures.estudiante && !signatures.coordinador) return yPos;

  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FIRMAS', 20, yPos);
  yPos += 10;

  const signWidth = 70;
  const signHeight = 25;
  const pageWidth = doc.internal.pageSize.getWidth();

  const addSig = async (url: string, label: string, xPos: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(dataUrl, 'PNG', xPos, yPos, signWidth, signHeight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.line(xPos, yPos + signHeight + 2, xPos + signWidth, yPos + signHeight + 2);
      doc.text(label, xPos + signWidth / 2, yPos + signHeight + 7, { align: 'center' });
    } catch (err) {
      console.error('Error adding signature to PDF:', err);
      doc.setFontSize(8);
      doc.line(xPos, yPos + signHeight + 2, xPos + signWidth, yPos + signHeight + 2);
      doc.text(label, xPos + signWidth / 2, yPos + signHeight + 7, { align: 'center' });
    }
  };

  const leftX = 20;
  const rightX = pageWidth - 20 - signWidth;

  if (signatures.estudiante) await addSig(signatures.estudiante, 'Firma del Estudiante', leftX);
  else {
    doc.setFontSize(8);
    doc.line(leftX, yPos + signHeight + 2, leftX + signWidth, yPos + signHeight + 2);
    doc.text('Firma del Estudiante', leftX + signWidth / 2, yPos + signHeight + 7, { align: 'center' });
  }

  if (signatures.coordinador) await addSig(signatures.coordinador, 'Firma del Coordinador', rightX);
  else {
    doc.setFontSize(8);
    doc.line(rightX, yPos + signHeight + 2, rightX + signWidth, yPos + signHeight + 2);
    doc.text('Firma del Coordinador', rightX + signWidth / 2, yPos + signHeight + 7, { align: 'center' });
  }

  return yPos + signHeight + 15;
};
