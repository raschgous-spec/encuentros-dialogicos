import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudentResult {
  id: string;
  nombre_completo: string;
  documento: string;
  programa: string;
  facultad: string;
  sede: string;
}

interface StudentSearchInputProps {
  currentParticipantes: string;
  onAddStudent: (name: string) => void;
  disabled?: boolean;
}

export const StudentSearchInput = ({ currentParticipantes, onAddStudent, disabled = false }: StudentSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
          .from('estudiantes_autorizados')
          .select('id, nombre_completo, documento, programa, facultad, sede')
          .ilike('nombre_completo', `%${searchTerm}%`)
          .limit(10);

        if (!error && data) {
          setResults(data);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Error searching students:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isAlreadyAdded = (name: string) => {
    const lines = currentParticipantes.split('\n').map(l => l.trim().toLowerCase());
    return lines.includes(name.trim().toLowerCase());
  };

  const handleSelect = (student: StudentResult) => {
    if (!isAlreadyAdded(student.nombre_completo)) {
      onAddStudent(student.nombre_completo);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudiante por nombre..."
            className="pl-9"
            disabled={disabled}
          />
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((student) => {
            const added = isAlreadyAdded(student.nombre_completo);
            return (
              <button
                key={student.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between gap-2 text-sm disabled:opacity-50"
                onClick={() => handleSelect(student)}
                disabled={added}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{student.nombre_completo}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.programa} · {student.facultad}
                  </p>
                </div>
                {added ? (
                  <Badge variant="secondary" className="shrink-0 text-xs">Agregado</Badge>
                ) : (
                  <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm.length >= 2 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">No se encontraron estudiantes</p>
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
