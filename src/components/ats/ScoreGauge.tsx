import { useEffect, useState } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

function colorForScore(score: number) {
  if (score < 50) return "var(--destructive)";
  if (score <= 75) return "var(--warning)";
  return "var(--success)";
}

export function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const color = colorForScore(animated);

  return (
    <div className="relative size-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={[{ name: "score", value: animated }]}
          innerRadius="78%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={12} fill={color} background isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="metric text-4xl font-bold" style={{ color }}>
          {animated}
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
}
