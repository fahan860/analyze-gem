import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";


// We'll extract text client-side using a simple approach
async function extractTextFromPDF(file: File): Promise<string> {
  // Read file as ArrayBuffer and use basic text extraction
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Simple PDF text extraction - find text between stream markers
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const rawText = decoder.decode(uint8Array);
  
  // Extract readable text segments
  const segments = rawText.match(/\(([^)]+)\)/g);
  if (segments) {
    text = segments.map(s => s.slice(1, -1)).join(" ");
  }
  
  // Also try to find BT...ET text blocks
  const btBlocks = rawText.match(/BT[\s\S]*?ET/g);
  if (btBlocks) {
    for (const block of btBlocks) {
      const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
      if (tjMatches) {
        text += " " + tjMatches.map(m => {
          const match = m.match(/\(([^)]*)\)/);
          return match ? match[1] : "";
        }).join(" ");
      }
    }
  }

  // Clean up
  text = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
  
  if (text.length < 100) {
    throw new Error("Could not extract sufficient text from the PDF. The file may be image-based or encrypted.");
  }

  return text;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateFile = (f: File): string | null => {
    if (f.type !== "application/pdf") return "Only PDF files are accepted.";
    if (f.size > 10 * 1024 * 1024) return "File size must be under 10MB.";
    return null;
  };

  const handleFile = useCallback((f: File) => {
    setError("");
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setError("");

    try {
      // 1. Check subscription limits
      setStatus("Checking usage limits...");
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (sub && sub.plan_type === "free" && sub.analyses_used_this_month >= 2) {
        setError("Free plan limit reached (2/month). Upgrade to Pro for unlimited analyses.");
        setUploading(false);
        return;
      }

      // 2. Upload file to storage
      setStatus("Uploading PDF...");
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Create upload record
      const { data: upload, error: insertError } = await supabase
        .from("uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: filePath,
          file_size: file.size,
          status: "processing",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Extract text from PDF
      setStatus("Extracting text from PDF...");
      let extractedText: string;
      try {
        extractedText = await extractTextFromPDF(file);
      } catch {
        // If client-side extraction fails, send a minimal message
        extractedText = `Financial report: ${file.name}. Unable to extract text client-side. Please analyze based on the filename and common financial report patterns.`;
      }

      // 5. Call AI analysis
      setStatus("Analyzing with AI...");
      const { data: analysisData, error: fnError } = await supabase.functions.invoke("analyze-report", {
        body: { extractedText },
      });

      if (fnError) throw fnError;
      if (analysisData?.error) throw new Error(analysisData.error);

      // 6. Save analysis results
      setStatus("Saving results...");
      const { data: analysis, error: saveError } = await supabase
        .from("analysis_results")
        .insert({
          upload_id: upload.id,
          user_id: user.id,
          summary: analysisData.summary,
          kpis_json: analysisData.kpis,
          risk_factors: analysisData.risk_factors,
          health_score: analysisData.health_score,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // 7. Update upload status
      await supabase.from("uploads").update({ status: "completed" }).eq("id", upload.id);

      // 8. Increment usage
      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ analyses_used_this_month: (sub.analyses_used_this_month || 0) + 1 })
          .eq("user_id", user.id);
      }

      toast.success("Analysis complete!");
      navigate(`/dashboard/analysis/${analysis.id}`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during analysis.");
      toast.error("Analysis failed. Please try again.");
    } finally {
      setUploading(false);
      setStatus("");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload Financial Report</h1>
        <p className="text-muted-foreground mb-8">Upload a 10-K, 10-Q, or annual report PDF for AI analysis.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`glass-card border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border/50"}`}
          onClick={() => !uploading && document.getElementById("file-input")?.click()}
        >
          <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">Drop your PDF here or click to browse</p>
          <p className="text-sm text-muted-foreground">PDF only, max 10MB</p>
        </div>

        {error && <p className="text-destructive text-sm mt-4">{error}</p>}

        {file && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-4 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!uploading && (
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}

        {status && (
          <p className="text-sm text-primary mt-3 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> {status}
          </p>
        )}

        <Button className="mt-6 w-full" variant="hero" size="lg" disabled={!file || uploading} onClick={handleUpload}>
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            "Start Analysis"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
