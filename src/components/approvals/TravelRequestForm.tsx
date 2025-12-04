import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TravelRequestFormProps {
  onSuccess?: () => void;
}

export const TravelRequestForm = ({ onSuccess }: TravelRequestFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [purpose, setPurpose] = useState("");
  const [tripType, setTripType] = useState("client_visit");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !departureDate || !returnDate || !purpose || !estimatedBudget) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("travel_requests").insert({
        user_id: user.id,
        destination,
        departure_date: format(departureDate, "yyyy-MM-dd"),
        return_date: format(returnDate, "yyyy-MM-dd"),
        purpose,
        trip_type: tripType,
        estimated_budget: parseFloat(estimatedBudget),
        notes: notes || null,
      });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('travel-notifications', {
          body: {
            type: 'submitted',
            recipientEmail: user.email,
            recipientName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Traveler',
            requestDetails: {
              destination,
              departureDate: format(departureDate, "yyyy-MM-dd"),
              returnDate: format(returnDate, "yyyy-MM-dd"),
              purpose,
              estimatedBudget: parseFloat(estimatedBudget)
            }
          }
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the request if email fails
      }

      toast({
        title: "Request Submitted",
        description: "Your travel request has been sent for approval.",
      });

      // Reset form
      setDestination("");
      setDepartureDate(undefined);
      setReturnDate(undefined);
      setPurpose("");
      setTripType("client_visit");
      setEstimatedBudget("");
      setNotes("");
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit travel request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="w-4 h-4" />
          New Travel Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Travel Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              placeholder="e.g., Dubai, UAE"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Return Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    disabled={(date) => date < (departureDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tripType">Trip Type *</Label>
            <Select value={tripType} onValueChange={setTripType}>
              <SelectTrigger>
                <SelectValue placeholder="Select trip type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_visit">Client Visit</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="team_onsite">Team Onsite</SelectItem>
                <SelectItem value="sales_trip">Sales Trip</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the business purpose of this trip..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget (₹) *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 50000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
