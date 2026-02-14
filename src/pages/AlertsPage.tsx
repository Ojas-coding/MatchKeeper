import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, Megaphone, Trophy, Users, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/types";
import { Link } from "react-router-dom";

const AlertsPage = () => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAlertAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unreadAlertsCount"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAlertsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unreadAlertsCount"] });
    }
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'match_upcoming':
        return <Trophy className="h-5 w-5 text-primary" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-blue-500" />;
      case 'team_assigned':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'event_update':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'match_result':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'match_upcoming':
        return 'Match';
      case 'announcement':
        return 'Announcement';
      case 'team_assigned':
        return 'Team';
      case 'event_update':
        return 'Event Update';
      case 'match_result':
        return 'Result';
      default:
        return 'Alert';
    }
  };

  const unreadCount = alerts?.filter(a => !a.isRead).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <MainNav />
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with match schedules, announcements, and event updates.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
        
        {!alerts || alerts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Alerts Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You'll receive alerts here when you have upcoming matches, new announcements, 
                or team assignments for events you've joined.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`transition-colors ${!alert.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${!alert.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getAlertTypeLabel(alert.type)}
                        </Badge>
                        {alert.eventTitle && (
                          <span className="text-xs text-muted-foreground truncate">
                            {alert.eventTitle}
                          </span>
                        )}
                        {!alert.isRead && (
                          <Badge variant="default" className="text-xs bg-primary">
                            New
                          </Badge>
                        )}
                      </div>
                      <h3 className={`font-semibold ${!alert.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(alert.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                        {alert.eventId && (
                          <Link 
                            to={`/events/${alert.eventId}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View Event
                          </Link>
                        )}
                        {alert.matchId && (
                          <Link 
                            to={`/matches/${alert.matchId}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View Match
                          </Link>
                        )}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AlertsPage;
