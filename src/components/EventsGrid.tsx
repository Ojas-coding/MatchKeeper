
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { Event } from "@/types";
import EventCard from "./EventCard";

interface EventsGridProps {
  isLoading: boolean;
  filteredEvents: Event[];
  searchTerm: string;
  statusFilter: string;
  onClearFilters: () => void;
}

const EventsGrid = ({ isLoading, filteredEvents, searchTerm, statusFilter, onClearFilters }: EventsGridProps) => {
  const CardSkeleton = () => (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-full mt-2" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (filteredEvents.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl bg-card">
      <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
        <Filter className="h-12 w-12 text-primary" />
      </div>
      <p className="text-xl font-semibold text-foreground">No Events Found</p>
      <p className="text-muted-foreground mt-1 mb-6">
        Try adjusting your search or filters to find events.
      </p>
      {(searchTerm || statusFilter !== "all") && (
        <Button 
          variant="outline" 
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default EventsGrid;
