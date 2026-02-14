
import { useQuery } from "@tanstack/react-query";
import { getAnnouncements } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const AnnouncementsSection = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Skeleton className="h-8 w-8 mr-3" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="mb-8 p-6 bg-muted/50 border border-muted rounded-xl">
        <div className="flex items-center mb-2">
          <div className="p-2 bg-muted rounded-lg mr-3">
            <Megaphone className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Announcements</h2>
        </div>
        <p className="text-muted-foreground text-center py-8">No announcements at this time.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-primary/20 rounded-lg mr-3">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Announcements</h2>
      </div>
      
      <div className="space-y-4">
        {announcements
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{announcement.eventTitle}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{format(new Date(announcement.createdAt), "MMM dd, yyyy 'at' HH:mm")}</span>
                      </div>
                      <span className="text-xs">by {announcement.createdByName}</span>
                    </div>
                  </div>
                  <Badge 
                    className={`flex items-center gap-1 ${getPriorityColor(announcement.priority)}`}
                    variant="outline"
                  >
                    {getPriorityIcon(announcement.priority)}
                    {announcement.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default AnnouncementsSection;
