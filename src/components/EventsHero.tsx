
import { Button } from "@/components/ui/button";
import { Trophy, Users, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EventsHeroProps {
  eventsCount: number;
  isAdmin: boolean;
}

const EventsHero = ({ eventsCount, isAdmin }: EventsHeroProps) => {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-secondary/80 text-white py-12">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold tracking-tight mb-4 flex items-center justify-center lg:justify-start">
              <Trophy className="mr-4 h-12 w-12 text-yellow-300" />
              Sports Events Hub
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Discover exciting sports events, join competitions, and connect with fellow athletes in your community.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-6 text-sm">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-yellow-300" />
                <span>{eventsCount} Active Events</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-yellow-300" />
                <span>Multiple Venues</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg">
              <Link to="/admin/events/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsHero;
