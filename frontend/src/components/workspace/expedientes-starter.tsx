"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Layers,
  RefreshCw,
  Server,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useBackendHealth,
  useExpediente,
  useExpedientes,
} from "@/hooks/use-expedientes";
import { env } from "@/lib/config/env";
import {
  DOCUMENTOS_MINIMOS_RETO_1,
  RECOMENDACION_LABELS,
  TIPO_DOCUMENTO_LABELS,
  type Recomendacion,
} from "@/lib/contracts";
import { cn } from "@/lib/utils";

function getRecomendacionVariant(
  recomendacion: Recomendacion | null,
): BadgeProps["variant"] {
  if (recomendacion === "cumple") return "success";
  if (recomendacion === "requiere_revision") return "warning";
  if (recomendacion === "no_cumple") return "destructive";
  return "secondary";
}

function formatConfidence(value: number | null): string {
  if (value === null) return "Sin calcular";
  return `${Math.round(value * 100)}%`;
}

export function ExpedientesStarter() {
  const healthQuery = useBackendHealth();
  const listQuery = useExpedientes();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = selectedId ?? listQuery.data?.[0]?.expedienteId ?? null;
  const detailQuery = useExpediente(activeId);

  const detail = detailQuery.data;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              3B
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {env.appName}
              </p>
              <p className="text-xs text-muted-foreground">
                Reto 1 · Base frontend desacoplada para análisis multiagente
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={env.useMocks ? "warning" : "success"}>
              <Server className="h-3.5 w-3.5" />
              {env.useMocks
                ? "Modo Mock Local"
                : `API: ${env.apiBaseUrl}`}
            </Badge>
            <Badge variant="outline">
              Estado:{" "}
              {healthQuery.isPending
                ? "verificando..."
                : healthQuery.isError
                  ? "sin conexión"
                  : healthQuery.data.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void healthQuery.refetch();
                void listQuery.refetch();
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOCUMENTOS_MINIMOS_RETO_1.map((tipo) => (
            <Card key={tipo} className="bg-background">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">
                    {TIPO_DOCUMENTO_LABELS[tipo]}
                  </CardTitle>
                  <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription className="text-xs">
                  Tipo documental mínimo requerido en el expediente
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Expedientes
              </CardTitle>
              <CardDescription>
                Consumidos vía contrato Zod ({env.useMocks ? "fixtures mock" : "API REST"}).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {listQuery.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Cargando expedientes...
                </p>
              ) : listQuery.isError ? (
                <p className="text-sm text-destructive">
                  No se pudieron obtener expedientes: {listQuery.error.message}
                </p>
              ) : listQuery.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay expedientes registrados.
                </p>
              ) : (
                listQuery.data.map((item) => {
                  const isActive = item.expedienteId === activeId;
                  return (
                    <button
                      key={item.expedienteId}
                      type="button"
                      onClick={() => setSelectedId(item.expedienteId)}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
                        isActive
                          ? "border-primary bg-muted/60"
                          : "border-border hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-tight">
                          {item.nombreExpediente}
                        </span>
                        <Badge
                          variant={getRecomendacionVariant(item.recomendacion)}
                        >
                          {item.recomendacion
                            ? RECOMENDACION_LABELS[item.recomendacion]
                            : item.estado}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{item.documentosRecibidosCount} docs</span>
                        <span>{item.inconsistenciasCount} discrepancias</span>
                        <span>Confianza {formatConfidence(item.nivelConfianza)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {detail?.nombreExpediente ?? "Detalle del análisis"}
                  </CardTitle>
                  <CardDescription>
                    Vista de referencia del contrato JSON entre frontend y backend LangChain.
                  </CardDescription>
                </div>
                {detail && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getRecomendacionVariant(detail.recomendacion)}
                    >
                      {detail.recomendacion
                        ? RECOMENDACION_LABELS[detail.recomendacion]
                        : detail.estado}
                    </Badge>
                    <Badge variant="outline">
                      Confianza {formatConfidence(detail.nivelConfianza)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              {detailQuery.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Cargando detalle del expediente...
                </p>
              ) : detailQuery.isError ? (
                <p className="text-sm text-destructive">
                  Error al consultar detalle: {detailQuery.error.message}
                </p>
              ) : !detail ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona un expediente para inspeccionar su contrato de salida.
                </p>
              ) : (
                <>
                  {detail.resumenEjecutivo && (
                    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                      {detail.resumenEjecutivo}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Documentos recibidos ({detail.documentosRecibidos.length})
                      </p>
                      <ul className="flex flex-col gap-1.5 text-sm">
                        {detail.documentosRecibidos.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="truncate font-mono text-xs">
                              {doc.nombreArchivo}
                            </span>
                            <Badge variant="secondary">
                              {TIPO_DOCUMENTO_LABELS[doc.tipoDetectado]}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <FileWarning className="h-3.5 w-3.5 text-amber-600" />
                        Documentos faltantes ({detail.documentosFaltantes.length})
                      </p>
                      {detail.documentosFaltantes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Expediente completo con los 4 tipos documentales mínimos.
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {detail.documentosFaltantes.map((tipo) => (
                            <Badge key={tipo} variant="destructive">
                              {TIPO_DOCUMENTO_LABELS[tipo]}
                            </Badge>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {detail.inconsistencias.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        Validaciones cruzadas e inconsistencias ({detail.inconsistencias.length})
                      </p>
                      {detail.inconsistencias.map((inc) => (
                        <div
                          key={inc.id}
                          className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {inc.campo}
                            </span>
                            <Badge variant="warning">
                              Severidad {inc.severidad}
                            </Badge>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {inc.descripcion}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {inc.hallazgos.map((h) => (
                              <div
                                key={`${inc.id}-${h.documentoId}`}
                                className="rounded-md border border-border bg-background p-3 text-xs"
                              >
                                <p className="font-semibold">
                                  {TIPO_DOCUMENTO_LABELS[h.tipoDocumento]} ·{" "}
                                  <span className="text-foreground">
                                    {h.valorEncontrado}
                                  </span>
                                </p>
                                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                  {h.nombreArchivo}
                                  {h.evidencia.pagina
                                    ? ` · pág. ${h.evidencia.pagina}`
                                    : ""}
                                </p>
                                <p className="mt-1.5 italic text-muted-foreground">
                                  &ldquo;{h.evidencia.fragmento}&rdquo;
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                        Requisitos y hallazgos
                      </p>
                      <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        {detail.requisitosCumplidos.map((req) => (
                          <li key={req} className="text-emerald-700 dark:text-emerald-400">
                            • {req}
                          </li>
                        ))}
                        {detail.requisitosNoCumplidos.map((req) => (
                          <li key={req} className="text-red-700 dark:text-red-400">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        Traza resumida de agentes
                      </p>
                      <ul className="flex flex-col gap-2 text-xs">
                        {detail.trazaAgentes.map((step) => (
                          <li
                            key={step.agente}
                            className="flex flex-col gap-0.5"
                          >
                            <span className="font-medium">{step.agente}</span>
                            <span className="text-muted-foreground">
                              {step.resumen}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
