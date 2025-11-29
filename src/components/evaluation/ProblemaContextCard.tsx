import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Globe } from "lucide-react";

interface ProblemaContextCardProps {
  tipo: 'dimension' | 'translocal';
  dimension: string;
  problematica: string;
  caracteristicas?: string;
}

export const ProblemaContextCard = ({ 
  tipo, 
  dimension, 
  problematica, 
  caracteristicas 
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
