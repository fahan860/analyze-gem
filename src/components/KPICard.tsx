import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Banknote } from "lucide-react";

interface KPIData {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

const iconMap: Record<string, typeof DollarSign> = {
  Revenue: DollarSign,
  "Net Income": TrendingUp,
  EBITDA: BarChart3,
  EPS: PieChart,
  "Total Debt": TrendingDown,
  "Cash Flow": Banknote,
};

export default function KPICard({ kpi, index }: { kpi: KPIData; index: number }) {
  const Icon = iconMap[kpi.label] || DollarSign;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground font-mono">{kpi.value}</p>
      {kpi.change && (
        <p className={`text-xs mt-1 ${kpi.positive ? "text-success" : "text-destructive"}`}>
          {kpi.positive ? "↑" : "↓"} {kpi.change}
        </p>
      )}
    </motion.div>
  );
}
