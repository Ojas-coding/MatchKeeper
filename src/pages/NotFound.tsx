
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-destructive/5 to-background text-center p-4">
      <AlertTriangle className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-6xl font-extrabold text-foreground tracking-tight mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-foreground mb-3">Oops! Page Not Found.</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button asChild size="lg">
        <Link to="/" className="flex items-center">
          <Home className="mr-2 h-5 w-5" />
          Return to Homepage
        </Link>
      </Button>
      <p className="mt-12 text-sm text-muted-foreground">
        Attempted path: <code className="bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code>
      </p>
    </div>
  );
};

export default NotFound;
