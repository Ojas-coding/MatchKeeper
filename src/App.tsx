
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import MatchesPage from "./pages/MatchesPage";
import MatchDetailPage from "./pages/MatchDetailPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AlertsPage from "./pages/AlertsPage";
import AdminPage from "./pages/AdminPage";
import CreateEventPage from "./pages/CreateEventPage";
import CreateMatchPage from "./pages/CreateMatchPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Routes that require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:matchId" element={<MatchDetailPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Route>
            
            {/* Routes that require admin role */}
            <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/events/create" element={<CreateEventPage />} />
              <Route path="/admin/events/:eventId/matches/create" element={<CreateMatchPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
