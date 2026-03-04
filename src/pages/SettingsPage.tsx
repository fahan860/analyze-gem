import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8 text-sm">Manage your account and subscription.</p>

        {/* Account */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Email</span>
              <span className="text-sm text-muted-foreground">user@company.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Member since</span>
              <span className="text-sm text-muted-foreground">January 2026</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Subscription</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-foreground font-medium">Free Plan</p>
              <p className="text-xs text-muted-foreground">2 analyses per month</p>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">Active</Badge>
          </div>
          <Button variant="hero" className="w-full">Upgrade to Pro — $29/mo</Button>
        </div>

        {/* Usage */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Usage This Month</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Analyses used</span>
            <span className="text-sm font-mono text-foreground">3 / 2</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
          </div>
          <p className="text-xs text-warning mt-2">You've exceeded your free limit. Upgrade for unlimited.</p>
        </div>
      </motion.div>
    </div>
  );
}
