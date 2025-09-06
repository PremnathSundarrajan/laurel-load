import { useQuery } from "@tanstack/react-query";
import { Plus, User, Trash2 } from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Settings() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const users: User[] = data?.users || [];

  const getUserIcon = (role: string) => {
    const colors = {
      admin: "bg-primary",
      analyst: "bg-blue-500",
      viewer: "bg-purple-500",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        {/* User Management */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">User Management</h3>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-user">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Current Users</h4>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-secondary rounded-lg">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg" data-testid={`user-item-${user.username}`}>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${getUserIcon(user.role)} rounded-full flex items-center justify-center mr-4`}>
                        <User className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{user.email}</div>
                        <div className="text-muted-foreground text-sm">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={user.isActive ? "status-active" : "status-inactive"} data-testid={`badge-status-${user.username}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" data-testid={`button-delete-${user.username}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
          
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-foreground font-medium">Two-Factor Authentication</h4>
                <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
              </div>
              <Switch defaultChecked data-testid="switch-2fa" />
            </div>

            {/* Session Timeout */}
            <div>
              <h4 className="text-foreground font-medium mb-2">Session Timeout</h4>
              <Select defaultValue="30">
                <SelectTrigger data-testid="select-session-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Notifications */}
            <div>
              <h4 className="text-foreground font-medium mb-4">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-alerts" className="text-foreground">Critical vulnerabilities detected</Label>
                  <Switch id="critical-alerts" defaultChecked data-testid="switch-critical-alerts" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="text-foreground">Weekly security reports</Label>
                  <Switch id="weekly-reports" defaultChecked data-testid="switch-weekly-reports" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
