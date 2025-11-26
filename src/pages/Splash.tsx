import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-luxury-charcoal flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-charcoal via-luxury-navy to-luxury-slate opacity-50" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className={`relative z-10 text-center transition-all duration-1000 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Logo and icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-luxury-gold opacity-30 animate-pulse" />
            <Plane className="w-20 h-20 text-luxury-gold relative animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="font-luxury text-7xl font-bold text-gradient-gold mb-4 tracking-tight animate-slide-up">
          Travax
        </h1>
        
        <p className="text-muted-foreground text-lg tracking-wide animate-fade-in mt-2">
          AI-Powered Travel • Corporate Discounts • 24/7 Support • Seamless Bookings
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
