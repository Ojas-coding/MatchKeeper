
import { useQuery } from "@tanstack/react-query";
import { getEvents, getCurrentUser } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import EventsHero from "@/components/EventsHero";
import JoinEventSection from "@/components/JoinEventSection";
import EventsFilters from "@/components/EventsFilters";
import EventsGrid from "@/components/EventsGrid";
import { useState } from "react";
import { EventStatus } from "@/types";

const EventsPage = () => {
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const filteredEvents = events?.filter(event => {
    const statusMatch = statusFilter === "all" || event.status === statusFilter;
    const searchMatch = searchTerm === "" || 
                        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  }) || [];

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <MainNav />
      
      <EventsHero 
        eventsCount={events?.length || 0}
        isAdmin={currentUser?.role === "admin"}
      />

      <main className="flex-1 container py-8">
        <JoinEventSection />
        
        <EventsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        
        <EventsGrid
          isLoading={isLoading}
          filteredEvents={filteredEvents}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearFilters={handleClearFilters}
        />
      </main>
    </div>
  );
};

export default EventsPage;
