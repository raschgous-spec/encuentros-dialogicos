import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe } from "lucide-react";

interface TipoSeleccionProps {
  onSelect: (tipo: 'dimension' | 'translocal') => void;
}

export const TipoSeleccion = ({ onSelect }: TipoSeleccionProps) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Evaluación - Caso de Estudio</h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de problema que deseas analizar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Seleccionar por Dimensión</CardTitle>
            </div>
            <CardDescription>
              Elige una de las 7 dimensiones del modelo educativo y selecciona un problema específico dentro de ella
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li>• Dimensión de la Persona</li>
              <li>• Dimensión del Aula</li>
              <li>• Dimensión de la Cultura</li>
              <li>• Dimensión de la Familia</li>
              <li>• Dimensión de la Naturaleza</li>
              <li>• Dimensión de la Institución</li>
              <li>• Dimensión de la Sociedad</li>
            </ul>
            <Button 
              onClick={() => onSelect('dimension')} 
              className="w-full"
            >
              Seleccionar Dimensión
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-primary/10">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Banco de Problemas Translocales</CardTitle>
            </div>
            <CardDescription>
              Explora problemáticas identificadas en diferentes regiones, facultades y programas académicos de Cundinamarca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li>• Problemas regionales específicos</li>
              <li>• Contexto de facultad y programa</li>
              <li>• Características detalladas</li>
              <li>• 36+ problemáticas identificadas</li>
            </ul>
            <Button 
              onClick={() => onSelect('translocal')} 
              className="w-full"
              variant="secondary"
            >
              Ver Banco Translocal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
