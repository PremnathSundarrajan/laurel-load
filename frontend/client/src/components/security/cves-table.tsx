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
import type { CVE } from "@shared/schema";

export default function CVEsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/cves"],
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

  const cves: CVE[] = data?.cves || [];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-2">Latest CVEs</h3>
      <p className="text-muted-foreground mb-6">Recent vulnerabilities discovered</p>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-muted-foreground font-medium">CVE ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Description</TableHead>
              <TableHead className="text-muted-foreground font-medium">Severity</TableHead>
              <TableHead className="text-muted-foreground font-medium">CVSS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cves.map((cve) => (
              <TableRow key={cve.id} data-testid={`row-cve-${cve.cveId}`}>
                <TableCell className="font-medium text-primary">{cve.cveId}</TableCell>
                <TableCell className="text-foreground">{cve.description}</TableCell>
                <TableCell>
                  <Badge className={`severity-${cve.severity}`} data-testid={`badge-severity-${cve.cveId}`}>
                    {cve.severity.charAt(0).toUpperCase() + cve.severity.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">{cve.cvssScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
