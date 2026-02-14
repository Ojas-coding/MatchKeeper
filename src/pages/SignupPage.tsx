
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/services/dataService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: () => registerUser(username, name, password),
    onSuccess: (user) => {
      if (user) {
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        toast.error("Registration failed. Username might already be in use.");
      }
    },
    onError: () => {
      toast.error("Registration failed. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !name || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg shadow-xl border-border/60">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 mx-auto">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create Your Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join MatchKeeper and start managing your sports events.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-6 sm:px-8">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-5 px-6 sm:px-8">
            <Button 
              type="submit" 
              className="w-full h-11 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
