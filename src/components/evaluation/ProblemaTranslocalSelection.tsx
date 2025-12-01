import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProblemaTranslocal, problemasTranslocales } from "@/data/problemasTranslocales";
import { ChevronLeft, Filter } from "lucide-react";

interface ProblemaTranslocalSelectionProps {
  onSelect: (problema: ProblemaTranslocal) => void;
  onBack: () => void;
}

export const ProblemaTranslocalSelection = ({ onSelect, onBack }: ProblemaTranslocalSelectionProps) => {
  const [selectedProblemaId, setSelectedProblemaId] = useState<string>("");
  const [selectedUnidadRegional, setSelectedUnidadRegional] = useState<string>("");
  const [selectedFacultad, setSelectedFacultad] = useState<string>("");
  const [selectedPrograma, setSelectedPrograma] = useState<string>("");

  // Get unique values for each filter level
  const unidadesRegionales = useMemo(() => {
    const uniques = Array.from(new Set(problemasTranslocales.map(p => p.unidad_regional)));
    return uniques.sort();
  }, []);

  const facultadesDisponibles = useMemo(() => {
    if (!selectedUnidadRegional) return [];
    const filtered = problemasTranslocales.filter(p => p.unidad_regional === selectedUnidadRegional);
    const uniques = Array.from(new Set(filtered.map(p => p.facultad)));
    return uniques.sort();
  }, [selectedUnidadRegional]);

  const programasDisponibles = useMemo(() => {
    if (!selectedFacultad) return [];
    const filtered = problemasTranslocales.filter(
      p => p.unidad_regional === selectedUnidadRegional && p.facultad === selectedFacultad
    );
    const uniques = Array.from(new Set(filtered.map(p => p.programa_academico)));
    return uniques.sort();
  }, [selectedUnidadRegional, selectedFacultad]);

  const problemasFiltered = useMemo(() => {
    let filtered = problemasTranslocales;
    
    if (selectedUnidadRegional) {
      filtered = filtered.filter(p => p.unidad_regional === selectedUnidadRegional);
    }
    if (selectedFacultad) {
      filtered = filtered.filter(p => p.facultad === selectedFacultad);
    }
    if (selectedPrograma) {
      filtered = filtered.filter(p => p.programa_academico === selectedPrograma);
    }
    
    return filtered;
  }, [selectedUnidadRegional, selectedFacultad, selectedPrograma]);

  const handleUnidadChange = (value: string) => {
    setSelectedUnidadRegional(value);
    setSelectedFacultad("");
    setSelectedPrograma("");
    setSelectedProblemaId("");
  };

  const handleFacultadChange = (value: string) => {
    setSelectedFacultad(value);
    setSelectedPrograma("");
    setSelectedProblemaId("");
  };

  const handleProgramaChange = (value: string) => {
    setSelectedPrograma(value);
    setSelectedProblemaId("");
  };

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
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrar Problemáticas
          </CardTitle>
          <CardDescription>
            Selecciona la Unidad Regional, Facultad y Programa Académico para filtrar las problemáticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="unidad-regional">1. Unidad Regional (Extensión)</Label>
              <Select value={selectedUnidadRegional} onValueChange={handleUnidadChange}>
                <SelectTrigger id="unidad-regional">
                  <SelectValue placeholder="Seleccionar unidad regional" />
                </SelectTrigger>
                <SelectContent>
                  {unidadesRegionales.map((unidad) => (
                    <SelectItem key={unidad} value={unidad}>
                      {unidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facultad">2. Facultad</Label>
              <Select 
                value={selectedFacultad} 
                onValueChange={handleFacultadChange}
                disabled={!selectedUnidadRegional}
              >
                <SelectTrigger id="facultad">
                  <SelectValue placeholder="Seleccionar facultad" />
                </SelectTrigger>
                <SelectContent>
                  {facultadesDisponibles.map((facultad) => (
                    <SelectItem key={facultad} value={facultad}>
                      {facultad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="programa">3. Programa Académico</Label>
              <Select 
                value={selectedPrograma} 
                onValueChange={handleProgramaChange}
                disabled={!selectedFacultad}
              >
                <SelectTrigger id="programa">
                  <SelectValue placeholder="Seleccionar programa" />
                </SelectTrigger>
                <SelectContent>
                  {programasDisponibles.map((programa) => (
                    <SelectItem key={programa} value={programa}>
                      {programa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPrograma && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Filtros aplicados:</strong> {selectedUnidadRegional} → {selectedFacultad} → {selectedPrograma}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {problemasFiltered.length} problemática{problemasFiltered.length !== 1 ? 's' : ''} encontrada{problemasFiltered.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            <RadioGroup value={selectedProblemaId} onValueChange={setSelectedProblemaId}>
              <div className="space-y-4">
                {problemasFiltered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Selecciona los filtros para ver las problemáticas</p>
                    <p className="text-sm">Comienza eligiendo una Unidad Regional</p>
                  </div>
                ) : (
                  problemasFiltered.map((problema) => (
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
                  ))
                )}
              </div>
            </RadioGroup>
          </ScrollArea>

          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={!selectedProblemaId}
              size="lg"
            >
              Continuar a la Valoración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
