import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { Check, X, Clock, Loader2, User, Calendar, MapPin, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TravelRequest {
  id: string;
  user_id: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  trip_type: string;
  estimated_budget: number;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

interface ApprovalsListProps {
  isApprover?: boolean;
  showOnlyPending?: boolean;
}

export const ApprovalsList = ({ isApprover = false, showOnlyPending = false }: ApprovalsListProps) => {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from("travel_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (showOnlyPending) {
        query = query.eq("status", "pending");
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests((data || []) as TravelRequest[]);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Failed to load requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [showOnlyPending]);

  const handleApprove = async (request: TravelRequest) => {
    setActionLoading(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("travel_requests")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Log the action
      await supabase.from("approval_actions").insert({
        request_id: request.id,
        action_by: user.id,
        action: "approved",
        comment: "Request approved",
      });

      toast({
        title: "Request Approved",
        description: `Travel to ${request.destination} has been approved.`,
      });

      fetchRequests();
    } catch (error: any) {
      console.error("Approve error:", error);
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(selectedRequest.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("travel_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectReason || "No reason provided",
        })
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // Log the action
      await supabase.from("approval_actions").insert({
        request_id: selectedRequest.id,
        action_by: user.id,
        action: "rejected",
        comment: rejectReason || "No reason provided",
      });

      toast({
        title: "Request Rejected",
        description: `Travel to ${selectedRequest.destination} has been rejected.`,
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-600"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTripTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client_visit: "Client Visit",
      conference: "Conference",
      team_onsite: "Team Onsite",
      sales_trip: "Sales Trip",
      training: "Training",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Travel Requests</h3>
          <p className="text-muted-foreground text-sm">
            {isApprover ? "No pending requests to review." : "Submit your first travel request to get started."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const tripDays = differenceInDays(new Date(request.return_date), new Date(request.departure_date)) + 1;
        
        return (
          <Card key={request.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{request.destination}</h3>
                    </div>
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">{getTripTypeLabel(request.trip_type)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(request.departure_date), "MMM d")} - {format(new Date(request.return_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tripDays} day{tripDays > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{request.estimated_budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Submitted {format(new Date(request.created_at), "MMM d")}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{request.purpose}</p>
                </div>

                {isApprover && request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectDialog(true);
                      }}
                      disabled={actionLoading === request.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Travel Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting the travel request to {selectedRequest?.destination}.
            </p>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading !== null}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
