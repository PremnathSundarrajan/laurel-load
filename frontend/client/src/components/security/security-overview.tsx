interface SecurityOverviewProps {
  deviceCount: number;
  openPortsCount: number;
  criticalCVECount: number;
  securityItemsCount: number;
}

export default function SecurityOverview({
  deviceCount,
  openPortsCount,
  criticalCVECount,
  securityItemsCount,
}: SecurityOverviewProps) {
  // Bigger radius for a larger circle
  const radius = 70; // was 50 before
  const circumference = 2 * Math.PI * radius;

  // Segment proportions
  const deviceSegment = 40;
  const portsSegment = 25;
  const cveSegment = 10;

  // Stroke lengths
  const deviceStrokeLength = (deviceSegment / 100) * circumference;
  const portsStrokeLength = (portsSegment / 100) * circumference;
  const cveStrokeLength = (cveSegment / 100) * circumference;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Security Overview</h3>

      <div className="flex items-center justify-center mb-6">
        {/* Increase container size */}
        <div className="relative w-56 h-56">
          {/* Update viewBox and circle center to match new radius */}
          <svg className="progress-circle w-56 h-56" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#4a5568"
              strokeWidth="20"   // keep same style
              fill="none"
            />

            {/* Devices */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#84d01f"
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${deviceStrokeLength} ${circumference - deviceStrokeLength}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
            />

            {/* Open Ports */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#22c55e"
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${portsStrokeLength} ${circumference - portsStrokeLength}`}
              strokeDashoffset={-deviceStrokeLength}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
            />

            {/* CVEs */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#16a34a"
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${cveStrokeLength} ${circumference - cveStrokeLength}`}
              strokeDashoffset={-(deviceStrokeLength + portsStrokeLength)}
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
            />
          </svg>

          {/* Center text stays same */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground" data-testid="text-security-items">
                {securityItemsCount}
              </div>
              <div className="text-sm text-muted-foreground">Security Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#84d01f' }}></div>
            <span className="text-foreground">Devices</span>
          </div>
          <span className="text-foreground font-medium" data-testid="text-devices-count">
            {deviceCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#22c55e' }}></div>
            <span className="text-foreground">Open Ports</span>
          </div>
          <span className="text-foreground font-medium" data-testid="text-ports-count">
            {openPortsCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#16a34a' }}></div>
            <span className="text-foreground">Critical CVEs</span>
          </div>
          <span className="text-foreground font-medium" data-testid="text-cves-count">
            {criticalCVECount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-muted rounded-full mr-3"></div>
            <span className="text-foreground">Other</span>
          </div>
          <span className="text-muted-foreground">—</span>
        </div>
      </div>
    </div>
  );
}
