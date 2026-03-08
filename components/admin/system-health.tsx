"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Server, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HealthData {
  status: string;
  database: {
    status: string;
    latency: string;
  };
  system: {
    memoryUsage: string;
    uptime: string;
    loadAvg: number[];
  };
  timestamp: string;
}

export function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/admin/health");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-[200px] md:h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">
        Fetching health metrics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[200px] md:h-[300px] flex flex-col items-center justify-center text-destructive gap-2">
        <XCircle className="h-8 w-8" />
        <p className="text-sm font-medium">Failed to load system health</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="grid grid-cols-1 gap-4">
        {/* Status Indicators */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Database Connection</p>
              <p className="text-xs text-muted-foreground">Latency: {data.database.latency}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Healthy
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Memory Usage</p>
              <p className="text-xs text-muted-foreground">System Resource</p>
            </div>
          </div>
          <div className="text-blue-600 font-bold text-lg">
            {data.system.memoryUsage}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">System Uptime</p>
              <p className="text-xs text-muted-foreground">Service Duration</p>
            </div>
          </div>
          <div className="text-amber-600 font-medium text-sm">
            {data.system.uptime}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-center text-muted-foreground mt-2">
        Last updated: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
