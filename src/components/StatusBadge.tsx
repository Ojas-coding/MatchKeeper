
import { cn } from "@/lib/utils";
import { EventStatus, MatchStatus } from "@/types";

interface StatusBadgeProps {
  status: EventStatus | MatchStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusClass = (status: EventStatus | MatchStatus) => {
    switch (status) {
      case "upcoming":
      case "scheduled":
        return "status-scheduled";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        getStatusClass(status),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
