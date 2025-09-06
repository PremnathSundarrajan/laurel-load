import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { scanSchema, type ScanRequest } from "@shared/schema";

interface ManualScanProps {
  onManualScan?: (ip: string) => void;
}

export default function ManualScan({ onManualScan }: ManualScanProps) {
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<ScanRequest>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      target: "",
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (data: ScanRequest) => {
      const response = await apiRequest("POST", "/api/scan", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScanInProgress(true);
      setScanProgress(0);
      
      // Simulate scan progress
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(interval);
            setScanInProgress(false);
            setScanProgress(0);
            form.reset();
            toast({
              title: "Scan completed",
              description: "Security scan completed successfully. Check the results in the dashboard.",
            });
            return 100;
          }
          return newProgress;
        });
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Scan failed",
        description: error.message || "Failed to start security scan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScanRequest) => {
    scanMutation.mutate(data);
    if (onManualScan) {
      onManualScan(data.target);
    }
  };

  const target = form.watch("target");
  const isFormValid = target && target.trim().length > 0;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Manual Scan</h3>
      <p className="text-muted-foreground mb-6">
        Initiate a comprehensive network security scan to identify vulnerabilities and threats
      </p>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">Scan Target</Label>
          <Input
            type="text"
            data-testid="input-scan-target"
            className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter IP address or network range (e.g., 192.168.1.0/24)"
            {...form.register("target")}
          />
          {form.formState.errors.target && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.target.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Specify the target for the security scan</p>
        </div>
        
        <Button
          type="submit"
          data-testid="button-start-scan"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
          disabled={!isFormValid || scanInProgress || scanMutation.isPending}
        >
          <Search className="mr-2 h-4 w-4" />
          {scanInProgress ? "Scanning..." : "Start Security Scan"}
        </Button>
      </form>
      
      {/* Scan Status */}
      {scanInProgress && (
        <div className="mt-4 p-4 bg-secondary rounded-lg" data-testid="scan-status">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-3"></div>
            <span className="text-foreground">Scanning network...</span>
          </div>
          <div className="mt-2 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
              data-testid="scan-progress"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
