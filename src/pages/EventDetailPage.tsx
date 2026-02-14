import { useQuery } from "@tanstack/react-query";
import { getEventById, getMatchesByEventId, getCurrentUser } from "@/services/dataService";
import { useParams, Link } from "react-router-dom";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Plus, ArrowLeft, Clock, Info, Users, Ticket, Copy } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TeamManagement from "@/components/TeamManagement";
import CreateAnnouncementDialog from "@/components/CreateAnnouncementDialog";

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId || ""),
    enabled: !!eventId,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches", eventId],
    queryFn: () => getMatchesByEventId(eventId || ""),
    enabled: !!eventId,
  });


  if (!eventId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNav />
        <main className="flex-1 container py-8 text-center">
          <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold text-destructive">Error: Event ID Missing</h1>
          <p className="text-muted-foreground mt-2">The event ID was not provided in the URL.</p>
          <Button asChild className="mt-6">
            <Link to="/events">Back to Events</Link>
          </Button>
        </main>
      </div>
    );
  }
  
  const DetailSkeleton = () => (
    <>
      <Skeleton className="h-10 w-3/4 sm:w-1/2 mb-2" />
      <Skeleton className="h-5 w-1/2 sm:w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-8 w-1/4 mb-2" />
      <Skeleton className="h-20 w-full" />
    </>
  );

  const MatchListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 shadow-sm animate-pulse">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-5 w-1/6" />
            <Skeleton className="h-8 w-1/3" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </div>
      ))}
    </div>
  );

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success("Join code copied to clipboard!", {
          icon: <Copy className="mr-2 h-4 w-4" />
        });
      })
      .catch(() => {
        toast.error("Failed to copy join code.");
      });
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="mb-6 hover:bg-primary/10 hover:border-primary">
            <Link to="/events" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Events
            </Link>
          </Button>

          {isLoadingEvent ? (
            <DetailSkeleton />
          ) : event ? (
            <>
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className="bg-primary/5 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{event.title}</h1>
                      <div className="flex items-center mt-2 space-x-3 flex-wrap">
                        <StatusBadge status={event.status} />
                        <span className="text-sm text-muted-foreground">
                          Created: {format(new Date(event.createdAt), "PP")}
                        </span>
                      </div>
                    </div>
                    
                    {currentUser?.role === "admin" && (
                      <Button asChild size="lg">
                        <Link to={`/admin/events/${eventId}/matches/create`}>
                          <Plus className="mr-2 h-5 w-5" />
                          Add Match
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start p-4 bg-muted/50 rounded-md">
                      <Calendar className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground block">Event Dates</span>
                        <span className="text-muted-foreground">
                          {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString()
                            ? format(new Date(event.startDate), "EEEE, MMMM dd, yyyy")
                            : `${format(new Date(event.startDate), "MMMM dd")} - ${format(new Date(event.endDate), "MMMM dd, yyyy")}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-muted/50 rounded-md">
                      <MapPin className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground block">Venue</span>
                        <span className="text-muted-foreground">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {event.joinCode && currentUser?.role === 'admin' && (
                    <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
                            <Ticket className="h-5 w-5 mr-2" />
                            Event Join Code
                          </h3>
                          <div className="flex items-center gap-3">
                            <p className="text-xl font-mono bg-background px-3 py-1.5 rounded border border-primary/30 text-primary tracking-wider">
                              {event.joinCode}
                            </p>
                            <Button variant="outline" size="icon" onClick={() => handleCopyJoinCode(event.joinCode!)} title="Copy join code">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Share this code with participants and coaches to join the event.</p>
                        </div>
                        <CreateAnnouncementDialog eventId={event.id} eventTitle={event.title} />
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-secondary" />
                      Event Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description || "No description provided."}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Management for Team Events */}
              {event.isTeamEvent && (
                <TeamManagement eventId={event.id} isAdmin={currentUser?.role === 'admin'} />
              )}
            </>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg bg-card">
              <Calendar className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-xl font-semibold text-destructive">Event Not Found</p>
              <p className="text-muted-foreground mt-1">The event you are looking for does not exist or may have been removed.</p>
              <Button asChild className="mt-6">
                <Link to="/events">View All Events</Link>
              </Button>
            </div>
          )}
        </div>

        {event && ( // Only show matches if event exists
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground flex items-center">
                <Clock className="mr-3 h-6 sm:h-7 w-6 sm:h-7 text-accent" />
                Matches in This Event
              </h2>
            </div>
            
            {isLoadingMatches ? (
              <MatchListSkeleton />
            ) : matches && matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg bg-card">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-foreground">No Matches Yet</p>
                <p className="text-muted-foreground mt-1">No matches have been added to this event.</p>
                {currentUser?.role === "admin" && (
                  <Button asChild className="mt-6">
                    <Link to={`/admin/events/${eventId}/matches/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Match
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default EventDetailPage;
