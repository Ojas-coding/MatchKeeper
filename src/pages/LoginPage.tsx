
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "@/services/dataService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogIn } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const from = location.state?.from?.pathname || "/";

  const loginMutation = useMutation({
    mutationFn: () => loginUser(username, password),
    onSuccess: (user) => {
      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        queryClient.setQueryData(["currentUser"], user);
        navigate(from, { replace: true });
      } else {
        toast.error("Invalid username or password");
      }
    },
    onError: () => {
      toast.error("Login failed. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 mx-auto shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">MatchKeeper</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage your sports matches seamlessly.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 text-base bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                "Signing in..." 
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Sign In
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
