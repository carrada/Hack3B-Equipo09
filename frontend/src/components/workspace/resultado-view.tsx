"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  GitCompareArrows,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AGENT_PIPELINE_SLOTS = [
  "01 · Clasificador Documental",
  "02 · Extractor Especializado",
  "03 · Validador de Reglas",
  "04 · Validador Cruzado",
  "05 · Verificador de Evidencia",
  "06 · Dictaminador y Explicador Legal",
] as const;

export function ResultadoView({ filesCount }: { filesCount: number }) {
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
            <Badge variant="outline" className="border-primary/40 bg-white text-primary">
              En espera de análisis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todavía no se ha ejecutado un análisis contra el backend de 6
            agentes. Archivos listos en esta sesión local:{" "}
            <span className="font-semibold text-foreground">{filesCount}</span>.
          </p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Nivel 2 · Reglas y completitud
            </CardTitle>
            <CardDescription>
              Documentos recibidos, faltantes y requisitos cumplidos o
              incumplidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-muted-foreground">
            Aquí se mostrarán el estado de los 4 tipos documentales, los datos
            extraídos por campo y cada criterio validado contra la guía oficial
            del reto.
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
            Cada discrepancia detallará qué documentos la presentan, qué valor
            encontró el sistema en cada uno y la cita exacta de página y
            fragmento que la respalda.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-primary" />
              Nivel 3 · Transparencia de los 6 agentes y evidencia
            </CardTitle>
            <Badge variant="secondary" className="border-border text-secondary-foreground">
              <FileSearch className="h-3.5 w-3.5" />
              Auditoría abierta
            </Badge>
          </div>
          <CardDescription>
            Nada queda oculto: el equipo legal podrá inspeccionar el resultado
            individual de cada agente y las citas textuales extraídas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {AGENT_PIPELINE_SLOTS.map((agentLabel) => (
              <div
                key={agentLabel}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3.5 py-2.5 text-xs"
              >
                <span className="font-medium text-foreground">
                  {agentLabel}
                </span>
                <span className="text-muted-foreground">Listo</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
