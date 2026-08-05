import { Progress } from "@/components/ui/progress";

const LABELS = [
  { key: "keyword_score", label: "Keyword Match" },
  { key: "formatting_score", label: "Formatting" },
  { key: "readability_score", label: "Readability" },
  { key: "section_score", label: "Section Completeness" },
] as const;

export function ScoreBreakdown({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="space-y-4">
      {LABELS.map(({ key, label }) => {
        const value = Math.max(0, Math.min(100, scores[key] ?? 0));
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="metric text-xs text-muted-foreground">{value}/100</span>
            </div>
            <Progress value={value} />
          </div>
        );
      })}
    </div>
  );
}
