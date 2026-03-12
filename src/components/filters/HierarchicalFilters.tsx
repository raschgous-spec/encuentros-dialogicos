import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, FilterX } from 'lucide-react';

export interface FilterValues {
  sede: string;
  facultad: string;
  programa: string;
}

interface HierarchicalFiltersProps {
  data: Array<{ sede: string; facultad: string; programa: string }>;
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onExportPDF?: () => void;
  showExport?: boolean;
}

export const HierarchicalFilters = ({
  data,
  filters,
  onFilterChange,
  onExportPDF,
  showExport = true,
}: HierarchicalFiltersProps) => {
  const sedes = useMemo(() => {
    const set = new Set(data.map(d => d.sede).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const facultades = useMemo(() => {
    const filtered = filters.sede ? data.filter(d => d.sede === filters.sede) : data;
    const set = new Set(filtered.map(d => d.facultad).filter(Boolean));
    return Array.from(set).sort();
  }, [data, filters.sede]);

  const programas = useMemo(() => {
    let filtered = data;
    if (filters.sede) filtered = filtered.filter(d => d.sede === filters.sede);
    if (filters.facultad) filtered = filtered.filter(d => d.facultad === filters.facultad);
    const set = new Set(filtered.map(d => d.programa).filter(Boolean));
    return Array.from(set).sort();
  }, [data, filters.sede, filters.facultad]);

  const hasFilters = filters.sede || filters.facultad || filters.programa;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Sede</Label>
        <Select
          value={filters.sede || '_all'}
          onValueChange={(v) =>
            onFilterChange({ sede: v === '_all' ? '' : v, facultad: '', programa: '' })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {sedes.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Facultad</Label>
        <Select
          value={filters.facultad || '_all'}
          onValueChange={(v) =>
            onFilterChange({ ...filters, facultad: v === '_all' ? '' : v, programa: '' })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {facultades.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Programa</Label>
        <Select
          value={filters.programa || '_all'}
          onValueChange={(v) =>
            onFilterChange({ ...filters, programa: v === '_all' ? '' : v })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos</SelectItem>
            {programas.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({ sede: '', facultad: '', programa: '' })}
        >
          <FilterX className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}

      {showExport && onExportPDF && (
        <Button variant="outline" size="sm" onClick={onExportPDF} className="ml-auto">
          <Download className="h-4 w-4 mr-1" />
          Exportar PDF
        </Button>
      )}
    </div>
  );
};
