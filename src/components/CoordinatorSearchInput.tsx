import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CoordinatorResult {
  id: string;
  nombre_completo: string;
  correo: string;
  programa: string;
  facultad: string;
  sede: string;
}

interface CoordinatorSearchInputProps {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
}

export const CoordinatorSearchInput = ({ value, onChange, disabled = false }: CoordinatorSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CoordinatorResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSelected, setIsSelected] = useState(!!value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('coordinadores_autorizados')
          .select('id, nombre_completo, correo, programa, facultad, sede')
          .ilike('nombre_completo', `%${searchTerm}%`)
          .limit(10);

        if (!error && data) {
          setResults(data);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Error searching coordinators:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (coordinator: CoordinatorResult) => {
    onChange(coordinator.nombre_completo);
    setSearchTerm('');
    setShowResults(false);
    setIsSelected(true);
  };

  const handleClear = () => {
    if (!disabled) {
      onChange('');
      setIsSelected(false);
      setSearchTerm('');
    }
  };

  if (isSelected && value) {
    return (
      <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/50">
        <UserCheck className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm flex-1">{value}</span>
        {!disabled && (
          <button type="button" onClick={handleClear} className="text-muted-foreground hover:text-foreground text-xs">
            Cambiar
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar coordinador por nombre..."
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((coord) => (
            <button
              key={coord.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between gap-2 text-sm"
              onClick={() => handleSelect(coord)}
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{coord.nombre_completo}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {coord.programa} · {coord.sede}
                </p>
              </div>
              <UserCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm.length >= 2 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">No se encontraron coordinadores</p>
        </div>
      )}

      {isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">Buscando...</p>
        </div>
      )}
    </div>
  );
};
