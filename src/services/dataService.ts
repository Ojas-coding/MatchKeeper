import { Event, Match, MatchStatus, User, JoinRequest, Announcement, Alert, Team, EventParticipant } from "@/types";
import { mockEvents, mockMatches, mockUsers } from "./mockData";

let loggedInUser: User | null = null;
let mockAnnouncements: Announcement[] = [];
let mockAlerts: Alert[] = [];

// Helper function to generate a strong random join code
const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Authentication Services
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (user) {
        loggedInUser = user;
      }
      resolve(user || null);
    }, 500);
  });
};

export const logoutUser = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      loggedInUser = null;
      resolve();
    }, 300);
  });
};

export const registerUser = async (
  username: string,
  name: string, 
  password: string
): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUser) {
        resolve(null);
        return;
      }

      const newUser: User = {
        id: `user${mockUsers.length + 1}`,
        username,
        name,
        role: 'admin'
      };

      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const resetPassword = async (username: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      resolve(!!existingUser);
    }, 800);
  });
};

// User Management
export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loggedInUser);
    }, 300);
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 500);
  });
};

// Events Management
export const getEvents = async (): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockEvents]);
    }, 500);
  });
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === eventId) || null;
      resolve(event);
    }, 300);
  });
};

export const getEventByJoinCode = async (joinCode: string): Promise<Event | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.joinCode?.toLowerCase() === joinCode.toLowerCase()) || null;
      resolve(event);
    }, 300);
  });
};

export const requestToJoinEvent = async (joinCode: string, requestedRole: 'player' | 'coach' | 'admin'): Promise<{ success: boolean; message: string; eventTitle?: string }> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    if (!user) {
      resolve({ success: false, message: "You must be logged in to join an event." });
      return;
    }

    setTimeout(() => {
      const event = mockEvents.find(e => e.joinCode?.toLowerCase() === joinCode.toLowerCase());
      if (!event) {
        resolve({ success: false, message: "Invalid join code. Please check and try again." });
        return;
      }

      if (!event.pendingRequests) {
        event.pendingRequests = [];
      }

      const existingRequest = event.pendingRequests.find(r => r.userId === user.id);
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          resolve({ success: false, message: "You already have a pending request for this event." });
        } else if (existingRequest.status === 'approved') {
          resolve({ success: false, message: "You are already part of this event." });
        } else {
          resolve({ success: false, message: "Your previous request was rejected." });
        }
        return;
      }

      const newRequest: JoinRequest = {
        id: `req${Date.now()}`,
        userId: user.id,
        userName: user.name,
        eventId: event.id,
        requestedRole,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      event.pendingRequests.push(newRequest);
      resolve({ 
        success: true, 
        message: `Join request sent for "${event.title}" as ${requestedRole}. Please wait for approval from the event organizer.`,
        eventTitle: event.title
      });
    }, 500);
  });
};

export const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'createdBy' | 'joinCode'>): Promise<Event> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    
    let joinCode = generateJoinCode();
    while (mockEvents.some(e => e.joinCode === joinCode)) {
      joinCode = generateJoinCode();
    }
    
    const newEvent: Event = {
      ...event,
      id: `evt${mockEvents.length + 1}`,
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
      joinCode,
      pendingRequests: [],
      participants: [],
      teams: [],
      announcements: [],
      sport: event.sport || 'basketball',
      startDate: event.startDate,
      endDate: event.endDate,
      isTeamEvent: event.isTeamEvent || false,
    };
    
    setTimeout(() => {
      mockEvents.push(newEvent);
      resolve(newEvent);
    }, 500);
  });
};

// Team Management
export const createTeam = async (eventId: string, teamName: string): Promise<Team> => {
  return new Promise((resolve) => {
    const event = mockEvents.find(e => e.id === eventId);
    
    const newTeam: Team = {
      id: `team${Date.now()}`,
      name: teamName,
      eventId,
      members: [],
      createdAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      if (event) {
        if (!event.teams) {
          event.teams = [];
        }
        event.teams.push(newTeam);
      }
      resolve(newTeam);
    }, 300);
  });
};

export const assignParticipantToTeam = async (eventId: string, participantId: string, teamId: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const event = mockEvents.find(e => e.id === eventId);
    const user = await getCurrentUser();
    
    if (!event || !event.participants) {
      resolve(false);
      return;
    }
    
    const participant = event.participants.find(p => p.id === participantId);
    const team = event.teams?.find(t => t.id === teamId);
    
    if (!participant || !team) {
      resolve(false);
      return;
    }
    
    // Remove from old team if any
    if (participant.teamId) {
      const oldTeam = event.teams?.find(t => t.id === participant.teamId);
      if (oldTeam) {
        oldTeam.members = oldTeam.members.filter(m => m !== participantId);
      }
    }
    
    participant.teamId = teamId;
    team.members.push(participantId);
    
    // Create alert for the participant
    const alert: Alert = {
      id: `alert${Date.now()}`,
      userId: participant.userId,
      type: 'team_assigned',
      title: 'Team Assignment',
      message: `You have been assigned to team "${team.name}" for event "${event.title}"`,
      eventId: event.id,
      eventTitle: event.title,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    mockAlerts.push(alert);
    
    resolve(true);
  });
};

export const getEventTeams = async (eventId: string): Promise<Team[]> => {
  return new Promise((resolve) => {
    const event = mockEvents.find(e => e.id === eventId);
    setTimeout(() => {
      resolve(event?.teams || []);
    }, 300);
  });
};

export const getEventParticipants = async (eventId: string): Promise<EventParticipant[]> => {
  return new Promise((resolve) => {
    const event = mockEvents.find(e => e.id === eventId);
    setTimeout(() => {
      resolve(event?.participants || []);
    }, 300);
  });
};

// Alerts Management
export const getAlerts = async (): Promise<Alert[]> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    setTimeout(() => {
      const userAlerts = user ? mockAlerts.filter(a => a.userId === user.id) : [];
      resolve(userAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 300);
  });
};

export const getUnreadAlertsCount = async (): Promise<number> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    setTimeout(() => {
      const count = user ? mockAlerts.filter(a => a.userId === user.id && !a.isRead).length : 0;
      resolve(count);
    }, 200);
  });
};

export const markAlertAsRead = async (alertId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
    setTimeout(() => resolve(!!alert), 200);
  });
};

export const markAllAlertsAsRead = async (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    if (user) {
      mockAlerts.forEach(a => {
        if (a.userId === user.id) {
          a.isRead = true;
        }
      });
    }
    setTimeout(() => resolve(true), 200);
  });
};

export const createAlertForParticipants = async (
  eventId: string,
  type: Alert['type'],
  title: string,
  message: string,
  matchId?: string,
  announcementId?: string
): Promise<void> => {
  return new Promise((resolve) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event || !event.participants) {
      resolve();
      return;
    }
    
    event.participants.forEach(participant => {
      const alert: Alert = {
        id: `alert${Date.now()}-${participant.userId}`,
        userId: participant.userId,
        type,
        title,
        message,
        eventId,
        eventTitle: event.title,
        matchId,
        announcementId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      mockAlerts.push(alert);
    });
    
    setTimeout(() => resolve(), 300);
  });
};

// Announcements Management
export const getAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockAnnouncements]);
    }, 300);
  });
};

export const getAnnouncementsByEventId = async (eventId: string): Promise<Announcement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const announcements = mockAnnouncements.filter(a => a.eventId === eventId);
      resolve(announcements);
    }, 300);
  });
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>): Promise<Announcement> => {
  return new Promise(async (resolve) => {
    const user = await getCurrentUser();
    const event = mockEvents.find(e => e.id === announcement.eventId);
    
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `ann${mockAnnouncements.length + 1}`,
      createdBy: user?.id || 'unknown',
      createdByName: user?.name || 'Unknown',
      eventTitle: event?.title || 'Unknown Event',
      createdAt: new Date().toISOString(),
    };
    
    setTimeout(async () => {
      mockAnnouncements.push(newAnnouncement);
      if (event) {
        if (!event.announcements) {
          event.announcements = [];
        }
        event.announcements.push(newAnnouncement);
        
        // Create alerts for all participants
        await createAlertForParticipants(
          event.id,
          'announcement',
          `New Announcement: ${newAnnouncement.title}`,
          newAnnouncement.content.substring(0, 100) + (newAnnouncement.content.length > 100 ? '...' : ''),
          undefined,
          newAnnouncement.id
        );
      }
      resolve(newAnnouncement);
    }, 500);
  });
};

// Matches Management
export const getMatches = async (): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockMatches]);
    }, 500);
  });
};

export const getMatchesByEventId = async (eventId: string): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches = mockMatches.filter(m => m.eventId === eventId);
      resolve(matches);
    }, 300);
  });
};

export const getMatchById = async (matchId: string): Promise<Match | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = mockMatches.find(m => m.id === matchId) || null;
      resolve(match);
    }, 300);
  });
};

export const createMatch = async (match: Omit<Match, 'id'>): Promise<Match> => {
  const newMatch: Match = {
    ...match,
    id: `match${mockMatches.length + 1}`,
    sport: match.sport || 'basketball',
  };
  
  return new Promise(async (resolve) => {
    const event = mockEvents.find(e => e.id === match.eventId);
    
    setTimeout(async () => {
      mockMatches.push(newMatch);
      
      // Create alerts for participants involved in the match
      if (event) {
        // Alert for team/player A
        if (match.playerAId) {
          const participantA = event.participants?.find(p => p.id === match.playerAId);
          if (participantA) {
            const alertA: Alert = {
              id: `alert${Date.now()}-a`,
              userId: participantA.userId,
              type: 'match_upcoming',
              title: 'New Match Scheduled',
              message: `You have a match: "${newMatch.title}" vs ${newMatch.teamB}`,
              eventId: event.id,
              eventTitle: event.title,
              matchId: newMatch.id,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            mockAlerts.push(alertA);
          }
        }
        
        // Alert for team/player B
        if (match.playerBId) {
          const participantB = event.participants?.find(p => p.id === match.playerBId);
          if (participantB) {
            const alertB: Alert = {
              id: `alert${Date.now()}-b`,
              userId: participantB.userId,
              type: 'match_upcoming',
              title: 'New Match Scheduled',
              message: `You have a match: "${newMatch.title}" vs ${newMatch.teamA}`,
              eventId: event.id,
              eventTitle: event.title,
              matchId: newMatch.id,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            mockAlerts.push(alertB);
          }
        }
        
        // For team events, alert all team members
        if (match.teamAId) {
          const teamA = event.teams?.find(t => t.id === match.teamAId);
          if (teamA) {
            teamA.members.forEach(memberId => {
              const participant = event.participants?.find(p => p.id === memberId);
              if (participant) {
                const alert: Alert = {
                  id: `alert${Date.now()}-ta-${memberId}`,
                  userId: participant.userId,
                  type: 'match_upcoming',
                  title: 'New Team Match Scheduled',
                  message: `Your team "${teamA.name}" has a match: "${newMatch.title}" vs ${newMatch.teamB}`,
                  eventId: event.id,
                  eventTitle: event.title,
                  matchId: newMatch.id,
                  isRead: false,
                  createdAt: new Date().toISOString()
                };
                mockAlerts.push(alert);
              }
            });
          }
        }
        
        if (match.teamBId) {
          const teamB = event.teams?.find(t => t.id === match.teamBId);
          if (teamB) {
            teamB.members.forEach(memberId => {
              const participant = event.participants?.find(p => p.id === memberId);
              if (participant) {
                const alert: Alert = {
                  id: `alert${Date.now()}-tb-${memberId}`,
                  userId: participant.userId,
                  type: 'match_upcoming',
                  title: 'New Team Match Scheduled',
                  message: `Your team "${teamB.name}" has a match: "${newMatch.title}" vs ${newMatch.teamA}`,
                  eventId: event.id,
                  eventTitle: event.title,
                  matchId: newMatch.id,
                  isRead: false,
                  createdAt: new Date().toISOString()
                };
                mockAlerts.push(alert);
              }
            });
          }
        }
      }
      
      resolve(newMatch);
    }, 500);
  });
};

export const updateMatchStatus = async (matchId: string, status: MatchStatus, scoreA?: number, scoreB?: number): Promise<Match | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matchIndex = mockMatches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) {
        resolve(null);
        return;
      }

      const updatedMatch = {
        ...mockMatches[matchIndex],
        status,
        ...(scoreA !== undefined && { scoreA }),
        ...(scoreB !== undefined && { scoreB }),
        ...(status === 'completed' && { endTime: new Date().toISOString() })
      };
      
      mockMatches[matchIndex] = updatedMatch;
      resolve(updatedMatch);
    }, 500);
  });
};
