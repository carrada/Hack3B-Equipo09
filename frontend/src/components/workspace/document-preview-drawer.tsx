"use client";

import { useEffect, useMemo } from "react";
import { ExternalLink, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIPO_DOCUMENTO_LABELS, type TipoDocumento } from "@/lib/contracts";

export interface PreviewDocumentTarget {
  documentoId: string;
  nombreArchivo: string;
  tipoDocumento: TipoDocumento;
  file?: File;
  url?: string;
}

export function DocumentPreviewDrawer({
  target,
  onClose,
}: {
  target: PreviewDocumentTarget | null;
  onClose: () => void;
}) {
  const objectUrl = useMemo(() => {
    if (!target?.file || typeof URL === "undefined") return null;
    return URL.createObjectURL(target.file);
  }, [target]);

  useEffect(() => {
    if (!objectUrl) return undefined;
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!target) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const previewUrl = objectUrl ?? target.url ?? null;
  const mime = target.file?.type?.toLowerCase() ?? "";
  const lowerName = target.nombreArchivo.toLowerCase();
  const isImage =
    mime.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(lowerName);
  const isPdf = mime === "application/pdf" || lowerName.endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${target.nombreArchivo}`}
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col border-l border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {target.nombreArchivo}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="border-border text-primary"
                >
                  {TIPO_DOCUMENTO_LABELS[target.tipoDocumento]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Vista local directa (sin enviar a terceros)
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir pestaña
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar vista previa"
            >
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-secondary/20 p-4">
          {!previewUrl ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
              No hay archivo disponible para previsualizar en esta sesión.
            </div>
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              title={target.nombreArchivo}
              className="h-full min-h-[70vh] w-full rounded-xl border border-border bg-white"
            />
          ) : isImage ? (
            <div className="flex min-h-full items-center justify-center rounded-xl border border-border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={target.nombreArchivo}
                className="max-h-[78vh] w-auto rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white p-8 text-center">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Vista embebida no disponible para este formato
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Puedes abrir el archivo en una nueva pestaña para revisarlo
                directamente desde tu navegador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
