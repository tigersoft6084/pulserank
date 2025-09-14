"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AxiosInstance } from "@/lib/axios-instance";

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  hitRate: number;
  averageResponseTime: number;
}

export function CacheStats() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get("/api/cache");
      setStats(response.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch cache statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanupCache = async () => {
    try {
      await AxiosInstance.post("/api/cache", {
        action: "cleanup",
      });

      toast({
        title: "Success",
        description: "Cache cleanup completed",
      });
      fetchStats(); // Refresh stats
    } catch {
      toast({
        title: "Error",
        description: "Failed to cleanup cache",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cache Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            {loading ? "Loading..." : "No cache data available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hitRatePercentage = (stats.hitRate * 100).toFixed(1);
  const avgResponseTime = stats.averageResponseTime.toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cache Statistics
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cleanupCache}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.cacheHits}
            </div>
            <div className="text-sm text-muted-foreground">Cache Hits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.cacheMisses}
            </div>
            <div className="text-sm text-muted-foreground">Cache Misses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.apiCalls}
            </div>
            <div className="text-sm text-muted-foreground">API Calls</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hit Rate</span>
            <Badge variant={stats.hitRate > 0.7 ? "default" : "secondary"}>
              {hitRatePercentage}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg Response Time</span>
            <Badge variant="outline">{avgResponseTime}ms</Badge>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Cost Savings:</strong> Approximately{" "}
            {Math.round(stats.cacheHits * 0.1)} API calls saved today
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
