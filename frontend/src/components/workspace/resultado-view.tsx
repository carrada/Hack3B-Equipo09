"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  GitCompareArrows,
  PencilLine,
  Play,
  RotateCw,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusMark, { type StatusMarkState } from "@/components/ui/StatusMark";
import {
  DOCUMENTOS_MINIMOS_RETO_1,
  TIPO_DOCUMENTO_LABELS,
  type DocumentoRevision,
} from "@/lib/contracts";
import { contarResumenRevision } from "@/lib/workspace/review-helpers";

export const AGENT_PIPELINE_STEPS = [
  {
    id: "clasificador",
    label: "01 · Clasificador Documental",
    phase: "Ingesta",
  },
  {
    id: "extractor",
    label: "02 · Extractor Especializado",
    phase: "Ingesta",
  },
  {
    id: "reglas",
    label: "03 · Validador de Reglas",
    phase: "Validación",
  },
  {
    id: "cruzado",
    label: "04 · Validador Cruzado",
    phase: "Validación",
  },
  {
    id: "evidencia",
    label: "05 · Verificador de Evidencia",
    phase: "Trazabilidad",
  },
  {
    id: "dictaminador",
    label: "06 · Dictaminador y Explicador Legal",
    phase: "Dictamen",
  },
] as const;

const STATUS_TEXT: Record<StatusMarkState, string> = {
  pending: "En espera",
  running: "Ejecutando",
  done: "Completado",
  failed: "Con error",
  cancelled: "Omitido",
};

export function ResultadoView({
  documentos,
  confirmedAt,
  isRunningAgents,
  agentStatuses,
  onRunPipelinePreview,
  onRevalidateOnly,
}: {
  documentos: DocumentoRevision[];
  confirmedAt: string | null;
  isRunningAgents: boolean;
  agentStatuses: readonly StatusMarkState[];
  onRunPipelinePreview: () => void;
  onRevalidateOnly: () => void;
}) {
  const summary = contarResumenRevision(documentos);
  const tiposPresentes = new Set(documentos.map((doc) => doc.tipoSeleccionado));
  const manualEdits = documentos.flatMap((doc) =>
    doc.campos
      .filter((campo) => campo.editadoManualmente)
      .map((campo) => ({
        documentoId: doc.documentoId,
        nombreArchivo: doc.nombreArchivo,
        tipoDocumento: doc.tipoSeleccionado,
        campo,
      })),
  );

  const completedAgents = agentStatuses.filter((s) => s === "done").length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/25 bg-secondary/40">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg text-secondary-foreground">
                Dictamen inicial y nivel de confianza
              </CardTitle>
              <CardDescription>
                Vista de Nivel 1: resume la recomendación y el motivo principal
                para que gestor y abogado decidan en segundos.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/40 bg-white text-primary"
            >
              {isRunningAgents
                ? `Ejecutando agentes (${completedAgents}/6)`
                : confirmedAt
                  ? "Paquete listo para backend"
                  : "En espera de análisis"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>
              Documentos en sesión:{" "}
              <span className="font-semibold text-foreground">
                {documentos.length}
              </span>
            </span>
            <span>
              Campos con dato:{" "}
              <span className="font-semibold text-foreground">
                {summary.camposCompletos}/{summary.totalCampos}
              </span>
            </span>
            <span>
              Correcciones manuales:{" "}
              <span className="font-semibold text-foreground">
                {summary.camposEditados}
              </span>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cumple
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Expediente completo, reglas aprobadas y sin inconsistencias
                críticas entre documentos.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Requiere revisión
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Existen condicionantes, diferencias parciales o baja confianza
                que requieren validación legal.
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <XCircle className="h-3.5 w-3.5" />
                No cumple
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Faltan documentos clave, el giro es incompatible o se detectan
                contradicciones bloqueantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {manualEdits.length > 0 && (
        <Card className="border-border bg-white">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PencilLine className="h-4 w-4 text-primary" />
                Auditoría de correcciones manuales ({manualEdits.length})
              </CardTitle>
              <Badge variant="secondary" className="border-border text-primary">
                Trazabilidad Human-in-the-Loop
              </Badge>
            </div>
            <CardDescription>
              El equipo legal siempre distingue qué valor extrajo la IA y qué
              valor corrigió el usuario antes de validar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {manualEdits.map(
                ({ documentoId, nombreArchivo, tipoDocumento, campo }) => (
                  <li
                    key={`${documentoId}-${campo.clave}`}
                    className="flex flex-col gap-1.5 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {campo.etiqueta}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {TIPO_DOCUMENTO_LABELS[tipoDocumento]} (
                          {nombreArchivo})
                        </span>
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        IA: {campo.valorDetectado ?? "Sin detectar"} → Usuario:{" "}
                        <span className="font-semibold text-foreground">
                          {campo.valorActual ?? "Vacío"}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="w-fit border-border text-primary"
                    >
                      Override activo
                    </Badge>
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Nivel 2 · Completitud documental (4/4)
            </CardTitle>
            <CardDescription>
              Estado en vivo de los tipos documentales mínimos del expediente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {DOCUMENTOS_MINIMOS_RETO_1.map((tipo) => {
                const presente = tiposPresentes.has(tipo);
                const status: StatusMarkState = presente
                  ? "done"
                  : confirmedAt
                    ? "failed"
                    : "pending";
                return (
                  <li
                    key={tipo}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <StatusMark
                      status={status}
                      label={TIPO_DOCUMENTO_LABELS[tipo]}
                      color="#7A0704"
                      doneColor="#22c55e"
                      errorColor="#E10600"
                      size={18}
                      fontSize={13}
                      strike={false}
                    />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {presente
                        ? "Cargado"
                        : confirmedAt
                          ? "Faltante"
                          : "Pendiente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompareArrows className="h-4 w-4 text-primary" />
              Nivel 2 · Inconsistencias cruzadas
            </CardTitle>
            <CardDescription>
              Comparativa lado a lado entre documentos del mismo inmueble.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-muted-foreground">
            Al conectarse con el backend de LangChain, cada discrepancia de
            dirección, propietario, superficie, número oficial o clave predial
            aparecerá aquí con qué documentos la presentan, qué valor encontró
            el sistema en cada uno y la cita exacta de página y fragmento.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-primary" />
                Nivel 3 · Progreso y trazabilidad de los 6 agentes
              </CardTitle>
              <CardDescription>
                Estado individual de cada agente. Si editas campos manualmente,
                solo se re-ejecutan los Agentes 03–06 sin repetir lectura OCR.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border-border text-secondary-foreground"
              >
                <FileSearch className="h-3.5 w-3.5" />
                {completedAgents}/6 completados
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRunningAgents}
                onClick={onRunPipelinePreview}
              >
                <Play className="h-3.5 w-3.5" />
                Probar flujo 01–06
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isRunningAgents}
                onClick={onRevalidateOnly}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Revalidar 03–06
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {AGENT_PIPELINE_STEPS.map((agent, index) => {
              const status = agentStatuses[index] ?? "pending";
              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3"
                >
                  <StatusMark
                    status={status}
                    label={agent.label}
                    color="#E10600"
                    doneColor="#22c55e"
                    errorColor="#E10600"
                    size={20}
                    fontSize={13}
                    strike={false}
                  />
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                    {STATUS_TEXT[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
