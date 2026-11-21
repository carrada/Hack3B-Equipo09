"use client";

import { FileText, Info, Trash2 } from "lucide-react";
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

export function CargaView({
  files,
  resetKey,
  onFilesAdded,
  onClear,
}: {
  files: File[];
  resetKey: number;
  onFilesAdded: (newFiles: File[]) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              Subir documentos del expediente
            </CardTitle>
            <Badge variant="secondary" className="border-border text-primary">
              Clasificación automática al analizar
            </Badge>
          </div>
          <CardDescription>
            Agrega los documentos disponibles del inmueble (Escrituras, Predial,
            Alineamiento y Número Oficial y Uso de Suelo). No necesitas
            etiquetarlos manualmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-xl border border-dashed border-border bg-white">
            <FileUpload key={resetKey} onChange={onFilesAdded} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-white">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Archivos preparados en sesión ({files.length})
            </CardTitle>
            <CardDescription>
              Guardados únicamente en estado local mientras conectamos el
              backend de 6 agentes.
            </CardDescription>
          </div>
          {files.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar selección
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has agregado archivos. Arrastra o selecciona documentos
              arriba para armar el paquete del expediente en esta sesión.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate font-medium text-foreground max-w-md">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="border-border">
                      {file.type || "documento"}
                    </Badge>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Al conectar los endpoints del backend, esta vista enviará el
              paquete de documentos al orquestador de 6 agentes en LangChain y
              habilitará el seguimiento paso a paso en la pestaña{" "}
              <span className="font-semibold text-foreground">Resultado</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
