"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  Folder01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import BranchedMenu, {
  type BranchedMenuSectionItem,
} from "@/components/menu/BranchedMenu";
import { Badge } from "@/components/ui/badge";
import { CargaView } from "@/components/workspace/carga-view";
import { EntryLoader } from "@/components/workspace/entry-loader";
import { ExpedienteGuideView } from "@/components/workspace/expediente-guide-view";
import { InicioPitchView } from "@/components/workspace/inicio-pitch-view";
import { ResultadoView } from "@/components/workspace/resultado-view";
import type { DocumentoRevision, TipoDocumento } from "@/lib/contracts";
import {
  actualizarCampoDocumento,
  cambiarTipoDocumentoRevision,
  contarResumenRevision,
  crearDocumentoRevisionDesdeArchivo,
  restaurarCampoDocumento,
} from "@/lib/workspace/review-helpers";

type ViewId = "inicio" | "expediente" | "carga" | "resultado";

interface UploadedEntry {
  file: File;
  revision: DocumentoRevision;
}

const MENU_ITEMS: BranchedMenuSectionItem[] = [
  {
    label: "General",
    children: [{ value: "inicio", label: "Inicio", icon: Home01Icon }],
  },
  {
    label: "Flujo",
    children: [
      { value: "expediente", label: "Expediente", icon: Folder01Icon },
      { value: "carga", label: "Carga", icon: CloudUploadIcon },
      { value: "resultado", label: "Resultado", icon: CheckmarkCircle02Icon },
    ],
  },
];

const VIEW_META: Record<
  ViewId,
  { badge: string; title: string; subtitle: string }
> = {
  inicio: {
    badge: "Reto 1 · Arquitectura de 6 Agentes",
    title: "Revisión inteligente de expedientes inmobiliarios",
    subtitle:
      "Sistema multiagente sobre LangChain diseñado para dar velocidad operativa al gestor y trazabilidad jurídica completa al equipo legal, sin ocultar cómo razona la IA.",
  },
  expediente: {
    badge: "Paso 02 · Qué se evalúa",
    title: "Estructura del expediente y reglas cruzadas",
    subtitle:
      "Guía clara de los 4 tipos documentales mínimos, los campos que se extraen de cada uno y las validaciones cruzadas que contrastan coherencia entre documentos.",
  },
  carga: {
    badge: "Paso 03 · Ingesta y revisión asistida",
    title: "Carga y ajuste opcional de campos",
    subtitle:
      "Sube uno o varios PDFs del inmueble y, si algún campo no se detecta bien, corrígelo opcionalmente conservando el rastro original de la IA.",
  },
  resultado: {
    badge: "Paso 04 · Dictamen y evidencia",
    title: "Resultado auditable del análisis",
    subtitle:
      "Lectura en 3 niveles: recomendación inicial con confianza, hallazgos y discrepancias cruzadas, y traza abierta de los 6 agentes con cita al documento original.",
  },
};

function isViewId(value: string): value is ViewId {
  return (
    value === "inicio" ||
    value === "expediente" ||
    value === "carga" ||
    value === "resultado"
  );
}

export function AppShell() {
  const [activeView, setActiveView] = useState<ViewId>("inicio");
  const [entries, setEntries] = useState<UploadedEntry[]>([]);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const meta = VIEW_META[activeView];
  const uploadedFiles = entries.map((entry) => entry.file);
  const reviewDocs = entries.map((entry) => entry.revision);
  const reviewSummary = contarResumenRevision(reviewDocs);

  const handleSelect = (value: string) => {
    if (isViewId(value)) {
      setActiveView(value);
    }
  };

  const handleFilesAdded = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setEntries((prev) => [
      ...prev,
      ...newFiles.map((file, idx) => ({
        file,
        revision: crearDocumentoRevisionDesdeArchivo(file, prev.length + idx),
      })),
    ]);
    setConfirmedAt(null);
  };

  const handleRemoveByIndex = (index: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
    setConfirmedAt(null);
  };

  const handleClearFiles = () => {
    setEntries([]);
    setConfirmedAt(null);
  };

  const handleChangeDocType = (documentoId: string, tipo: TipoDocumento) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.revision.documentoId === documentoId
          ? {
              ...entry,
              revision: cambiarTipoDocumentoRevision(entry.revision, tipo),
            }
          : entry,
      ),
    );
    setConfirmedAt(null);
  };

  const handleSaveField = (
    documentoId: string,
    clave: string,
    valor: string,
  ) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.revision.documentoId === documentoId
          ? {
              ...entry,
              revision: actualizarCampoDocumento(entry.revision, clave, valor),
            }
          : entry,
      ),
    );
    setConfirmedAt(null);
  };

  const handleRestoreField = (documentoId: string, clave: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.revision.documentoId === documentoId
          ? {
              ...entry,
              revision: restaurarCampoDocumento(entry.revision, clave),
            }
          : entry,
      ),
    );
    setConfirmedAt(null);
  };

  const handleRemoveDoc = (documentoId: string) => {
    setEntries((prev) =>
      prev.filter((entry) => entry.revision.documentoId !== documentoId),
    );
    setConfirmedAt(null);
  };

  const handleConfirmForValidation = () => {
    const timestamp = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setConfirmedAt(timestamp);
  };

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col md:flex-row">
      <EntryLoader />
      <aside className="w-full shrink-0 border-b border-border bg-white md:w-72 md:border-r md:border-b-0">
        <div className="flex h-full flex-col px-6 py-7">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo-3b.png"
              alt="Tiendas 3B"
              width={42}
              height={42}
              priority
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
              <p className="text-base font-semibold leading-tight text-foreground">
                Expedientes 3B
              </p>
              <p className="text-xs text-muted-foreground">
                Revisión legal multiagente
              </p>
            </div>
          </div>

          <div className="flex-1">
            <BranchedMenu
              items={MENU_ITEMS}
              defaultOpen={[0, 1]}
              defaultActive="inicio"
              onSelect={handleSelect}
              color="#7A0704"
              accentColor="#E10600"
              lineColor="#E8C6C5"
              width={232}
              rowHeight={38}
              fontSize={14}
            />
          </div>

          <div className="mt-8 rounded-xl border border-border bg-secondary/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              Pipeline listo
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              6 agentes especializados · modo local listo para conectar al
              backend.
            </p>
            <div className="mt-3 flex flex-col gap-1.5 text-xs font-medium text-secondary-foreground">
              <div className="flex items-center justify-between">
                <span>Archivos en sesión</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-primary border border-border">
                  {reviewDocs.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Correcciones manuales</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-primary border border-border">
                  {reviewSummary.camposEditados}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white">
        <header className="border-b border-border bg-white px-6 py-6 md:px-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <Badge variant="secondary" className="border-border text-primary">
                {meta.badge}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {meta.title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {meta.subtitle}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
          {activeView === "inicio" && <InicioPitchView />}
          {activeView === "expediente" && <ExpedienteGuideView />}
          {activeView === "carga" && (
            <CargaView
              files={uploadedFiles}
              documentos={reviewDocs}
              confirmedAt={confirmedAt}
              onFilesAdded={handleFilesAdded}
              onRemoveByIndex={handleRemoveByIndex}
              onClear={handleClearFiles}
              onChangeDocType={handleChangeDocType}
              onSaveField={handleSaveField}
              onRestoreField={handleRestoreField}
              onRemoveDoc={handleRemoveDoc}
              onConfirmForValidation={handleConfirmForValidation}
            />
          )}
          {activeView === "resultado" && (
            <ResultadoView
              documentos={reviewDocs}
              confirmedAt={confirmedAt}
            />
          )}
        </div>
      </main>
    </div>
  );
}
