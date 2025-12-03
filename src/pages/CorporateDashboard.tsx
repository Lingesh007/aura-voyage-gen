import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Users, 
  Clock, 
  FileCheck, 
  Calendar,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import { BookingHistory } from "@/components/BookingHistory";
import DashboardNav from "@/components/dashboard/DashboardNav";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActions from "@/components/dashboard/QuickActions";
import AISearchBar from "@/components/dashboard/AISearchBar";
import CorporateMetrics from "@/components/dashboard/CorporateMetrics";

interface CorporateDashboardProps {
  onOpenAgent: () => void;
  user: any;
}

const CorporateDashboard = ({ onOpenAgent, user }: CorporateDashboardProps) => {
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin";
  
  const companyData = {
    name: "TechCorp International",
    metrics: {
      monthlySpend: 124500,
      spendChange: -18,
      tripsMade: 14,
      employeesTraveling: 7,
      budgetUsed: 145000,
      budgetTotal: 250000,
      savingsThisMonth: 18400
    },
    activeTrips: [
      { 
        employee: "Sarah Chen", 
        destination: "Tokyo", 
        purpose: "Client Meeting",
        team: "Sales",
        departure: "Jan 20, 2024", 
        return: "Jan 25, 2024",
        daysUntil: 5,
        status: "Approved"
      },
      { 
        employee: "Michael Ross", 
        destination: "London", 
        purpose: "Conference",
        team: "Engineering",
        departure: "Jan 18, 2024", 
        return: "Jan 22, 2024",
        daysUntil: 3,
        status: "In Transit"
      },
      { 
        employee: "Emily Watson", 
        destination: "Dubai", 
        purpose: "Partnership",
        team: "Business Dev",
        departure: "Jan 22, 2024", 
        return: "Jan 28, 2024",
        daysUntil: 7,
        status: "Pending Approval"
      }
    ],
    pendingApprovals: [
      { employee: "John Smith", request: "Dubai Business Trip", cost: "$2,400", urgency: "High" },
      { employee: "Lisa Wang", request: "Singapore Conference", cost: "$1,800", urgency: "Medium" }
    ],
    aiInsights: [
      "3 trips awaiting approval",
      "Saved $18,400 this month via smart routing",
      "Peak travel week: Jan 22-26"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNav 
        userName={userName} 
        userType="corporate" 
        onOpenAgent={onOpenAgent} 
      />

      {/* Hero Section */}
      <HeroSection userType="corporate" onOpenAgent={onOpenAgent} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* AI Search Bar */}
          <div className="animate-fade-in -mt-16 relative z-20">
            <AISearchBar 
              onOpenAgent={onOpenAgent} 
              placeholder="Ask Travax AI... 'Book team retreat for 10 people in Bali under $25,000'"
            />
          </div>

          {/* Quick Actions */}
          <section className="animate-fade-in">
            <QuickActions userType="corporate" onOpenAgent={onOpenAgent} />
          </section>

          {/* Corporate Metrics */}
          <section>
            <CorporateMetrics data={companyData.metrics} />
          </section>

          {/* AI Insights Banner */}
          <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">AI Insights for {companyData.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {companyData.aiInsights.map((insight, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-background/50 text-foreground font-normal"
                  >
                    {insight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Trips & Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Trips */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Active Business Trips
                  </span>
                  <Badge variant="outline">{companyData.activeTrips.length} active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyData.activeTrips.map((trip, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{trip.employee}</div>
                          <div className="text-sm text-muted-foreground">{trip.team} Team</div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          trip.status === "Approved" ? "default" : 
                          trip.status === "In Transit" ? "secondary" : "outline"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Destination</div>
                        <div className="font-medium">{trip.destination}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Purpose</div>
                        <div className="font-medium">{trip.purpose}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Departure</div>
                        <div className="font-medium">{trip.departure}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Return</div>
                        <div className="font-medium">{trip.return}</div>
                      </div>
                    </div>
                    {trip.daysUntil <= 7 && (
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30 text-sm text-primary">
                        <Clock className="w-3 h-3" />
                        {trip.daysUntil} days until departure
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyData.pendingApprovals.map((approval, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm">{approval.employee}</div>
                      <Badge 
                        variant={approval.urgency === "High" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {approval.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">{approval.request}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-primary">{approval.cost}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate("/approvals")}>
                  View All Approvals
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking History */}
          <BookingHistory />

          {/* Explore Options */}
          <section className="animate-scale-in">
            <ExploreOptions onOpenAgent={onOpenAgent} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default CorporateDashboard;
