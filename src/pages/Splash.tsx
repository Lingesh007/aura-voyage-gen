import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Splash = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setShow(true);
    
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className={`relative z-10 text-center transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Logo and icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary opacity-30 animate-pulse" />
            <Plane className="w-20 h-20 text-primary relative animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="font-luxury text-7xl font-bold text-gradient-pastel mb-4 tracking-tight animate-slide-up">
          Travax
        </h1>
        
        <p className="text-muted-foreground text-lg tracking-wide animate-fade-in mt-2">
          AI-Powered Travel • Corporate Discounts • 24/7 Support • Seamless Bookings
        </p>

        {/* Dynamic loading bar */}
        <div className="mt-12 w-64 mx-auto">
          <Progress value={progress} className="h-2 bg-muted" />
          <p className="text-xs text-muted-foreground mt-2">Loading experience... {progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Splash;
