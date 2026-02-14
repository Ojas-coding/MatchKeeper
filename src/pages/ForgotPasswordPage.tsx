
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/dataService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset instructions sent to your email!");
      setSubmitted(true);
    },
    onError: (error: any) => { // Added type for error
      const errorMessage = error?.message || "Failed to process password reset. Please try again.";
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    resetMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-accent/10 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 mx-auto">
            <Key className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Reset Your Password</CardTitle>
          {!submitted && (
            <CardDescription className="text-muted-foreground">
              Enter your email to receive password reset instructions.
            </CardDescription>
          )}
        </CardHeader>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 sm:px-8">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-5 px-6 sm:px-8">
              <Button 
                type="submit" 
                className="w-full h-11 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <div className="mt-2">
                <Link to="/login" className="text-sm text-primary hover:underline hover:text-primary/80 flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 text-center px-6 sm:px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <MailCheck className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg text-foreground">
              Instructions Sent!
            </p>
            <p className="text-muted-foreground">
              Please check your email inbox (and spam folder) for instructions on how to reset your password.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Link to="/login" className="flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
