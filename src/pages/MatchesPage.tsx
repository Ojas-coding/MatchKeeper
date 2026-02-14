
import { useQuery } from "@tanstack/react-query";
import { getMatches, getEvents } from "@/services/dataService";
import { Clock, Filter, Search, Trophy, Users, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import MainNav from "@/components/MainNav";
import MatchCard from "@/components/MatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchStatus, Event as EventType } from "@/types";
import { Input } from "@/components/ui/input";

const MatchesPage = () => {
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const eventMap = events?.reduce((acc, event) => {
    acc[event.id] = event.title;
    return acc;
  }, {} as Record<string, string>) || {};

  const filteredMatches = matches?.filter(match => {
    const statusMatch = statusFilter === "all" || match.status === statusFilter;
    const searchMatch = searchTerm === "" ||
                        match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        match.teamA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        match.teamB.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (eventMap[match.eventId] && eventMap[match.eventId].toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  }) || [];

  const CardSkeleton = () => (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <Skeleton className="h-4 w-full mt-2" />
    </div>
  );

  const isLoading = isLoadingMatches || isLoadingEvents;

  const getStatusStats = () => {
    const stats = {
      scheduled: matches?.filter(m => m.status === 'scheduled').length || 0,
      ongoing: matches?.filter(m => m.status === 'ongoing').length || 0,
      completed: matches?.filter(m => m.status === 'completed').length || 0,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <MainNav />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary/90 to-primary/80 text-white py-12">
        <div className="container">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-4 flex items-center justify-center">
              <Zap className="mr-4 h-12 w-12 text-yellow-300" />
              Live Matches
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Follow live scores, upcoming fixtures, and completed matches from all your favorite sports events.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-blue-300 mr-2" />
                  <span className="text-2xl font-bold">{stats.scheduled}</span>
                </div>
                <p className="text-sm text-white/80">Scheduled</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-yellow-300 mr-2" />
                  <span className="text-2xl font-bold">{stats.ongoing}</span>
                </div>
                <p className="text-sm text-white/80">Live Now</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-green-300 mr-2" />
                  <span className="text-2xl font-bold">{stats.completed}</span>
                </div>
                <p className="text-sm text-white/80">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-8">
        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Search Matches
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search matches, teams, events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(["all", "scheduled", "ongoing", "completed", "cancelled"] as const).map(status => (
                  <Button 
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => (
              <MatchCard 
                key={match.id} 
                match={match} 
                showEventLink 
                eventName={eventMap[match.eventId]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl bg-card">
            <div className="p-4 bg-secondary/10 rounded-full w-fit mx-auto mb-4">
              <Filter className="h-12 w-12 text-secondary" />
            </div>
            <p className="text-xl font-semibold text-foreground">No Matches Found</p>
            <p className="text-muted-foreground mt-1 mb-6">
              Try adjusting your search or filters to find matches.
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MatchesPage;
