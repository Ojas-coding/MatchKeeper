import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventTeams, getEventParticipants, createTeam, assignParticipantToTeam } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Team, EventParticipant } from "@/types";

interface TeamManagementProps {
  eventId: string;
  isAdmin: boolean;
}

const TeamManagement = ({ eventId, isAdmin }: TeamManagementProps) => {
  const queryClient = useQueryClient();
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["eventTeams", eventId],
    queryFn: () => getEventTeams(eventId),
  });

  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["eventParticipants", eventId],
    queryFn: () => getEventParticipants(eventId),
  });

  const createTeamMutation = useMutation({
    mutationFn: (teamName: string) => createTeam(eventId, teamName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventTeams", eventId] });
      toast.success("Team created successfully!");
      setNewTeamName("");
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create team");
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ participantId, teamId }: { participantId: string; teamId: string }) => 
      assignParticipantToTeam(eventId, participantId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventTeams", eventId] });
      queryClient.invalidateQueries({ queryKey: ["eventParticipants", eventId] });
      toast.success("Participant assigned to team!");
      setSelectedParticipant("");
      setSelectedTeam("");
    },
    onError: () => {
      toast.error("Failed to assign participant");
    }
  });

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    createTeamMutation.mutate(newTeamName.trim());
  };

  const handleAssignParticipant = () => {
    if (!selectedParticipant || !selectedTeam) {
      toast.error("Please select both a participant and a team");
      return;
    }
    assignMutation.mutate({ participantId: selectedParticipant, teamId: selectedTeam });
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId)?.name || "Unknown Team";
  };

  const unassignedParticipants = participants.filter(p => !p.teamId);
  const players = participants.filter(p => p.role === 'player');

  if (teamsLoading || participantsLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Team Management
          </CardTitle>
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="Enter team name..."
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teams List */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamMembers = participants.filter(p => p.teamId === team.id);
              return (
                <div key={team.id} className="p-4 border rounded-lg bg-card">
                  <h4 className="font-semibold text-foreground mb-2">{team.name}</h4>
                  <div className="space-y-1">
                    {teamMembers.length > 0 ? (
                      teamMembers.map(member => (
                        <div key={member.id} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{member.userName}</span>
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No members yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed rounded-lg">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No teams created yet</p>
            {isAdmin && <p className="text-sm text-muted-foreground">Create a team to get started</p>}
          </div>
        )}

        {/* Assign Participant Section */}
        {isAdmin && teams.length > 0 && players.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Player to Team
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a player..." />
                </SelectTrigger>
                <SelectContent>
                  {players.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.userName} {p.teamId ? `(${getTeamName(p.teamId)})` : "(Unassigned)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAssignParticipant} 
                disabled={!selectedParticipant || !selectedTeam || assignMutation.isPending}
              >
                {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign
              </Button>
            </div>
            {unassignedParticipants.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {unassignedParticipants.length} unassigned participant{unassignedParticipants.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Participants without team assignment available */}
        {players.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players have joined this event yet. Players need to join before you can assign them to teams.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamManagement;
