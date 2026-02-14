
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestToJoinEvent } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Star, Info, UserCheck } from "lucide-react";
import { toast } from "sonner";

const JoinEventSection = () => {
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<'player' | 'coach' | 'admin'>('player');

  const joinEventMutation = useMutation({
    mutationFn: ({ joinCode, role }: { joinCode: string; role: 'player' | 'coach' | 'admin' }) => 
      requestToJoinEvent(joinCode, role),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message, {
          icon: <Star className="mr-2 h-5 w-5 text-yellow-500" />
        });
        setJoinCodeInput("");
        setSelectedRole('player');
      } else {
        toast.error(result.message, {
          icon: <Info className="mr-2 h-5 w-5 text-red-500" />
        });
      }
    },
    onError: () => {
      toast.error("Failed to process join request. Please try again.");
    }
  });

  const handleJoinEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      toast.warning("Please enter a join code.");
      return;
    }
    joinEventMutation.mutate({ 
      joinCode: joinCodeInput.trim().toUpperCase(), 
      role: selectedRole 
    });
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-accent/10 to-orange-100 border border-accent/20 rounded-xl shadow-sm">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-accent/20 rounded-lg mr-3">
          <LogIn className="h-6 w-6 text-accent" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Join an Event</h2>
      </div>
      <p className="text-muted-foreground mb-4">Have a join code? Enter it below and select your role to request access to an event.</p>
      <form onSubmit={handleJoinEvent} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Enter join code (e.g., SUMMERFUN24)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="h-12 text-lg border-accent/30 focus:border-accent"
              disabled={joinEventMutation.isPending}
            />
          </div>
          <div className="min-w-[140px]">
            <Select 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as 'player' | 'coach' | 'admin')} 
              disabled={joinEventMutation.isPending}
            >
              <SelectTrigger className="h-12 border-accent/30">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">
                  <div className="flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Player
                  </div>
                </SelectItem>
                <SelectItem value="coach">
                  <div className="flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Coach
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 px-8 bg-accent hover:bg-accent/90"
          disabled={joinEventMutation.isPending}
        >
          {joinEventMutation.isPending ? "Requesting..." : `Request to Join as ${selectedRole}`}
        </Button>
      </form>
    </div>
  );
};

export default JoinEventSection;
