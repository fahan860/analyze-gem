interface HealthScoreGaugeProps {
  score: number;
  size?: number;
}

export default function HealthScoreGauge({ score, size = 160 }: HealthScoreGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return "hsl(var(--success))";
    if (s >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 70) return "Good";
    if (s >= 50) return "Fair";
    if (s >= 40) return "Caution";
    return "Poor";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: size * 0.25 }}>
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">{getLabel(score)}</span>
      </div>
    </div>
  );
}
