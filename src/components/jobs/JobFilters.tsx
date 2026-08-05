import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type JobFilterState = {
  remoteOnly: boolean;
  jobTypes: string[];
  location: string;
  skills: string[];
};

const JOB_TYPES = ["Full-time", "Part-time", "Contract"];

export function JobFilters({
  filters,
  onChange,
}: {
  filters: JobFilterState;
  onChange: (next: JobFilterState) => void;
}) {
  const toggleType = (type: string) =>
    onChange({
      ...filters,
      jobTypes: filters.jobTypes.includes(type)
        ? filters.jobTypes.filter((t) => t !== type)
        : [...filters.jobTypes, type],
    });

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="remote-only" className="text-sm font-normal">
            Remote only
          </Label>
          <Switch
            id="remote-only"
            checked={filters.remoteOnly}
            onCheckedChange={(remoteOnly) => onChange({ ...filters, remoteOnly })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Job type</Label>
          <div className="flex flex-wrap gap-1.5">
            {JOB_TYPES.map((type) => {
              const active = filters.jobTypes.includes(type);
              return (
                <button key={type} type="button" onClick={() => toggleType(type)}>
                  <Badge variant={active ? "default" : "outline"} className="cursor-pointer font-normal">
                    {type}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs uppercase tracking-wide text-muted-foreground">
            Location
          </Label>
          <Input
            id="location"
            placeholder="e.g. Berlin, India, Anywhere"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Skills</Label>
          {filters.skills.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Upload a resume to auto-populate your skill filters.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 font-normal">
                  {skill}
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    onClick={() =>
                      onChange({ ...filters, skills: filters.skills.filter((s) => s !== skill) })
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
