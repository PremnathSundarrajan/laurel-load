import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Home, Monitor, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { path: "/devices", label: "Devices", icon: <Monitor className="w-4 h-4" /> },
  { path: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export default function Header() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">CyberGuard</h1>
          </div>
          
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Last updated: <span data-testid="text-last-updated">{currentTime}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-logout"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
