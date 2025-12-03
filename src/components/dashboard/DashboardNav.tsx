import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CheckSquare, 
  Bot, 
  User, 
  LogOut,
  Menu
} from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardNavProps {
  userName: string;
  userType: 'corporate' | 'individual';
  onOpenAgent: () => void;
}

const DashboardNav = ({ userName, userType, onOpenAgent }: DashboardNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = userType === 'corporate' 
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Briefcase, label: "Trips", path: "/dashboard?tab=trips" },
        { icon: Users, label: "Teams", path: "/dashboard?tab=teams" },
        { icon: CheckSquare, label: "Approvals", path: "/dashboard?tab=approvals" },
      ]
    : [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Briefcase, label: "My Trips", path: "/dashboard?tab=trips" },
        { icon: User, label: "Profile", path: "/profile" },
      ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant={location.pathname === item.path ? "secondary" : "ghost"}
          size="sm"
          onClick={() => navigate(item.path)}
          className="gap-2"
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenAgent}
        className="gap-2 text-primary hover:text-primary"
      >
        <Bot className="w-4 h-4" />
        AI Assistant
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Plane className="w-7 h-7 text-primary" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-primary">Travax</h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Welcome, {userName.split(' ')[0]}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLinks />
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="hidden md:flex"
            >
              <User className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden md:flex"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="border-t pt-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/profile")}
                      className="w-full justify-start gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;
