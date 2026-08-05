import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { AtsIssue } from "@/context/ResumeContext";
import { Badge } from "@/components/ui/badge";

const STYLE = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive", Icon: XCircle },
  warning: { label: "Warning", className: "bg-warning/15 text-warning-foreground", Icon: AlertTriangle },
  suggestion: { label: "Suggestion", className: "bg-info/10 text-info", Icon: Info },
} as const;

export function IssuesList({ issues }: { issues: AtsIssue[] }) {
  if (issues.length === 0) {
    return <p className="text-sm text-muted-foreground">No blocking issues detected. Nice work.</p>;
  }

  return (
    <ul className="space-y-3">
      {issues.map((issue, index) => {
        const style = STYLE[issue.type] ?? STYLE.suggestion;
        return (
          <li key={`${issue.message}-${index}`} className="flex gap-3 rounded-md border border-border p-3">
            <style.Icon className="mt-0.5 size-4 shrink-0 opacity-80" />
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={style.className} variant="secondary">
                  {style.label}
                </Badge>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {issue.section || "General"}
                </span>
              </div>
              <p className="text-sm">{issue.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function StrengthsList({ strengths }: { strengths: string[] }) {
  if (strengths.length === 0) return <p className="text-sm text-muted-foreground">No strengths detected yet.</p>;
  return (
    <ul className="space-y-2">
      {strengths.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
