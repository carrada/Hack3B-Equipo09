"use client";

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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

type ViewId = "inicio" | "expediente" | "carga" | "resultado";

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
    badge: "Paso 01",
    title: "Inicio",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  expediente: {
    badge: "Paso 02",
    title: "Expediente",
    subtitle:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  carga: {
    badge: "Paso 03",
    title: "Carga",
    subtitle:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  resultado: {
    badge: "Paso 04",
    title: "Resultado",
    subtitle:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadResetKey, setUploadResetKey] = useState(0);

  const meta = VIEW_META[activeView];

  const handleSelect = (value: string) => {
    if (isViewId(value)) {
      setActiveView(value);
    }
  };

  const handleFilesAdded = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
    setUploadResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-border bg-white md:w-72 md:border-r md:border-b-0">
        <div className="flex h-full flex-col px-6 py-7">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold tracking-tight text-primary-foreground shadow-xs">
              3B
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-foreground">
                Expedientes
              </p>
              <p className="text-xs text-muted-foreground">
                Lorem ipsum workspace
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
              Estado local
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-secondary-foreground">
              <span>Archivos en sesión</span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-primary border border-border">
                {uploadedFiles.length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white">
        <header className="border-b border-border bg-white px-6 py-6 md:px-10">
          <div className="mx-auto flex max-w-4xl flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <Badge variant="secondary" className="border-border text-primary">
                {meta.badge}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {meta.title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {meta.subtitle}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
          {activeView === "inicio" && <InicioView />}
          {activeView === "expediente" && <ExpedienteView />}
          {activeView === "carga" && (
            <CargaView
              files={uploadedFiles}
              resetKey={uploadResetKey}
              onFilesAdded={handleFilesAdded}
              onClear={handleClearFiles}
            />
          )}
          {activeView === "resultado" && (
            <ResultadoView filesCount={uploadedFiles.length} />
          )}
        </div>
      </main>
    </div>
  );
}

function InicioView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Lorem ipsum",
            value: "01",
            text: "Consectetur adipiscing elit, sed do eiusmod tempor.",
          },
          {
            label: "Dolor sit amet",
            value: "02",
            text: "Incididunt ut labore et dolore magna aliqua.",
          },
          {
            label: "Tempor elit",
            value: "03",
            text: "Ut enim ad minim veniam, quis nostrud exercitation.",
          },
        ].map((item) => (
          <Card key={item.value} className="border-border bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                  {item.label}
                </CardDescription>
                <span className="text-sm font-semibold text-primary">
                  {item.value}
                </span>
              </div>
              <CardTitle className="text-lg">Maecenas tempus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-white">
        <CardHeader>
          <CardTitle>Quisque rutrum aenean imperdiet</CardTitle>
          <CardDescription>
            Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
            quis sem at nibh elementum imperdiet. Duis sagittis ipsum.
          </p>
          <p>
            Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris
            massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti
            sociosqu ad litora torquent per conubia nostra.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpedienteView() {
  const sections = [
    {
      title: "Pellentesque habitant morbi",
      status: "Lorem",
      body: "Tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.",
    },
    {
      title: "Donec eu libero sit amet",
      status: "Ipsum",
      body: "Quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.",
    },
    {
      title: "Vestibulum erat wisi",
      status: "Dolor",
      body: "Condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci.",
    },
    {
      title: "Sagittis tempus lacus enim",
      status: "Amet",
      body: "Ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-secondary/40">
        <CardHeader>
          <CardTitle className="text-secondary-foreground">
            Resumen general
          </CardTitle>
          <CardDescription>
            Curabitur blandit tempus porttitor. Cras mattis consectetur purus
            sit amet fermentum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
            malesuada. Nullam ac erat ante.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="border-border bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <Badge
                  variant="secondary"
                  className="border-border text-primary"
                >
                  {section.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CargaView({
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
          <CardTitle>Carga de archivos</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Los
            archivos seleccionados se conservan únicamente en estado local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full rounded-xl border border-dashed border-border bg-white">
            <FileUpload key={resetKey} onChange={onFilesAdded} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-white">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Archivos en estado local ({files.length})
            </CardTitle>
            <CardDescription>
              Suspendisse potenti. Sed dignissim lacinia nunc.
            </CardDescription>
          </div>
          {files.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              Limpiar lista
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nulla facilisi. Arrastra o selecciona un archivo arriba para
              guardarlo en el estado local de esta vista.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-foreground truncate max-w-md">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultadoView({ filesCount }: { filesCount: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-secondary/50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg text-secondary-foreground">
                Dictamen de muestra
              </CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </CardDescription>
            </div>
            <Badge variant="default">Lorem ipsum</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
          <p className="text-xs font-medium text-secondary-foreground">
            Archivos cargados en esta sesión local: {filesCount}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="text-base">Nemo enim ipsam</CardTitle>
            <CardDescription>Voluptatem quia voluptas sit</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ut enim ad minima veniam, quis nostrum exercitationem.</li>
              <li>• Quis autem vel eum iure reprehenderit qui in ea.</li>
              <li>• Neque porro quisquam est, qui dolorem ipsum quia.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="text-base">At vero eos et accusamus</CardTitle>
            <CardDescription>Et iusto odio dignissimos ducimus</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Nam libero tempore, cum soluta nobis est eligendi.</li>
              <li>• Temporibus autem quibusdam et aut officiis debitis.</li>
              <li>• Itaque earum rerum hic tenetur a sapiente delectus.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
