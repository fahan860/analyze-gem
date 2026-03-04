import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Upload, FileText, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";

const recentAnalyses = [
  { id: "demo", name: "Apple_10K_2025.pdf", date: "Mar 2, 2026", score: 82 },
  { id: "demo2", name: "Tesla_Annual_2025.pdf", date: "Feb 28, 2026", score: 65 },
  { id: "demo3", name: "Microsoft_10Q_Q3.pdf", date: "Feb 20, 2026", score: 91 },
];

const quickKPIs = [
  { label: "Analyses This Month", value: "3", change: "2 remaining (Free)", positive: true },
  { label: "Avg Health Score", value: "79.3", change: "+4.2 vs last month", positive: true },
  { label: "Reports Uploaded", value: "12" },
  { label: "Total KPIs Tracked", value: "72" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Your financial analysis overview</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/dashboard/upload">
              <Upload className="h-4 w-4 mr-2" /> Upload Report
            </Link>
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickKPIs.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Recent Analyses */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recent Analyses
          </h2>
          <Link to="/dashboard/history" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentAnalyses.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/dashboard/analysis/${a.id}`}
                className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-mono font-bold ${
                    a.score >= 70 ? "text-success" : a.score >= 40 ? "text-warning" : "text-destructive"
                  }`}>
                    {a.score}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
