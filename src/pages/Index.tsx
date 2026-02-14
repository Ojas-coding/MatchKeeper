
import { useQuery } from "@tanstack/react-query";
import { getEvents, getMatches, getCurrentUser } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Calendar, Clock, Zap, Target, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import MainNav from "@/components/MainNav";
import EventCard from "@/components/EventCard";
import MatchCard from "@/components/MatchCard";

const Index = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const ongoingMatches = matches?.filter(match => match.status === "ongoing").slice(0, 3) || [];
  const upcomingEvents = events?.filter(event => 
    event.status === "upcoming" || event.status === "ongoing"
  ).slice(0, 3) || [];
  const recentMatches = matches?.filter(match => match.status === "completed" || match.status === "scheduled").sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-8 mx-auto shadow-2xl">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
            Welcome to <span className="text-primary">MatchKeeper</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground">
            Your ultimate platform for organizing, tracking, and engaging with sports events and matches.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 mb-10">
            <div className="flex items-center text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Target className="h-4 w-4 mr-2 text-primary" />
              Event Management
            </div>
            <div className="flex items-center text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Users className="h-4 w-4 mr-2 text-secondary" />
              Team Coordination
            </div>
            <div className="flex items-center text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border">
              <Award className="h-4 w-4 mr-2 text-accent" />
              Live Tracking
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3 shadow-lg">
              <Link to="/events">Explore Events</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 border-primary text-primary hover:bg-primary/10 shadow-lg">
              <Link to="/matches">View Matches</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-10 space-y-12">
        {/* Live Updates Section */}
        <section id="live-updates">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <Zap className="mr-3 h-7 w-7 text-accent" />
              Live Updates
            </h2>
            {ongoingMatches.length > 0 && (
              <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                 <Link to="/matches?status=ongoing">View All Live</Link>
              </Button>
            )}
          </div>
          
          {isLoadingMatches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : ongoingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingMatches.map(match => (
                <MatchCard key={match.id} match={match} showEventLink />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg bg-card">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No Matches Live Right Now</p>
              <p className="text-muted-foreground mt-1">Check back soon for real-time updates!</p>
            </div>
          )}
        </section>

        {/* Upcoming Events Section */}
        <section id="upcoming-events">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <Calendar className="mr-3 h-7 w-7 text-secondary" />
              Upcoming Events
            </h2>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
          
          {isLoadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} type="event" />)}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg bg-card">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No Upcoming Events Scheduled</p>
              <p className="text-muted-foreground mt-1">Stay tuned for new event announcements!</p>
            </div>
          )}
        </section>

        {/* Recent Matches Section */}
        <section id="recent-matches">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <Trophy className="mr-3 h-7 w-7 text-yellow-500" />
              Recent Matches
            </h2>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/matches">View All Matches</Link>
            </Button>
          </div>
          
          {isLoadingMatches ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : recentMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMatches.map(match => (
                <MatchCard key={match.id} match={match} showEventLink />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg bg-card">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">No Match Data Available</p>
              <p className="text-muted-foreground mt-1">Come back after some matches have been played.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// Helper component for skeleton loading states
const CardSkeleton = ({ type = "match" }: { type?: "match" | "event" }) => (
  <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    {type === "match" && (
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    )}
    {type === "event" && (
      <>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
      </>
    )}
    <Skeleton className="h-4 w-full mt-2" />
  </div>
);

export default Index;
