export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actas_encuentro: {
        Row: {
          agenda_bienvenida: string
          agenda_documento_coordinador: string
          agenda_informe: string
          agenda_intervencion_estudiantes: string
          agenda_lectura_orden: string
          agenda_secretario: string
          correo_secretario: string
          created_at: string
          estudiante_id: string
          facultad: string
          facultad_programa_secretario: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          identificacion_secretario: string
          lugar: string
          momento: string
          nombre_director: string
          nombre_secretario: string
          objetivos: string
          participantes: string
          plan_mejoramiento: Json
          programa_academico: string
          proposiciones_estudiantes: string
          responsable: string
          temas_facultad: Json
          temas_institucionales: Json
          temas_programa: Json
          updated_at: string
        }
        Insert: {
          agenda_bienvenida: string
          agenda_documento_coordinador: string
          agenda_informe: string
          agenda_intervencion_estudiantes: string
          agenda_lectura_orden: string
          agenda_secretario: string
          correo_secretario: string
          created_at?: string
          estudiante_id: string
          facultad: string
          facultad_programa_secretario: string
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          identificacion_secretario: string
          lugar: string
          momento: string
          nombre_director: string
          nombre_secretario: string
          objetivos: string
          participantes: string
          plan_mejoramiento?: Json
          programa_academico: string
          proposiciones_estudiantes: string
          responsable: string
          temas_facultad?: Json
          temas_institucionales?: Json
          temas_programa?: Json
          updated_at?: string
        }
        Update: {
          agenda_bienvenida?: string
          agenda_documento_coordinador?: string
          agenda_informe?: string
          agenda_intervencion_estudiantes?: string
          agenda_lectura_orden?: string
          agenda_secretario?: string
          correo_secretario?: string
          created_at?: string
          estudiante_id?: string
          facultad?: string
          facultad_programa_secretario?: string
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          identificacion_secretario?: string
          lugar?: string
          momento?: string
          nombre_director?: string
          nombre_secretario?: string
          objetivos?: string
          participantes?: string
          plan_mejoramiento?: Json
          programa_academico?: string
          proposiciones_estudiantes?: string
          responsable?: string
          temas_facultad?: Json
          temas_institucionales?: Json
          temas_programa?: Json
          updated_at?: string
        }
        Relationships: []
      }
      coordinadores_autorizados: {
        Row: {
          correo: string
          created_at: string | null
          facultad: string
          id: string
          nombre_completo: string
          programa: string
          sede: string
        }
        Insert: {
          correo: string
          created_at?: string | null
          facultad: string
          id?: string
          nombre_completo: string
          programa: string
          sede: string
        }
        Update: {
          correo?: string
          created_at?: string | null
          facultad?: string
          id?: string
          nombre_completo?: string
          programa?: string
          sede?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          codigo: string
          created_at: string
          descripcion: string | null
          docente_id: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          descripcion?: string | null
          docente_id: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          descripcion?: string | null
          docente_id?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudiantes_autorizados: {
        Row: {
          correo: string
          created_at: string | null
          documento: string
          facultad: string
          id: string
          nombre_completo: string
          programa: string
          sede: string
        }
        Insert: {
          correo: string
          created_at?: string | null
          documento: string
          facultad: string
          id?: string
          nombre_completo: string
          programa: string
          sede: string
        }
        Update: {
          correo?: string
          created_at?: string | null
          documento?: string
          facultad?: string
          id?: string
          nombre_completo?: string
          programa?: string
          sede?: string
        }
        Relationships: []
      }
      evaluaciones: {
        Row: {
          created_at: string
          curso_id: string | null
          estudiante_id: string
          fecha: string
          id: string
          nivel: string | null
          puntaje_affinity: number | null
          puntaje_brainstorming: number | null
          puntaje_dofa: number | null
          puntaje_ishikawa: number | null
          puntaje_pareto: number | null
          puntaje_promedio: number | null
          respuestas_completas: Json | null
          tiempos_respuesta: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          estudiante_id: string
          fecha?: string
          id?: string
          nivel?: string | null
          puntaje_affinity?: number | null
          puntaje_brainstorming?: number | null
          puntaje_dofa?: number | null
          puntaje_ishikawa?: number | null
          puntaje_pareto?: number | null
          puntaje_promedio?: number | null
          respuestas_completas?: Json | null
          tiempos_respuesta?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          estudiante_id?: string
          fecha?: string
          id?: string
          nivel?: string | null
          puntaje_affinity?: number | null
          puntaje_brainstorming?: number | null
          puntaje_dofa?: number | null
          puntaje_ishikawa?: number | null
          puntaje_pareto?: number | null
          puntaje_promedio?: number | null
          respuestas_completas?: Json | null
          tiempos_respuesta?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      momento_progreso: {
        Row: {
          completado: boolean | null
          created_at: string | null
          estudiante_id: string
          fecha_completado: string | null
          id: string
          momento: string
          updated_at: string | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          estudiante_id: string
          fecha_completado?: string | null
          id?: string
          momento: string
          updated_at?: string | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          estudiante_id?: string
          fecha_completado?: string | null
          id?: string
          momento?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          curso_id: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      student_evaluations: {
        Row: {
          affinity_data: Json | null
          arbol_problemas_data: Json | null
          automatic_score: number
          brainstorming_data: Json | null
          completed_at: string
          coordinator_comments: string | null
          coordinator_reviewed: boolean
          coordinator_score: number | null
          created_at: string
          dimension: string
          dofa_data: Json | null
          facultad: string | null
          id: string
          ishikawa_data: Json | null
          max_score: number
          momento: string
          pareto_data: Json | null
          passed: boolean
          problematica: string
          programa_academico: string | null
          reviewed_at: string | null
          unidad_regional: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affinity_data?: Json | null
          arbol_problemas_data?: Json | null
          automatic_score?: number
          brainstorming_data?: Json | null
          completed_at?: string
          coordinator_comments?: string | null
          coordinator_reviewed?: boolean
          coordinator_score?: number | null
          created_at?: string
          dimension: string
          dofa_data?: Json | null
          facultad?: string | null
          id?: string
          ishikawa_data?: Json | null
          max_score?: number
          momento: string
          pareto_data?: Json | null
          passed?: boolean
          problematica: string
          programa_academico?: string | null
          reviewed_at?: string | null
          unidad_regional?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affinity_data?: Json | null
          arbol_problemas_data?: Json | null
          automatic_score?: number
          brainstorming_data?: Json | null
          completed_at?: string
          coordinator_comments?: string | null
          coordinator_reviewed?: boolean
          coordinator_score?: number | null
          created_at?: string
          dimension?: string
          dofa_data?: Json | null
          facultad?: string | null
          id?: string
          ishikawa_data?: Json | null
          max_score?: number
          momento?: string
          pareto_data?: Json | null
          passed?: boolean
          problematica?: string
          programa_academico?: string | null
          reviewed_at?: string | null
          unidad_regional?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_moment: {
        Args: { _estudiante_id: string; _momento: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "docente" | "estudiante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "docente", "estudiante"],
    },
  },
} as const
