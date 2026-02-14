
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Info, PartyPopper, Users, User } from "lucide-react";
import { toast } from "sonner";
import { EventStatus, SportType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [sport, setSport] = useState<SportType>("basketball");
  const [isTeamEvent, setIsTeamEvent] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      toast.success(
        <div className="flex items-center">
          <PartyPopper className="mr-2 h-5 w-5 text-green-500" />
          Event "{data.title}" created successfully! Join code: {data.joinCode}
        </div>
      );
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create event: ${error.message || "Unknown error"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !venue || !dateRange?.from || !sport) {
      toast.error("Please fill in all required fields", {
        icon: <Info className="mr-2 h-5 w-5 text-yellow-500" />,
      });
      return;
    }
    
    createEventMutation.mutate({
      title,
      description,
      venue,
      startDate: dateRange.from.toISOString(),
      endDate: (dateRange.to || dateRange.from).toISOString(),
      status,
      sport,
      isTeamEvent
    });
  };

  const sportOptions = [
    { value: "basketball", label: "Basketball", icon: "🏀" },
    { value: "american-football", label: "American Football", icon: "🏈" },
    { value: "football", label: "Football (Soccer)", icon: "⚽" },
    { value: "tennis", label: "Tennis", icon: "🎾" },
    { value: "volleyball", label: "Volleyball", icon: "🏐" },
    { value: "cricket", label: "Cricket", icon: "🏏" },
    { value: "boxing", label: "Boxing", icon: "🥊" },
    { value: "swimming", label: "Swimming", icon: "🏊" },
    { value: "golf", label: "Golf", icon: "⛳" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-6 hover:bg-primary/10 hover:border-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto shadow-xl border-border/60">
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create New Event</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Fill in the details below to add a new sports event to the platform. A unique join code will be automatically generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-semibold">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g., Summer Football Championship"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sport" className="font-semibold">Sport Type *</Label>
                <Select value={sport} onValueChange={(value: SportType) => setSport(value)}>
                  <SelectTrigger className="h-11 bg-input">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Event Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label htmlFor="team-event" className="font-semibold flex items-center gap-2">
                    {isTeamEvent ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    Event Format
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isTeamEvent 
                      ? "Team Event: Players will be assigned to teams that compete against each other" 
                      : "Individual Event: Players compete individually against each other"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!isTeamEvent ? 'font-medium' : 'text-muted-foreground'}`}>Individual</span>
                  <Switch
                    id="team-event"
                    checked={isTeamEvent}
                    onCheckedChange={setIsTeamEvent}
                  />
                  <span className={`text-sm ${isTeamEvent ? 'font-medium' : 'text-muted-foreground'}`}>Team</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the event, rules, participants, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                  className="bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="venue" className="font-semibold">Venue / Location *</Label>
                  <Input
                    id="venue"
                    placeholder="E.g., Central City Stadium"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                    className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="font-semibold block mb-1">Event Date(s) *</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select a single date or a date range for multi-day events</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11 bg-input hover:bg-muted/70",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() ? (
                            <>
                              {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                            </>
                          ) : (
                            format(dateRange.from, "PPP")
                          )
                        ) : (
                          <span>Pick date(s)</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarInput
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        initialFocus
                        disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                        className="p-3 pointer-events-auto bg-card"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Initial Event Status</Label>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    type="button"
                    variant={status === "upcoming" ? "default" : "outline"}
                    onClick={() => setStatus("upcoming")}
                    className={`capitalize ${status === "upcoming" ? 'ring-2 ring-primary ring-offset-background' : 'border-gray-300 hover:border-primary'}`}
                  >
                    Upcoming
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
                 <p className="text-xs text-muted-foreground pt-1">You can change the status later (e.g., to completed or cancelled).</p>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEventPage;
