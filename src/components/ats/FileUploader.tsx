import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, FileUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type UploadStage = "idle" | "uploading" | "parsing" | "analyzing" | "done" | "error";

const STAGE_COPY: Record<UploadStage, string> = {
  idle: "",
  uploading: "Reading file…",
  parsing: "Extracting resume text…",
  analyzing: "AI is analyzing your resume…",
  done: "Analysis complete",
  error: "Something went wrong",
};

const STAGE_PROGRESS: Record<UploadStage, number> = {
  idle: 0,
  uploading: 25,
  parsing: 55,
  analyzing: 85,
  done: 100,
  error: 100,
};

export function FileUploader({
  stage,
  error,
  fileName,
  fileSize,
  onFile,
}: {
  stage: UploadStage;
  error: string | null;
  fileName: string | null;
  fileSize: number | null;
  onFile: (file: File) => void;
}) {
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      setLocalError(null);
      if (rejected.length > 0) {
        setLocalError("Only PDF and DOCX files are supported.");
        return;
      }
      const file = accepted[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const busy = stage === "uploading" || stage === "parsing" || stage === "analyzing";
  const shownError = error ?? localError;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors",
          isDragActive && "border-accent bg-accent/5",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <input {...getInputProps()} aria-label="Upload resume" />
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <FileUp className="size-5" />}
        </span>
        <div>
          <p className="text-sm font-medium">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX · max 1 file</p>
        </div>
      </div>

      {fileName ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          <CheckCircle2 className="size-4 text-success" />
          <span className="min-w-0 flex-1 truncate font-medium">{fileName}</span>
          {fileSize ? (
            <span className="metric text-xs text-muted-foreground">
              {(fileSize / 1024).toFixed(0)} KB
            </span>
          ) : null}
        </div>
      ) : null}

      {busy ? (
        <div className="space-y-2">
          <Progress value={STAGE_PROGRESS[stage]} />
          <p className="text-xs text-muted-foreground">{STAGE_COPY[stage]}</p>
        </div>
      ) : null}

      {shownError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
