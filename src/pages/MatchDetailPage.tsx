import { useQuery } from "@tanstack/react-query";
import { getMatchById, getEventById, getCurrentUser, updateMatchStatus } from "@/services/dataService";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, ArrowLeft, MapPin, Trophy } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MatchStatus } from "@/types";
import { toast } from "sonner";

const MatchDetailPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scoreA, setScoreA] = useState<number | undefined>(undefined);
  const [scoreB, setScoreB] = useState<number | undefined>(undefined);
  
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatchById(matchId || ""),
    enabled: !!matchId,
  });

  // Set scores when match data is loaded
  useEffect(() => {
    if (match) {
      // Convert string scores to numbers, handle undefined
      const convertScore = (score: number | string | undefined): number | undefined => {
        if (score === undefined) return undefined;
        if (typeof score === 'number') return score;
        const parsed = parseInt(score);
        return isNaN(parsed) ? undefined : parsed;
      };
      
      setScoreA(convertScore(match.scoreA));
      setScoreB(convertScore(match.scoreB));
    }
  }, [match]);

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", match?.eventId],
    queryFn: () => getEventById(match?.eventId || ""),
    enabled: !!match?.eventId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { matchId: string, status: MatchStatus, scoreA?: number, scoreB?: number }) => 
      updateMatchStatus(data.matchId, data.status, data.scoreA, data.scoreB),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update match status");
    }
  });

  if (!matchId) {
    return <div>Match ID is missing</div>;
  }

  const handleStatusUpdate = (status: MatchStatus) => {
    if (!match) return;
    
    updateStatusMutation.mutate({
      matchId,
      status,
      scoreA: status === "completed" ? scoreA : undefined,
      scoreB: status === "completed" ? scoreB : undefined
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>

          {isLoadingMatch || isLoadingEvent ? (
            <div>
              <Skeleton className="h-10 w-1/2 mb-2" />
              <Skeleton className="h-5 w-1/4 mb-4" />
              <Skeleton className="h-20 w-full mb-6" />
            </div>
          ) : match && event ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{match.title}</h1>
                <div className="flex items-center mt-2">
                  <StatusBadge status={match.status} className="mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Part of <Link to={`/events/${event.id}`} className="underline hover:text-primary">{event.title}</Link>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/10">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    <span className="font-medium mr-2">Time:</span>
                    {format(new Date(match.startTime), "PPp")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    <span className="font-medium mr-2">Venue:</span>
                    {event.venue}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-center">Match Details</h3>
                
                <div className="flex justify-between items-center mb-8">
                  <div className="text-center flex-1">
                    <p className="text-lg font-semibold mb-2">{match.teamA}</p>
                    {currentUser?.role === "admin" && match.status === "ongoing" ? (
                      <input
                        type="number"
                        min="0"
                        className="w-16 h-16 text-3xl font-bold text-center rounded border"
                        value={scoreA ?? ""}
                        onChange={(e) => setScoreA(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    ) : (
                      <p className="text-4xl font-bold">{match.scoreA ?? "-"}</p>
                    )}
                  </div>
                  <div className="px-4">
                    <div className="text-2xl font-bold">vs</div>
                    {match.status === "completed" && (
                      <div className="mt-2">
                        <Trophy className="h-6 w-6 text-yellow-500 mx-auto" />
                      </div>
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-semibold mb-2">{match.teamB}</p>
                    {currentUser?.role === "admin" && match.status === "ongoing" ? (
                      <input
                        type="number"
                        min="0"
                        className="w-16 h-16 text-3xl font-bold text-center rounded border"
                        value={scoreB ?? ""}
                        onChange={(e) => setScoreB(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    ) : (
                      <p className="text-4xl font-bold">{match.scoreB ?? "-"}</p>
                    )}
                  </div>
                </div>
                
                {match.notes && (
                  <div className="mt-4 p-3 bg-white bg-opacity-70 rounded">
                    <p className="italic text-gray-700">{match.notes}</p>
                  </div>
                )}
              </div>

              {currentUser?.role === "admin" && (
                <div className="border rounded-lg p-4 bg-muted/5">
                  <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {match.status === "scheduled" && (
                      <Button 
                        onClick={() => handleStatusUpdate("ongoing")}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        Start Match
                      </Button>
                    )}
                    {match.status === "ongoing" && (
                      <Button 
                        onClick={() => handleStatusUpdate("completed")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Complete Match
                      </Button>
                    )}
                    {(match.status === "scheduled" || match.status === "ongoing") && (
                      <Button 
                        variant="destructive"
                        onClick={() => handleStatusUpdate("cancelled")}
                      >
                        Cancel Match
                      </Button>
                    )}
                    {match.status === "cancelled" && (
                      <Button 
                        onClick={() => handleStatusUpdate("scheduled")}
                      >
                        Reschedule Match
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Match not found</p>
              <Button asChild className="mt-4">
                <Link to="/matches">View All Matches</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchDetailPage;
