import React, { useEffect, useState, useCallback } from "react";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { Monitor, DoorOpen, AlertTriangle, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import SecurityOverview from "@/components/security/security-overview";
import ManualScan from "@/components/security/manual-scan";
import OpenPortsTable from "@/components/security/open-ports-table";
import CVEsTable from "@/components/security/cves-table";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Track if pages have been visited before
const pageVisits = {
  dashboard: false,
  devices: false
};

export default function Dashboard() {
  const { data: dashboardData, isLoading, refetch } = useSessionQuery<any>(
    "/api/dashboard",
    () => fetch("/api/dashboard", { credentials: "include" }).then(res => res.json())
  );

  // Check if this is first visit
  const [isFirstVisit, setIsFirstVisit] = useState(!pageVisits.dashboard);

  // Loading states for staged loading
  const [showMain, setShowMain] = useState(pageVisits.dashboard); // Start true if visited before
  const [showPorts, setShowPorts] = useState(pageVisits.dashboard);
  const [showCVEs, setShowCVEs] = useState(pageVisits.dashboard);
  const [isReloading, setIsReloading] = useState(false);

  // For manual scan trigger
  const [lastScanIp, setLastScanIp] = useState<string | null>(null);

  // Mark as visited on mount
  useEffect(() => {
    if (!pageVisits.dashboard) {
      pageVisits.dashboard = true;
    }
  }, []);

  // Staged loading effect - only for first visit or manual reload
  useEffect(() => {
    let mainTimeout: NodeJS.Timeout;
    let portsTimeout: NodeJS.Timeout;
    let cvesTimeout: NodeJS.Timeout;

    // Only show loading sequence for first visit or manual reload
    if ((!isLoading && isFirstVisit) || isReloading) {
      setShowMain(false);
      setShowPorts(false);
      setShowCVEs(false);
      mainTimeout = setTimeout(() => {
        setShowMain(true);
        portsTimeout = setTimeout(() => {
          setShowPorts(true);
          cvesTimeout = setTimeout(() => {
            setShowCVEs(true);
            if (isReloading) {
              setIsReloading(false);
            }
            if (isFirstVisit) {
              setIsFirstVisit(false);
            }
          }, 10000); // 10s for CVEs
        }, 8000); // 8s for ports
      }, 30000); // 30s for main
    }

    return () => {
      clearTimeout(mainTimeout);
      clearTimeout(portsTimeout);
      clearTimeout(cvesTimeout);
    };
  }, [isLoading, isFirstVisit, isReloading]);

  // Manual scan handler (to be passed to ManualScan)
  const handleManualScan = useCallback((ip: string) => {
    setIsReloading(true);
    setLastScanIp(ip);
    refetch();
  }, [refetch]);

  // Show loading spinner only for first visit or reload
  if (isLoading || (isFirstVisit && !showMain) || (isReloading && !showMain)) {
    return <LoadingSpinner text="LOADING" />;
  }

  const deviceCount = dashboardData?.deviceCount ?? 0;
  const openPortsCount = dashboardData?.openPortsCount ?? 0;
  const criticalCVECount = dashboardData?.criticalCVECount ?? 0;
  const securityItemsCount = dashboardData?.securityItemsCount ?? 0;

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Devices Card */}
          <div className="bg-card rounded-xl p-6 border border-border card-transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Devices</h3>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Monitor className="text-primary-foreground text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-device-count">
              {deviceCount}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Active network devices</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="text-primary mr-2 h-4 w-4" />
              <span className="text-primary">12%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </div>

          {/* Open Ports Card */}
          <div className="bg-card rounded-xl p-6 border border-border card-transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Open Ports</h3>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <DoorOpen className="text-white text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-500 mb-2" data-testid="text-open-ports-count">
              {openPortsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Detected open ports</div>
            <div className="flex items-center text-sm">
              <AlertTriangle className="text-yellow-500 mr-2 h-4 w-4" />
              <span className="text-yellow-500">High</span>
              <span className="text-muted-foreground ml-1">attention required</span>
            </div>
          </div>

          {/* Critical CVEs Card */}
          <div className="bg-card rounded-xl p-6 border border-border card-transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Critical CVEs</h3>
              <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-destructive-foreground text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-destructive mb-2" data-testid="text-critical-cve-count">
              {criticalCVECount}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Critical vulnerabilities</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="text-destructive mr-2 h-4 w-4" />
              <span className="text-destructive">5</span>
              <span className="text-muted-foreground ml-1">new this week</span>
            </div>
          </div>
        </div>

        {/* Manual Scan and Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ManualScan onManualScan={handleManualScan} />
          <SecurityOverview
            deviceCount={deviceCount}
            openPortsCount={openPortsCount}
            criticalCVECount={criticalCVECount}
            securityItemsCount={securityItemsCount}
          />
        </div>

        {/* Open Ports Table */}
        {showPorts ? <OpenPortsTable /> : <LoadingSpinner text="LOADING PORTS" />}

        {/* Latest CVEs */}
        {showCVEs ? <CVEsTable /> : (showPorts ? <LoadingSpinner text="LOADING CVES" /> : null)}
      </div>
    </div>
  );
}