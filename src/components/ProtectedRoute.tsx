
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both "admin" and "host" to access admin routes
  if (requiredRoles && requiredRoles.includes("admin")) {
    if (user.role !== "admin" && user.role !== "host") {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
