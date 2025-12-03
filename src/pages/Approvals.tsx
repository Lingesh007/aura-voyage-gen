import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TravelRequestForm } from "@/components/approvals/TravelRequestForm";
import { ApprovalsList } from "@/components/approvals/ApprovalsList";
import { supabase } from "@/integrations/supabase/client";

const Approvals = () => {
  const navigate = useNavigate();
  const [isApprover, setIsApprover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        // Check if user is manager or admin
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const userRoles = roles?.map(r => r.role) || [];
        setIsApprover(userRoles.includes("manager") || userRoles.includes("admin"));
      } catch (error) {
        console.error("Role check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [navigate]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Travel Approvals</h1>
              <p className="text-sm text-muted-foreground">
                {isApprover ? "Review and manage team travel requests" : "Submit and track your travel requests"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isApprover && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Approver</span>
              </div>
            )}
            <TravelRequestForm onSuccess={handleRefresh} />
          </div>
        </div>

        <Tabs defaultValue={isApprover ? "pending" : "my-requests"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {isApprover && (
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending Approval
              </TabsTrigger>
            )}
            <TabsTrigger value="my-requests" className="gap-2">
              <Check className="w-4 h-4" />
              My Requests
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              All Requests
            </TabsTrigger>
          </TabsList>

          {isApprover && (
            <TabsContent value="pending">
              <ApprovalsList key={`pending-${refreshKey}`} isApprover={true} showOnlyPending={true} />
            </TabsContent>
          )}

          <TabsContent value="my-requests">
            <ApprovalsList key={`my-${refreshKey}`} isApprover={false} />
          </TabsContent>

          <TabsContent value="all">
            <ApprovalsList key={`all-${refreshKey}`} isApprover={isApprover} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Approvals;
