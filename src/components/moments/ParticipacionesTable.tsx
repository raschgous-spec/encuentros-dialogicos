import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { useState } from 'react';

interface ParticipacionesTableProps {
  control: any;
  baseName: string;
  isLocked: boolean;
}

export const ParticipacionesTable = ({ control, baseName, isLocked }: ParticipacionesTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: baseName,
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-between"
          disabled={isLocked}
        >
          <span>Participaciones y aportes</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ nombreEstudiante: '', preguntaAporte: '', respuesta: '' })}
              disabled={isLocked}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar participación
            </Button>
          </div>
          
          {fields.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Nombre y Apellido del Estudiante</TableHead>
                    <TableHead className="w-[30%]">Pregunta o Aporte</TableHead>
                    <TableHead className="w-[30%]">Respuesta</TableHead>
                    <TableHead className="w-[10%]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={control}
                          name={`${baseName}.${index}.nombreEstudiante`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Nombre completo"
                                  disabled={isLocked}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={control}
                          name={`${baseName}.${index}.preguntaAporte`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Pregunta o aporte"
                                  className="min-h-[60px]"
                                  disabled={isLocked}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={control}
                          name={`${baseName}.${index}.respuesta`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Respuesta"
                                  className="min-h-[60px]"
                                  disabled={isLocked}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={isLocked}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay participaciones registradas. Haz clic en "Agregar participación" para comenzar.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
