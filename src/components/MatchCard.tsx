
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Match } from "@/types";
import StatusBadge from "./StatusBadge";

interface MatchCardProps {
  match: Match;
  showEventLink?: boolean;
  eventName?: string; 
}

const MatchCard = ({ match, showEventLink = false, eventName }: MatchCardProps) => {
  const matchTime = new Date(match.startTime);
  
  return (
    <Card className="overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-secondary/10 hover:border-secondary/30 hover:-translate-y-1 flex flex-col h-full bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-3 bg-gradient-to-r from-secondary/5 to-accent/5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg leading-tight group-hover:text-secondary transition-colors">{match.title}</CardTitle>
          <StatusBadge status={match.status} />
        </div>
        {eventName && showEventLink && (
          <div className="text-xs text-muted-foreground mt-1.5 flex items-center bg-primary/10 px-2 py-1 rounded-md">
            <Trophy className="h-3 w-3 mr-1.5 flex-shrink-0 text-primary" />
            <span>Event: <Link to={`/events/${match.eventId}`} className="underline hover:text-primary font-medium">{eventName}</Link></span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-muted/20 to-muted/10 p-4 rounded-lg">
          <div className="text-center flex-1 min-w-0">
            <p className="font-semibold truncate mb-1" title={match.teamA}>{match.teamA}</p>
            {match.scoreA !== undefined && <p className="text-2xl font-bold text-primary">{match.scoreA}</p>}
          </div>
          <div className="px-3 text-lg font-bold text-muted-foreground bg-background rounded-full p-2">
            VS
          </div>
          <div className="text-center flex-1 min-w-0">
            <p className="font-semibold truncate mb-1" title={match.teamB}>{match.teamB}</p>
            {match.scoreB !== undefined && <p className="text-2xl font-bold text-secondary">{match.scoreB}</p>}
          </div>
        </div>
        <div className="flex items-center justify-center text-sm text-muted-foreground mb-2 bg-muted/20 p-2 rounded-md">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />
          <span className="font-medium">{format(matchTime, 'PPp')}</span>
        </div>
        {match.notes && (
          <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2 bg-accent/10 p-2 rounded-md" title={match.notes}>
            {match.notes}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 mt-auto">
        <Button asChild className="w-full group-hover:bg-secondary/90 transition-colors">
          <Link to={`/matches/${match.id}`}>View Match Details</Link>
        </Button>
        {showEventLink && !eventName && match.eventId && ( 
          <Button variant="outline" asChild className="w-full hover:bg-primary/10 hover:border-primary">
            <Link to={`/events/${match.eventId}`}>View Event</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
