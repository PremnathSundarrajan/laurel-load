import type { Device } from "../../../../shared/schema";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { Wifi, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DeviceInventory() {
  const { data, isLoading } = useSessionQuery<{ devices: Device[] }>(
    "/api/devices",
    () => fetch("/api/devices", { credentials: "include" }).then(res => res.json())
  );


  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const devices: Device[] = data?.devices || [];

  const formatLastScan = (date: string) => {
    const scanDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSeverityTextColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Device Inventory</h3>
          <p className="text-muted-foreground">Complete list of network devices and their security status</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground font-medium">Device ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Network Info</TableHead>
              <TableHead className="text-muted-foreground font-medium">Manufacturer</TableHead>
              <TableHead className="text-muted-foreground font-medium">Firmware</TableHead>
              <TableHead className="text-muted-foreground font-medium">Risk Score</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id} data-testid={`row-device-${device.deviceId}`}>
                <TableCell className="font-medium text-foreground" data-testid={`text-device-id-${device.deviceId}`}>
                  {device.deviceId}
                </TableCell>
                <TableCell>
                  <div className="text-foreground">{device.ipAddress}</div>
                  <div className="text-sm text-muted-foreground">{device.deviceType}</div>
                </TableCell>
                <TableCell className="text-foreground">{device.manufacturer}</TableCell>
                <TableCell className="text-foreground">{device.firmware}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-12 bg-muted rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${getSeverityColor(device.riskScore)}`}
                        style={{ width: `${device.riskScore}%` }}
                      ></div>
                    </div>
                    <span className={`font-medium ${getSeverityTextColor(device.riskScore)}`}>
                      {device.riskScore}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`status-${device.status}`} data-testid={`badge-status-${device.deviceId}`}>
                    {device.status === "online" && <Wifi className="mr-1 h-3 w-3" />}
                    {device.status === "warning" && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLastScan(device.lastScan?.toString() || new Date().toISOString())}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
