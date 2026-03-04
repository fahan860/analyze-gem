import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Upload, FileText, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalysisRow {
  id: string;
  health_score: number | null;
  created_at: string;
  uploads: { file_name: string } | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalUploads, setTotalUploads] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [analysesRes, subRes, uploadsRes] = await Promise.all([
        supabase
          .from("analysis_results")
          .select("id, health_score, created_at, uploads(file_name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
        supabase.from("uploads").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);
      setAnalyses((analysesRes.data as any) || []);
      setSubscription(subRes.data);
      setTotalUploads(uploadsRes.count || 0);
      setLoading(false);
    };
    load();
  }, [user]);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + (a.health_score || 0), 0) / analyses.length)
    : 0;

  const used = subscription?.analyses_used_this_month || 0;
  const limit = subscription?.plan_type === "pro" ? "∞" : "2";

  const quickKPIs = [
    { label: "Analyses This Month", value: String(used), change: `${used}/${limit} used`, positive: true },
    { label: "Avg Health Score", value: avgScore ? String(avgScore) : "—" },
    { label: "Reports Uploaded", value: String(totalUploads) },
    { label: "Plan", value: subscription?.plan_type === "pro" ? "Pro" : "Free" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Your financial analysis overview</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/dashboard/upload"><Upload className="h-4 w-4 mr-2" /> Upload Report</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickKPIs.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recent Analyses
          </h2>
          <Link to="/dashboard/history" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No analyses yet</p>
            <p className="text-sm text-muted-foreground mb-4">Upload your first financial report to get started.</p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/upload">Upload Report</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/dashboard/analysis/${a.id}`} className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{(a.uploads as any)?.file_name || "Report"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.health_score !== null && (
                      <div className={`text-sm font-mono font-bold ${a.health_score >= 70 ? "text-success" : a.health_score >= 40 ? "text-warning" : "text-destructive"}`}>
                        {a.health_score}
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
