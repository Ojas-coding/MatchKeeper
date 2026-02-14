import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAnnouncement } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateAnnouncementDialogProps {
  eventId: string;
  eventTitle: string;
}

const CreateAnnouncementDialog = ({ eventId, eventTitle }: CreateAnnouncementDialogProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const createMutation = useMutation({
    mutationFn: () => createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      eventId,
      eventTitle,
      priority
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["eventAnnouncements", eventId] });
      toast.success("Announcement posted! All participants have been notified.");
      setTitle("");
      setContent("");
      setPriority('medium');
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to post announcement");
    }
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter the announcement content");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Megaphone className="h-4 w-4 mr-2" />
          Post Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Megaphone className="h-5 w-5 mr-2 text-primary" />
            Post Announcement
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              placeholder="Announcement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-content">Message</Label>
            <Textarea
              id="announcement-content"
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}/1000</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General information</SelectItem>
                <SelectItem value="medium">Medium - Important update</SelectItem>
                <SelectItem value="high">High - Urgent attention needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            This announcement will be sent to all participants of "{eventTitle}" and appear in their alerts.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Post Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAnnouncementDialog;
