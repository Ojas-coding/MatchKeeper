
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getEvents, getMatches } from "@/services/dataService";
import { Link, useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Trophy, Calendar, Clock, Activity, Settings, ShieldCheck, BarChart3, Star, Zap } from "lucide-react";
import { useEffect } from "react";

const AdminPage = () => {
  const navigate = useNavigate();
  
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

  // Redirect to home if not admin
  useEffect(() => {
    if (!isLoadingUser && currentUser && currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, isLoadingUser, navigate]);

  if (isLoadingUser || (currentUser && currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <MainNav />
        <div className="flex-1 container py-8 text-center">
           {isLoadingUser ? <Skeleton className="h-64 w-full" /> : <p>Access Denied.</p>}
        </div>
      </div>
    );
  }

  const eventsCount = events?.length || 0;
  const matchesCount = matches?.length || 0;
  const ongoingCount = matches?.filter(m => m.status === "ongoing").length || 0;
  const completedCount = matches?.filter(m => m.status === "completed").length || 0;
  
  const StatCard = ({ title, value, icon: Icon, description, isLoading, colorClass = "text-primary" }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean, colorClass?: string }) => (
    <Card className="overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 bg-gradient-to-br from-card to-card/95">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-foreground mb-2">
          {isLoading ? <Skeleton className="h-8 w-16" /> : value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <MainNav />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-secondary/80 text-white py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold tracking-tight mb-4 flex items-center justify-center lg:justify-start">
                <ShieldCheck className="mr-4 h-12 w-12 text-yellow-300" />
                Admin Dashboard
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                Oversee and manage all aspects of MatchKeeper. Control events, monitor matches, and ensure smooth operations.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-6 text-sm">
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-300" />
                  <span>Full Control Access</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-300" />
                  <span>Real-time Management</span>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg">
              <Link to="/admin/events/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Events" value={eventsCount} icon={Calendar} description="All active & past events" isLoading={isLoadingEvents} colorClass="text-secondary" />
          <StatCard title="Total Matches" value={matchesCount} icon={Trophy} description="Across all events" isLoading={isLoadingMatches} colorClass="text-accent" />
          <StatCard title="Ongoing Matches" value={ongoingCount} icon={Activity} description="Currently in progress" isLoading={isLoadingMatches} colorClass="text-orange-500" />
          <StatCard title="Completed Matches" value={completedCount} icon={Clock} description="Finished and recorded" isLoading={isLoadingMatches} colorClass="text-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events Management */}
          <Card className="lg:col-span-2 overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <div className="p-2 bg-secondary/20 rounded-lg mr-3">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  Events Management
                </CardTitle>
                <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90">
                  <Link to="/admin/events/create">
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Event
                  </Link>
                </Button>
              </div>
              <CardDescription className="mt-1">Create, view, and manage all sports events with full administrative control.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/events" className="block p-4 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 rounded-lg transition-all duration-300 border border-primary/20 hover:border-primary/30">
                    <div className="flex items-center mb-2">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-semibold text-foreground">View All Events</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Browse and edit existing events with detailed oversight.</p>
                </Link>
                 <Link to="/admin/events/create" className="block p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 hover:from-secondary/10 hover:to-secondary/15 rounded-lg transition-all duration-300 border border-secondary/20 hover:border-secondary/30">
                    <div className="flex items-center mb-2">
                      <Plus className="h-5 w-5 mr-2 text-secondary" />
                      <h3 className="font-semibold text-foreground">Create New Event</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Add a new event to the platform with custom settings.</p>
                </Link>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
             <CardHeader className="border-b bg-gradient-to-r from-accent/5 to-orange-100/50">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <div className="p-2 bg-accent/20 rounded-lg mr-3">
                      <Settings className="h-6 w-6 text-accent" />
                    </div>
                    Quick Actions
                </CardTitle>
                <CardDescription className="mt-1">Access common administrative tasks and monitoring tools.</CardDescription>
             </CardHeader>
             <CardContent className="p-6 space-y-3">
                <Button asChild variant="outline" className="w-full justify-start hover:bg-accent/10 hover:border-accent/30 transition-all duration-300">
                    <Link to="/matches?status=ongoing">
                      <Activity className="mr-2 h-4 w-4 text-accent" /> 
                      Update Ongoing Matches
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start hover:bg-secondary/10 hover:border-secondary/30 transition-all duration-300">
                    <Link to="/matches">
                      <BarChart3 className="mr-2 h-4 w-4 text-secondary" /> 
                      View All Match Results
                    </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start text-muted-foreground cursor-not-allowed bg-muted/20">
                    <Users className="mr-2 h-4 w-4" /> 
                    Manage Users (Coming Soon)
                </Button>
             </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
