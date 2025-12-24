import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProblematicaNivelatorio {
  tipo: 'dimension' | 'translocal';
  dimension: string;
  problematica: string;
  caracteristicas?: string;
  unidad_regional?: string;
  linea_translocal?: string;
  fuente?: string;
}

export const useNivelatorioProblematica = () => {
  const { user } = useAuth();
  const [problematica, setProblematica] = useState<ProblematicaNivelatorio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProblematica = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load from student_evaluations table (nivelatorio evaluation)
        const { data, error } = await supabase
          .from('student_evaluations')
          .select('dimension, problematica, unidad_regional, facultad, programa_academico')
          .eq('user_id', user.id)
          .eq('momento', 'nivelatorio')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Determine tipo based on dimension format
          const tipo = data.dimension.includes(' - ') ? 'translocal' : 'dimension';
          
          setProblematica({
            tipo,
            dimension: data.dimension,
            problematica: data.problematica,
            caracteristicas: undefined, // We don't store this in student_evaluations currently
            unidad_regional: data.unidad_regional || undefined,
            linea_translocal: data.facultad || undefined,
            fuente: data.programa_academico || undefined
          });
        }
      } catch (error) {
        console.error('Error loading nivelatorio problematica:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProblematica();
  }, [user]);

  return { problematica, loading };
};
