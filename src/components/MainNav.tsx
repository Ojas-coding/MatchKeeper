
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUnreadAlertsCount } from "@/services/dataService";
import { Badge } from "@/components/ui/badge";

const MainNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadAlertsCount"],
    queryFn: getUnreadAlertsCount,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center mr-8">
          <Trophy className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-xl">MatchKeeper</span>
        </Link>
        {user && (
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link to="/events" className="text-sm font-medium transition-colors hover:text-primary">
              Events
            </Link>
            <Link to="/matches" className="text-sm font-medium transition-colors hover:text-primary">
              Matches
            </Link>
            <Link to="/announcements" className="text-sm font-medium transition-colors hover:text-primary">
              Announcements
            </Link>
            <Link to="/alerts" className="text-sm font-medium transition-colors hover:text-primary relative flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                Admin
              </Link>
            )}
          </nav>
        )}
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-2">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleLogin}>
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainNav;
