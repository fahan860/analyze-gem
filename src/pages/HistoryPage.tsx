import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";

const history = [
  { id: "demo", name: "Apple_10K_2025.pdf", date: "Mar 2, 2026", score: 82 },
  { id: "demo2", name: "Tesla_Annual_2025.pdf", date: "Feb 28, 2026", score: 65 },
  { id: "demo3", name: "Microsoft_10Q_Q3.pdf", date: "Feb 20, 2026", score: 91 },
  { id: "demo4", name: "Amazon_10K_2025.pdf", date: "Feb 15, 2026", score: 74 },
  { id: "demo5", name: "Google_10Q_Q4.pdf", date: "Feb 10, 2026", score: 88 },
];

export default function HistoryPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Analysis History</h1>
        <p className="text-muted-foreground mb-8 text-sm">All your previously analyzed reports.</p>
        <div className="space-y-3">
          {history.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
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
