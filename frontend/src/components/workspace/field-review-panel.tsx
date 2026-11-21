"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  FileText,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
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
  CAMPOS_POR_TIPO_DOCUMENTO,
  TIPO_DOCUMENTO_LABELS,
  type CampoExtraido,
  type DocumentoRevision,
  type EstadoCampoExtraido,
  type TipoDocumento,
} from "@/lib/contracts";
import {
  construirPayloadRevalidacion,
  contarResumenRevision,
} from "@/lib/workspace/review-helpers";
import { cn } from "@/lib/utils";

type FieldFilter = "todos" | "por_revisar" | "editados";

const TIPO_OPTIONS: readonly TipoDocumento[] = [
  "escritura",
  "predial",
  "alineamiento_numero_oficial",
  "uso_de_suelo",
  "otro",
] as const;

function getFieldStatusMeta(estado: EstadoCampoExtraido): {
  label: string;
  variant: BadgeProps["variant"];
} {
  switch (estado) {
    case "detectado":
      return { label: "Detectado IA", variant: "success" };
    case "dudoso":
      return { label: "Confianza baja", variant: "warning" };
    case "no_detectado":
      return { label: "No detectado", variant: "destructive" };
    case "editado_manual":
      return { label: "Corregido manualmente", variant: "secondary" };
  }
}

function getPlaceholder(tipo: TipoDocumento, clave: string): string {
  const def = CAMPOS_POR_TIPO_DOCUMENTO[tipo].find((c) => c.clave === clave);
  return def?.placeholder ?? "Escribe el valor verificado en el documento";
}

export function FieldReviewPanel({
  documentos,
  confirmedAt,
  onChangeDocType,
  onSaveField,
  onRestoreField,
  onRemoveDoc,
  onConfirmForValidation,
}: {
  documentos: DocumentoRevision[];
  confirmedAt: string | null;
  onChangeDocType: (documentoId: string, tipo: TipoDocumento) => void;
  onSaveField: (documentoId: string, clave: string, valor: string) => void;
  onRestoreField: (documentoId: string, clave: string) => void;
  onRemoveDoc: (documentoId: string) => void;
  onConfirmForValidation: () => void;
}) {
  const [filter, setFilter] = useState<FieldFilter>("todos");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const summary = contarResumenRevision(documentos);
  const payloadPreview = construirPayloadRevalidacion(documentos);

  const startEditing = (documentoId: string, campo: CampoExtraido) => {
    setEditingKey(`${documentoId}::${campo.clave}`);
    setDraftValue(campo.valorActual ?? "");
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setDraftValue("");
  };

  const commitEditing = (documentoId: string, clave: string) => {
    onSaveField(documentoId, clave, draftValue);
    setEditingKey(null);
    setDraftValue("");
  };

  const matchesFilter = (campo: CampoExtraido): boolean => {
    if (filter === "por_revisar") {
      return campo.estado === "no_detectado" || campo.estado === "dudoso";
    }
    if (filter === "editados") {
      return campo.editadoManualmente;
    }
    return true;
  };

  return (
    <Card className="border-border bg-white">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Revisión y edición opcional de campos
            </CardTitle>
            <CardDescription>
              Si la IA no detecta un campo o lo lee con baja confianza, puedes
              corregirlo aquí antes o después de validar. Cada edición conserva
              el valor original para auditoría legal.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border">
              {summary.camposCompletos}/{summary.totalCampos} con dato
            </Badge>
            {summary.camposEditados > 0 && (
              <Badge variant="secondary" className="border-border text-primary">
                {summary.camposEditados} corrección(es)
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: "todos",
                  label: `Todos (${summary.totalCampos})`,
                },
                {
                  id: "por_revisar",
                  label: `Por revisar (${summary.camposPorRevisar})`,
                },
                {
                  id: "editados",
                  label: `Corregidos (${summary.camposEditados})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowJsonPreview((prev) => !prev)}
            className="text-xs text-muted-foreground"
          >
            <Code2 className="h-3.5 w-3.5" />
            {showJsonPreview
              ? "Ocultar payload backend"
              : "Ver payload JSON para backend"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {documentos.map((doc) => {
          const visibleFields = doc.campos.filter(matchesFilter);
          const typeChanged = doc.tipoSeleccionado !== doc.tipoDetectado;

          return (
            <div
              key={doc.documentoId}
              className="overflow-hidden rounded-xl border border-border bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {doc.nombreArchivo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.tamanoBytes !== undefined
                        ? `${(doc.tamanoBytes / (1024 * 1024)).toFixed(2)} MB · `
                        : ""}
                      {doc.confianzaClasificacion !== null
                        ? `Clasificación IA ${Math.round(doc.confianzaClasificacion * 100)}%`
                        : "Listo para extracción del Agente 02"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Tipo:</span>
                    <select
                      value={doc.tipoSeleccionado}
                      onChange={(e) =>
                        onChangeDocType(
                          doc.documentoId,
                          e.target.value as TipoDocumento,
                        )
                      }
                      className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                      {TIPO_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {TIPO_DOCUMENTO_LABELS[opt]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {typeChanged && (
                    <Badge
                      variant="secondary"
                      className="border-border text-primary"
                    >
                      Tipo corregido
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDoc(doc.documentoId)}
                    aria-label={`Quitar ${doc.nombreArchivo}`}
                    className="h-7 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {visibleFields.length === 0 ? (
                <p className="px-4 py-4 text-xs text-muted-foreground">
                  No hay campos en este documento para el filtro seleccionado.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {visibleFields.map((campo) => {
                    const rowKey = `${doc.documentoId}::${campo.clave}`;
                    const isEditing = editingKey === rowKey;
                    const statusMeta = getFieldStatusMeta(campo.estado);

                    return (
                      <li
                        key={campo.clave}
                        className={cn(
                          "flex flex-col gap-3 px-4 py-3.5 transition-colors sm:flex-row sm:items-start sm:justify-between",
                          campo.estado === "no_detectado" && "bg-red-50/30",
                          campo.estado === "dudoso" && "bg-amber-50/40",
                        )}
                      >
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {campo.etiqueta}
                            </span>
                            <Badge variant={statusMeta.variant}>
                              {statusMeta.label}
                              {campo.confianza !== null &&
                              !campo.editadoManualmente
                                ? ` · ${Math.round(campo.confianza * 100)}%`
                                : ""}
                            </Badge>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                              <input
                                type="text"
                                value={draftValue}
                                onChange={(e) => setDraftValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    commitEditing(doc.documentoId, campo.clave);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    cancelEditing();
                                  }
                                }}
                                placeholder={getPlaceholder(
                                  doc.tipoSeleccionado,
                                  campo.clave,
                                )}
                                autoFocus
                                className="w-full flex-1 rounded-lg border border-primary/50 bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <div className="flex items-center gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    commitEditing(doc.documentoId, campo.clave)
                                  }
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Guardar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {campo.valorActual ? (
                                <p className="text-sm font-medium text-foreground">
                                  {campo.valorActual}
                                </p>
                              ) : (
                                <p className="flex items-center gap-1.5 text-xs italic text-muted-foreground">
                                  <AlertCircle className="h-3.5 w-3.5 text-primary/70" />
                                  Sin dato detectado. Puedes completarlo
                                  opcionalmente con el botón Editar.
                                </p>
                              )}

                              {campo.editadoManualmente && (
                                <p className="text-[11px] text-muted-foreground">
                                  Valor original IA:{" "}
                                  <span className="font-medium text-foreground">
                                    {campo.valorDetectado ?? "Sin detectar"}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                startEditing(doc.documentoId, campo)
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {campo.valorActual ? "Editar" : "Completar"}
                            </Button>
                            {campo.editadoManualmente && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onRestoreField(doc.documentoId, campo.clave)
                                }
                                title="Restaurar valor original de la IA"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Restaurar
                              </Button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {showJsonPreview && (
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-secondary-foreground">
                Payload JSON listo para PATCH /api/v1/expedientes/{"{id}"}
                /revalidar
              </p>
              <Badge variant="outline" className="border-border bg-white">
                Contrato Zod
              </Badge>
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-white p-3 font-mono text-xs text-foreground">
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
          <div className="space-y-0.5 text-xs">
            <p className="font-semibold text-foreground">
              {confirmedAt
                ? "Campos confirmados para validación (Agentes 03–06)"
                : "Edición opcional: puedes validar tal cual o confirmar tus ajustes"}
            </p>
            <p className="text-muted-foreground">
              {confirmedAt
                ? `Última confirmación local: ${confirmedAt}. Listo para enviar al backend.`
                : "Al conectar tu backend, este botón re-ejecutará reglas, cruces y dictamen sin repetir el OCR."}
            </p>
          </div>

          <Button type="button" onClick={onConfirmForValidation}>
            <CheckCircle2 className="h-4 w-4" />
            {confirmedAt
              ? "Actualizar confirmación"
              : "Confirmar campos y continuar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
