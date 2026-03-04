import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisData {
  id: string;
  summary: string | null;
  kpis_json: any;
  risk_factors: any;
  health_score: number | null;
  created_at: string;
  uploads: { file_name: string } | null;
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("analysis_results")
      .select("*, uploads(file_name)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setData(data as any);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Analysis not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const kpis = Array.isArray(data.kpis_json) ? data.kpis_json : [];
  const risks = Array.isArray(data.risk_factors) ? data.risk_factors : [];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{(data.uploads as any)?.file_name || "Analysis"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Analyzed on {new Date(data.created_at).toLocaleDateString()}</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 flex flex-col items-center justify-center relative">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Financial Health</h3>
            <HealthScoreGauge score={data.health_score || 0} />
          </div>
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Executive Summary</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{data.summary || "No summary available."}</p>
          </div>
        </div>

        {kpis.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {kpis.map((kpi: any, i: number) => (
                <KPICard key={kpi.label || i} kpi={kpi} index={i} />
              ))}
            </div>
          </>
        )}

        {risks.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Risk Factors
            </h3>
            <ul className="space-y-3">
              {risks.map((risk: string, i: number) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                  <span className="text-foreground/80 leading-relaxed">{risk}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
