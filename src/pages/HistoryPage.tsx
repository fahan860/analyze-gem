import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalysisRow {
  id: string;
  health_score: number | null;
  created_at: string;
  uploads: { file_name: string } | null;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analysis_results")
      .select("id, health_score, created_at, uploads(file_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAnalyses((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Analysis History</h1>
        <p className="text-muted-foreground mb-8 text-sm">All your previously analyzed reports.</p>

        {analyses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No analyses yet. Upload a report to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
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
