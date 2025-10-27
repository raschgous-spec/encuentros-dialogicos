import { CasoCentral } from '@/components/CasoCentral';
import { BookOpen } from 'lucide-react';

export const IntroStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <BookOpen className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Diagnóstico de Análisis y Solución de Problemas
        </h1>
      </div>
      
      <CasoCentral />
      
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-lg text-card-foreground">
          Completarás <strong className="text-primary">5 secciones</strong> para analizar este caso.
        </p>
        <p className="text-muted-foreground mt-2">
          Al finalizar, recibirás un informe detallado con tu nivel de dominio en cada herramienta.
        </p>
      </div>
    </div>
  );
};
