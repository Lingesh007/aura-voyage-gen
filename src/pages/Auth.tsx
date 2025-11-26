import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plane, Mail, Lock, User, Building2, UserCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);

  const handleUserTypeSelect = (type: 'corporate' | 'individual') => {
    localStorage.setItem('userType', type);
    navigate("/dashboard");
  };

  const handleGuestAccess = () => {
    setShowUserTypeSelection(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
        
        setShowUserTypeSelection(true);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        setShowUserTypeSelection(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (showUserTypeSelection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <Card className="w-full max-w-2xl relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-2 pb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-primary opacity-40 animate-pulse" />
                <Plane className="w-12 h-12 text-primary relative" strokeWidth={1.5} />
              </div>
            </div>
            <CardTitle className="text-3xl font-luxury">Choose Your Experience</CardTitle>
            <CardDescription className="text-base">
              Select the account type that best suits your travel needs
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={() => handleUserTypeSelect('corporate')}
              className="w-full h-32 text-lg hover:scale-[1.02] transition-all group"
              variant="outline"
            >
              <div className="flex flex-col items-center gap-3">
                <Building2 className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">Corporate Enterprise</div>
                  <div className="text-sm text-muted-foreground">Team travel management & business discounts</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleUserTypeSelect('individual')}
              className="w-full h-32 text-lg hover:scale-[1.02] transition-all group"
              variant="outline"
            >
              <div className="flex flex-col items-center gap-3">
                <UserCircle className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">Individual Traveler</div>
                  <div className="text-sm text-muted-foreground">Personal trips & exclusive travel offers</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary opacity-40 animate-pulse" />
              <Plane className="w-10 h-10 text-primary relative" strokeWidth={1.5} />
            </div>
          </div>
          <CardTitle className="text-2xl font-luxury">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your travel dashboard"
              : "Join Travax for seamless travel management"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGuestAccess}
            className="w-full"
          >
            Continue as Guest
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
