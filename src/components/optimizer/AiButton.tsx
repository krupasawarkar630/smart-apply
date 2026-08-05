import { Check, Loader2, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "success" | "error";

/** AI action button with idle / loading / success / error states. Never disables the page. */
export function AiButton({
  children,
  loadingLabel = "Rewriting…",
  onRun,
  variant = "outline",
  size = "sm",
  icon,
}: {
  children: ReactNode;
  loadingLabel?: string;
  onRun: () => Promise<void>;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default";
  icon?: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");

  const run = async () => {
    setStatus("loading");
    try {
      await onRun();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <Button
      type="button"
      variant={status === "error" ? "destructive" : variant}
      size={size}
      onClick={run}
      disabled={status === "loading"}
      className={status === "success" ? "border-success text-success" : undefined}
    >
      {status === "loading" ? (
        <>
          <Loader2 className="mr-1 size-3.5 animate-spin" /> {loadingLabel}
        </>
      ) : status === "success" ? (
        <>
          <Check className="mr-1 size-3.5" /> Done
        </>
      ) : status === "error" ? (
        "Try Again"
      ) : (
        <>
          {icon ?? <Sparkles className="mr-1 size-3.5" />}
          {children}
        </>
      )}
    </Button>
  );
}
