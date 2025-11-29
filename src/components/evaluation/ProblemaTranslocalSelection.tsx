import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProblemaTranslocal, problemasTranslocales } from "@/data/problemasTranslocales";
import { ChevronLeft } from "lucide-react";

interface ProblemaTranslocalSelectionProps {
  onSelect: (problema: ProblemaTranslocal) => void;
  onBack: () => void;
}

export const ProblemaTranslocalSelection = ({ onSelect, onBack }: ProblemaTranslocalSelectionProps) => {
  const [selectedProblemaId, setSelectedProblemaId] = useState<string>("");

  const handleContinue = () => {
    const selectedProblema = problemasTranslocales.find(p => p.id === selectedProblemaId);
    if (selectedProblema) {
      onSelect(selectedProblema);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Banco de Problemas Translocales</h2>
          <p className="text-muted-foreground">
            Selecciona una problemática regional para analizar
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problemáticas Identificadas</CardTitle>
          <CardDescription>
            Estas problemáticas han sido identificadas en diferentes unidades regionales, facultades y programas académicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <RadioGroup value={selectedProblemaId} onValueChange={setSelectedProblemaId}>
              <div className="space-y-4">
                {problemasTranslocales.map((problema) => (
                  <Card
                    key={problema.id}
                    className={`cursor-pointer transition-colors ${
                      selectedProblemaId === problema.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedProblemaId(problema.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={problema.id} id={problema.id} className="mt-1" />
                        <Label
                          htmlFor={problema.id}
                          className="flex-1 cursor-pointer space-y-2"
                        >
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">{problema.unidad_regional}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {problema.programa_academico}
                            </Badge>
                          </div>
                          <p className="font-semibold text-foreground">
                            {problema.problematica}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {problema.caracteristicas}
                          </p>
                          <p className="text-xs text-muted-foreground italic">
                            Facultad: {problema.facultad}
                          </p>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </ScrollArea>

          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={!selectedProblemaId}
              size="lg"
            >
              Continuar a la Evaluación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
