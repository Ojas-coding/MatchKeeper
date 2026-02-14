import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatch, getEventById, getEventTeams, getEventParticipants } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon, ArrowLeft, Clock, Info, PartyPopper, Users, User } from "lucide-react";
import { toast } from "sonner";
import { MatchStatus, Team, EventParticipant } from "@/types";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CreateMatchPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeString, setTimeString] = useState("12:00");
  const [status, setStatus] = useState<MatchStatus>("scheduled");

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId || ""),
    enabled: !!eventId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["eventTeams", eventId],
    queryFn: () => getEventTeams(eventId || ""),
    enabled: !!eventId && event?.isTeamEvent === true,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["eventParticipants", eventId],
    queryFn: () => getEventParticipants(eventId || ""),
    enabled: !!eventId,
  });

  // Filter to only get players (not coaches or admins)
  const players = participants.filter(p => p.role === 'player');

  useEffect(() => {
    if (event && !date) {
      setDate(new Date(event.startDate));
    }
  }, [event, date]);

  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      toast.success(
        <div className="flex items-center">
          <PartyPopper className="mr-2 h-5 w-5 text-green-500" />
          Match "{data.title}" created successfully!
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      navigate(`/events/${eventId}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create match: ${error.message || "Unknown error"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedA || !selectedB || !date || !timeString) {
      toast.error("Please fill in all required fields.", {
        icon: <Info className="mr-2 h-5 w-5 text-yellow-500" />,
      });
      return;
    }

    if (selectedA === selectedB) {
      toast.error("Cannot select the same team/player for both sides.", {
        icon: <Info className="mr-2 h-5 w-5 text-yellow-500" />,
      });
      return;
    }
    
    if (!eventId || !event) {
      toast.error("Event information is missing. Cannot create match.");
      return;
    }
    
    const parsedTime = parse(timeString, "HH:mm", new Date());
    const startTime = new Date(date);
    startTime.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
    
    if (format(startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && startTime < new Date()) {
        toast.error("Match start time cannot be in the past for today's date.", {
            icon: <Clock className="mr-2 h-5 w-5 text-yellow-500" />,
        });
        return;
    }

    // Get display names for the match
    let teamAName = "";
    let teamBName = "";
    let teamAId: string | undefined;
    let teamBId: string | undefined;
    let playerAId: string | undefined;
    let playerBId: string | undefined;

    if (event.isTeamEvent) {
      const teamA = teams.find(t => t.id === selectedA);
      const teamB = teams.find(t => t.id === selectedB);
      teamAName = teamA?.name || "";
      teamBName = teamB?.name || "";
      teamAId = selectedA;
      teamBId = selectedB;
    } else {
      const playerA = players.find(p => p.id === selectedA);
      const playerB = players.find(p => p.id === selectedB);
      teamAName = playerA?.userName || "";
      teamBName = playerB?.userName || "";
      playerAId = selectedA;
      playerBId = selectedB;
    }

    createMatchMutation.mutate({
      eventId,
      title,
      teamA: teamAName,
      teamB: teamBName,
      teamAId,
      teamBId,
      playerAId,
      playerBId,
      startTime: startTime.toISOString(),
      status,
      sport: event.sport,
      notes: notes || undefined
    });
  };

  if (isLoadingEvent && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <MainNav />
        <main className="flex-1 container py-8 text-center">
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
          <Card className="max-w-3xl mx-auto shadow-xl"><CardContent className="p-8"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </main>
      </div>
    );
  }

  const isTeamEvent = event?.isTeamEvent || false;
  const hasSelections = isTeamEvent ? teams.length >= 2 : players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <MainNav />
      
      <main className="flex-1 container py-8">
         <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-6 hover:bg-primary/10 hover:border-primary"
            onClick={() => navigate(eventId ? `/events/${eventId}` : '/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {event ? `Back to ${event.title}` : "Back to Events"}
          </Button>
        </div>
        
        <Card className="max-w-3xl mx-auto shadow-xl border-border/60">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create New Match</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {event ? (
                <span className="flex items-center gap-2">
                  {isTeamEvent ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {isTeamEvent ? "Team Event" : "Individual Event"}: "{event.title}"
                </span>
              ) : "Fill in match details below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {!hasSelections ? (
              <div className="text-center py-8">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">
                    {isTeamEvent ? "No Teams Available" : "Not Enough Players"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isTeamEvent 
                      ? "Create at least 2 teams and assign players before creating matches."
                      : "At least 2 players need to join this event before creating matches."}
                  </p>
                  <Button variant="outline" onClick={() => navigate(`/events/${eventId}`)}>
                    Go to Event Details
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-semibold">Match Title *</Label>
                  <Input
                    id="title"
                    placeholder="E.g., Quarter-Final 1, Semi-Final Match"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="teamA" className="font-semibold flex items-center gap-2">
                      {isTeamEvent ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      {isTeamEvent ? "Team A *" : "Player A *"}
                    </Label>
                    <Select value={selectedA} onValueChange={setSelectedA}>
                      <SelectTrigger className="h-11 bg-input">
                        <SelectValue placeholder={isTeamEvent ? "Select team" : "Select player"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isTeamEvent ? (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={team.id} disabled={team.id === selectedB}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {team.name} ({team.members.length} members)
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          players.map((player) => (
                            <SelectItem key={player.id} value={player.id} disabled={player.id === selectedB}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {player.userName}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="teamB" className="font-semibold flex items-center gap-2">
                      {isTeamEvent ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      {isTeamEvent ? "Team B *" : "Player B *"}
                    </Label>
                    <Select value={selectedB} onValueChange={setSelectedB}>
                      <SelectTrigger className="h-11 bg-input">
                        <SelectValue placeholder={isTeamEvent ? "Select team" : "Select player"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isTeamEvent ? (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={team.id} disabled={team.id === selectedA}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {team.name} ({team.members.length} members)
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          players.map((player) => (
                            <SelectItem key={player.id} value={player.id} disabled={player.id === selectedA}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {player.userName}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="font-semibold block mb-1">Match Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11 bg-input hover:bg-muted/70",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarInput
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(d) => {
                            if (!event) return d < new Date(new Date().setDate(new Date().getDate() - 1));
                            const eventStart = new Date(new Date(event.startDate).setHours(0, 0, 0, 0));
                            const eventEnd = new Date(new Date(event.endDate).setHours(23, 59, 59, 999));
                            return d < eventStart || d > eventEnd;
                          }}
                          className="p-3 pointer-events-auto bg-card"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="font-semibold">Match Start Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={timeString}
                        onChange={(e) => setTimeString(e.target.value)}
                        required
                        className="h-11 pl-10 bg-input focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Initial Match Status</Label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button
                      type="button"
                      variant={status === "scheduled" ? "default" : "outline"}
                      onClick={() => setStatus("scheduled")}
                      className={`capitalize ${status === "scheduled" ? 'ring-2 ring-primary ring-offset-background' : 'border-gray-300 hover:border-primary'}`}
                    >
                      Scheduled
                    </Button>
                    <Button
                      type="button"
                      variant={status === "ongoing" ? "default" : "outline"}
                      onClick={() => setStatus("ongoing")}
                      className={`capitalize ${status === "ongoing" ? 'ring-2 ring-primary ring-offset-background' : 'border-gray-300 hover:border-primary'}`}
                    >
                      Ongoing
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">You can change this later (e.g., to completed or cancelled).</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="font-semibold">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="E.g., Court 3, Referee: John Smith, any special conditions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold" 
                    disabled={createMatchMutation.isPending}
                  >
                    {createMatchMutation.isPending ? "Creating Match..." : "Create Match"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateMatchPage;
