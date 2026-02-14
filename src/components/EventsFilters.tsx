
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { EventStatus } from "@/types";

interface EventsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: EventStatus | "all";
  setStatusFilter: (status: EventStatus | "all") => void;
}

const EventsFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: EventsFiltersProps) => {
  return (
    <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Search Events
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
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
            {(["all", "upcoming", "ongoing", "completed", "cancelled"] as const).map(status => (
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
  );
};

export default EventsFilters;
