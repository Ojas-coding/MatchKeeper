
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Event } from "@/types";
import StatusBadge from "./StatusBadge";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  const formatDateRange = () => {
    if (isSameDay) {
      return format(startDate, 'PPP');
    }
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };
  
  return (
    <Card className="overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 flex flex-col h-full bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors leading-tight">{event.title}</CardTitle>
          <StatusBadge status={event.status} />
        </div>
        {event.joinCode && (
          <div className="flex items-center text-xs text-accent font-medium mt-2 bg-accent/10 px-2 py-1 rounded-md w-fit">
            <Star className="h-3 w-3 mr-1" />
            Join Code Available
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {event.description || "No description available."}
        </p>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <Calendar className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
            <span className="font-medium">{formatDateRange()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <MapPin className="h-4 w-4 mr-3 flex-shrink-0 text-secondary" />
            <span className="truncate font-medium" title={event.venue}>{event.venue}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 mt-auto">
        <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
