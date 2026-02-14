
import { useQuery } from "@tanstack/react-query";
import { getAnnouncements, getCurrentUser } from "@/services/dataService";
import MainNav from "@/components/MainNav";
import AnnouncementsSection from "@/components/AnnouncementsSection";

const AnnouncementsPage = () => {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <MainNav />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-2">Stay updated with the latest announcements from your events.</p>
        </div>
        
        <AnnouncementsSection />
      </main>
    </div>
  );
};

export default AnnouncementsPage;
