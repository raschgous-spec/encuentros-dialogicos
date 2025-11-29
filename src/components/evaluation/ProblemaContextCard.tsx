import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Globe } from "lucide-react";

interface ProblemaContextCardProps {
  tipo: 'dimension' | 'translocal';
  dimension: string;
  problematica: string;
  caracteristicas?: string;
  unidad_regional?: string;
  facultad?: string;
  programa_academico?: string;
}

export const ProblemaContextCard = ({ 
  tipo, 
  dimension, 
  problematica, 
  caracteristicas,
  unidad_regional,
  facultad,
  programa_academico
}: ProblemaContextCardProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {tipo === 'dimension' ? (
            <BookOpen className="w-5 h-5 text-primary" />
          ) : (
            <Globe className="w-5 h-5 text-primary" />
          )}
          <CardTitle className="text-lg">Problemática Seleccionada</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {tipo === 'dimension' ? 'Por Dimensión' : 'Banco Translocal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tipo === 'translocal' && (unidad_regional || facultad || programa_academico) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b">
            {unidad_regional && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Unidad Regional:</p>
                <Badge variant="outline" className="text-xs">{unidad_regional}</Badge>
              </div>
            )}
            {facultad && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Facultad:</p>
                <Badge variant="outline" className="text-xs">{facultad}</Badge>
              </div>
            )}
            {programa_academico && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Programa Académico:</p>
                <Badge variant="outline" className="text-xs">{programa_academico}</Badge>
              </div>
            )}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {tipo === 'dimension' ? 'Dimensión:' : 'Contexto:'}
          </p>
          <p className="text-sm font-semibold">{dimension}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Problemática:</p>
          <p className="text-sm">{problematica}</p>
        </div>
        {caracteristicas && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Características:</p>
            <p className="text-sm text-muted-foreground">{caracteristicas}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
