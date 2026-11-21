"use client";

import { Info, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { FieldReviewPanel } from "@/components/workspace/field-review-panel";
import type { DocumentoRevision, TipoDocumento } from "@/lib/contracts";

export function CargaView({
  documentos,
  resetKey,
  confirmedAt,
  onFilesAdded,
  onClear,
  onChangeDocType,
  onSaveField,
  onRestoreField,
  onRemoveDoc,
  onConfirmForValidation,
}: {
  documentos: DocumentoRevision[];
  resetKey: number;
  confirmedAt: string | null;
  onFilesAdded: (newFiles: File[]) => void;
  onClear: () => void;
  onChangeDocType: (documentoId: string, tipo: TipoDocumento) => void;
  onSaveField: (documentoId: string, clave: string, valor: string) => void;
  onRestoreField: (documentoId: string, clave: string) => void;
  onRemoveDoc: (documentoId: string) => void;
  onConfirmForValidation: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              Subir documentos del expediente
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="border-border text-primary">
                Clasificación automática al analizar
              </Badge>
              {documentos.length > 0 && (
                <Button variant="outline" size="sm" onClick={onClear}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpiar todo
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Agrega uno o varios PDFs del inmueble (Escrituras, Predial,
            Alineamiento y Número Oficial y Uso de Suelo). Al cargarlos, podrás
            revisar y ajustar cualquier campo si la detección necesita ayuda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-xl border border-dashed border-border bg-white">
            <FileUpload key={resetKey} onChange={onFilesAdded} />
          </div>
        </CardContent>
      </Card>

      {documentos.length === 0 ? (
        <Card className="border-border bg-white">
          <CardContent className="pt-5">
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                En cuanto subas uno o más documentos arriba, se desplegará aquí
                el{" "}
                <span className="font-semibold text-foreground">
                  panel interactivo de revisión y edición de campos
                </span>{" "}
                para verificar el tipo documental y modificar opcionalmente
                cualquier dato que falte o salga dudoso antes de dictaminar.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <FieldReviewPanel
          documentos={documentos}
          confirmedAt={confirmedAt}
          onChangeDocType={onChangeDocType}
          onSaveField={onSaveField}
          onRestoreField={onRestoreField}
          onRemoveDoc={onRemoveDoc}
          onConfirmForValidation={onConfirmForValidation}
        />
      )}
    </div>
  );
}
