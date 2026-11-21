import { z } from "zod";

export const TipoDocumentoSchema = z.enum([
  "escritura",
  "predial",
  "alineamiento_numero_oficial",
  "uso_de_suelo",
  "otro",
]);
export type TipoDocumento = z.infer<typeof TipoDocumentoSchema>;

export const DOCUMENTOS_MINIMOS_RETO_1: readonly TipoDocumento[] = [
  "escritura",
  "predial",
  "alineamiento_numero_oficial",
  "uso_de_suelo",
] as const;

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  escritura: "Escrituras",
  predial: "Predial",
  alineamiento_numero_oficial: "Alineamiento y Número Oficial",
  uso_de_suelo: "Uso de Suelo",
  otro: "Otro documento",
};

export const RecomendacionSchema = z.enum([
  "cumple",
  "requiere_revision",
  "no_cumple",
]);
export type Recomendacion = z.infer<typeof RecomendacionSchema>;

export const RECOMENDACION_LABELS: Record<Recomendacion, string> = {
  cumple: "Cumple",
  requiere_revision: "Requiere revisión",
  no_cumple: "No cumple",
};

export const EstadoAnalisisSchema = z.enum([
  "pendiente",
  "procesando",
  "completado",
  "error",
]);
export type EstadoAnalisis = z.infer<typeof EstadoAnalisisSchema>;

export const EstadoValidacionSchema = z.enum([
  "cumple",
  "no_cumple",
  "requiere_revision",
  "no_aplica",
]);
export type EstadoValidacion = z.infer<typeof EstadoValidacionSchema>;

export const SeveridadSchema = z.enum(["alta", "media", "baja"]);
export type Severidad = z.infer<typeof SeveridadSchema>;

export const EvidenciaSchema = z.object({
  documentoId: z.string().min(1),
  nombreArchivo: z.string().min(1),
  tipoDocumento: TipoDocumentoSchema.optional(),
  pagina: z.number().int().positive().optional(),
  fragmento: z.string().min(1),
  nota: z.string().optional(),
});
export type Evidencia = z.infer<typeof EvidenciaSchema>;

export const DocumentoRecibidoSchema = z.object({
  id: z.string().min(1),
  nombreArchivo: z.string().min(1),
  tipoDetectado: TipoDocumentoSchema,
  confianzaClasificacion: z.number().min(0).max(1),
  paginas: z.number().int().positive().optional(),
  estadoProcesamiento: z.enum(["procesado", "ilegible", "error"]).default("procesado"),
});
export type DocumentoRecibido = z.infer<typeof DocumentoRecibidoSchema>;

export const ValorExtraidoSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
export type ValorExtraido = z.infer<typeof ValorExtraidoSchema>;

export const DatosExtraidosDocumentoSchema = z.object({
  documentoId: z.string().min(1),
  tipoDocumento: TipoDocumentoSchema,
  campos: z.record(z.string(), ValorExtraidoSchema),
  evidencias: z.array(EvidenciaSchema).default([]),
});
export type DatosExtraidosDocumento = z.infer<typeof DatosExtraidosDocumentoSchema>;

export const ValidacionReglaSchema = z.object({
  id: z.string().min(1),
  categoria: z.string().min(1),
  criterio: z.string().min(1),
  estado: EstadoValidacionSchema,
  severidad: SeveridadSchema,
  detalle: z.string().min(1),
  evidencias: z.array(EvidenciaSchema).default([]),
});
export type ValidacionRegla = z.infer<typeof ValidacionReglaSchema>;

export const HallazgoDocumentoSchema = z.object({
  documentoId: z.string().min(1),
  nombreArchivo: z.string().min(1),
  tipoDocumento: TipoDocumentoSchema,
  valorEncontrado: z.string().min(1),
  evidencia: EvidenciaSchema,
});
export type HallazgoDocumento = z.infer<typeof HallazgoDocumentoSchema>;

export const InconsistenciaCruzadaSchema = z.object({
  id: z.string().min(1),
  campo: z.string().min(1),
  descripcion: z.string().min(1),
  severidad: SeveridadSchema,
  hallazgos: z.array(HallazgoDocumentoSchema).min(1),
});
export type InconsistenciaCruzada = z.infer<typeof InconsistenciaCruzadaSchema>;

export const PasoAgenteSchema = z.object({
  agente: z.string().min(1),
  estado: z.enum(["pendiente", "en_progreso", "completado", "error"]),
  resumen: z.string().min(1),
  duracionMs: z.number().nonnegative().optional(),
});
export type PasoAgente = z.infer<typeof PasoAgenteSchema>;

export const ExpedienteAnalisisSchema = z.object({
  expedienteId: z.string().min(1),
  nombreExpediente: z.string().min(1),
  estado: EstadoAnalisisSchema,
  creadoEn: z.string().min(1),
  actualizadoEn: z.string().min(1),
  nivelConfianza: z.number().min(0).max(1).nullable(),
  recomendacion: RecomendacionSchema.nullable(),
  resumenEjecutivo: z.string().nullable(),
  documentosRecibidos: z.array(DocumentoRecibidoSchema).default([]),
  documentosFaltantes: z.array(TipoDocumentoSchema).default([]),
  datosExtraidos: z.array(DatosExtraidosDocumentoSchema).default([]),
  validaciones: z.array(ValidacionReglaSchema).default([]),
  inconsistencias: z.array(InconsistenciaCruzadaSchema).default([]),
  requisitosCumplidos: z.array(z.string()).default([]),
  requisitosNoCumplidos: z.array(z.string()).default([]),
  trazaAgentes: z.array(PasoAgenteSchema).default([]),
  errorMensaje: z.string().nullable().optional(),
});
export type ExpedienteAnalisis = z.infer<typeof ExpedienteAnalisisSchema>;

export const ExpedienteResumenSchema = z.object({
  expedienteId: z.string().min(1),
  nombreExpediente: z.string().min(1),
  estado: EstadoAnalisisSchema,
  recomendacion: RecomendacionSchema.nullable(),
  nivelConfianza: z.number().min(0).max(1).nullable(),
  documentosRecibidosCount: z.number().int().nonnegative(),
  documentosFaltantesCount: z.number().int().nonnegative(),
  inconsistenciasCount: z.number().int().nonnegative(),
  creadoEn: z.string().min(1),
});
export type ExpedienteResumen = z.infer<typeof ExpedienteResumenSchema>;

export const ListaExpedientesResponseSchema = z.object({
  items: z.array(ExpedienteResumenSchema),
});
export type ListaExpedientesResponse = z.infer<typeof ListaExpedientesResponseSchema>;

export const CrearExpedienteResponseSchema = z.object({
  expedienteId: z.string().min(1),
  estado: EstadoAnalisisSchema,
  creadoEn: z.string().min(1),
});
export type CrearExpedienteResponse = z.infer<typeof CrearExpedienteResponseSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string().optional(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export interface CrearExpedienteInput {
  nombreExpediente: string;
  archivos: File[];
}
