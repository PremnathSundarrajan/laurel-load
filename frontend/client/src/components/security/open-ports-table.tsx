import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OpenPort } from "@shared/schema";

export default function OpenPortsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/open-ports"],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const openPorts: OpenPort[] = data?.openPorts || [];

  return (
    <div className="bg-card rounded-xl p-6 border border-border mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-2">Open Ports</h3>
      <p className="text-muted-foreground mb-6">Network ports currently accessible</p>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground font-medium">Device ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">IP Address</TableHead>
              <TableHead className="text-muted-foreground font-medium">Open Ports</TableHead>
              <TableHead className="text-muted-foreground font-medium">Suspicious</TableHead>
              <TableHead className="text-muted-foreground font-medium">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openPorts.map((port) => (
              <TableRow key={port.id} data-testid={`row-port-${port.deviceId}`}>
                <TableCell className="font-medium text-foreground">{port.deviceId}</TableCell>
                <TableCell className="text-muted-foreground">192.168.1.100</TableCell>
                <TableCell className="text-foreground">{port.ports}</TableCell>
                <TableCell>
                  <Badge className={port.suspicious ? "severity-critical" : "severity-low"}>
                    {port.suspicious ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`severity-${port.severity}`} data-testid={`badge-severity-${port.deviceId}`}>
                    {port.severity.charAt(0).toUpperCase() + port.severity.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
