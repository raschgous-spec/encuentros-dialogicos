import { z } from 'zod';

// Authentication validation schema
export const authSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muy largo'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Debe incluir mayúscula y número'),
  fullName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  codigoCurso: z.string().trim().min(3, 'Mínimo 3 caracteres').max(20, 'Máximo 20 caracteres').optional()
});

// Coordinator registration validation schema
export const coordinatorAuthSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muy largo'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Debe incluir mayúscula y número'),
  fullName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  facultad: z.string().trim().min(2, 'Seleccione una facultad'),
  programa: z.string().trim().min(2, 'Seleccione un programa'),
  sede: z.string().trim().min(2, 'Seleccione una sede')
});

// Student registration validation schema (with document)
export const studentAuthSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muy largo'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Debe incluir mayúscula y número'),
  fullName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  documento: z.string().trim().min(5, 'Documento inválido').max(20, 'Documento muy largo')
});

// Docente creation validation schema
export const docenteSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muy largo'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Debe incluir mayúscula y número'),
  fullName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres')
});

// Course validation schema
export const cursoSchema = z.object({
  codigo: z.string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),
  nombre: z.string().trim().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  descripcion: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional()
});
