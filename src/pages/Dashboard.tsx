import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CorporateDashboard from "./CorporateDashboard";
import IndividualDashboard from "./IndividualDashboard";

interface DashboardProps {
  onOpenAgent: () => void;
}

const Dashboard = ({ onOpenAgent }: DashboardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'corporate' | 'individual' | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const storedUserType = localStorage.getItem('userType');
        if (!storedUserType) {
          navigate("/auth");
          return;
        }
        setUserType(storedUserType as 'corporate' | 'individual');
      } else {
        setUser(session.user);
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType as 'corporate' | 'individual' || 'individual');
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem('userType');
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!userType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (userType === 'corporate') {
    return <CorporateDashboard onOpenAgent={onOpenAgent} user={user} />;
  }

  return <IndividualDashboard onOpenAgent={onOpenAgent} user={user} />;
};

export default Dashboard;
