import { motion } from "framer-motion";
import { Download, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import HealthScoreGauge from "@/components/HealthScoreGauge";

const mockData = {
  fileName: "Apple_10K_2025.pdf",
  date: "March 2, 2026",
  healthScore: 82,
  summary:
    "Apple Inc. reported strong fiscal year 2025 results with record services revenue of $96.2B, representing a 14% year-over-year increase. Hardware revenue remained stable with iPhone generating $201.3B. The company maintained robust operating margins of 30.8%, driven by services growth and operational efficiencies. Free cash flow of $110.5B supported $95B in share repurchases and $15.2B in dividends. Key risks include regulatory pressure in the EU and China market slowdown.",
  kpis: [
    { label: "Revenue", value: "$394.3B", change: "+8.2% YoY", positive: true },
    { label: "Net Income", value: "$101.2B", change: "+11.5% YoY", positive: true },
    { label: "EBITDA", value: "$134.7B", change: "+9.1% YoY", positive: true },
    { label: "EPS", value: "$6.63", change: "+14.3% YoY", positive: true },
    { label: "Total Debt", value: "$98.1B", change: "-5.2% YoY", positive: true },
    { label: "Cash Flow", value: "$110.5B", change: "+7.8% YoY", positive: true },
  ],
  risks: [
    "EU Digital Markets Act compliance may require significant App Store changes, potentially impacting services revenue by 3-5%.",
    "China revenue declined 2.1% amid economic slowdown and increased local competition from Huawei.",
    "Supply chain concentration in East Asia remains elevated despite diversification efforts.",
    "Rising interest rates could impact consumer financing and demand for premium products.",
    "Potential antitrust actions in multiple jurisdictions may limit platform monetization strategies.",
  ],
};

export default function AnalysisPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{mockData.fileName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Analyzed on {mockData.date}</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>

        {/* Health Score + Summary */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 flex flex-col items-center justify-center relative">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Financial Health</h3>
            <HealthScoreGauge score={mockData.healthScore} />
          </div>
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Executive Summary</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{mockData.summary}</p>
          </div>
        </div>

        {/* KPIs */}
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {mockData.kpis.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Risk Factors */}
        <div className="glass-card p-6">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Risk Factors
          </h3>
          <ul className="space-y-3">
            {mockData.risks.map((risk, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 text-sm"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <span className="text-foreground/80 leading-relaxed">{risk}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
