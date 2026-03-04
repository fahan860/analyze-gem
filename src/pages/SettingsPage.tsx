import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setSubscription(data);
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

  const used = subscription?.analyses_used_this_month || 0;
  const limit = subscription?.plan_type === "pro" ? Infinity : 2;
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8 text-sm">Manage your account and subscription.</p>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Email</span>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Member since</span>
              <span className="text-sm text-muted-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Subscription</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-foreground font-medium">{subscription?.plan_type === "pro" ? "Pro Plan" : "Free Plan"}</p>
              <p className="text-xs text-muted-foreground">{subscription?.plan_type === "pro" ? "Unlimited analyses" : "2 analyses per month"}</p>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              {subscription?.status || "Active"}
            </Badge>
          </div>
          {subscription?.plan_type !== "pro" && (
            <Button variant="hero" className="w-full">Upgrade to Pro — $29/mo</Button>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Usage This Month</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Analyses used</span>
            <span className="text-sm font-mono text-foreground">{used} / {limit === Infinity ? "∞" : limit}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          {subscription?.plan_type !== "pro" && used >= 2 && (
            <p className="text-xs text-warning mt-2">You've reached your free limit. Upgrade for unlimited.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
