import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingDown, TrendingUp, Building2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";

const COLORS = ['hsl(210, 100%, 50%)', 'hsl(158, 64%, 51%)', 'hsl(141, 69%, 58%)', 'hsl(172, 66%, 50%)', 'hsl(82, 77%, 55%)'];

const VendorAnalytics = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate("/auth"); return; }

        const [vendorsRes, bookingsRes, expensesRes] = await Promise.all([
          supabase.from("preferred_vendors").select("*").eq("is_active", true),
          supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("expenses").select("*").order("created_at", { ascending: false }).limit(200),
        ]);

        setVendors(vendorsRes.data || []);
        setBookings(bookingsRes.data || []);
        setExpenses(expensesRes.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Compute analytics from bookings and expenses
  const totalSpend = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalBookingSpend = bookings.reduce((s, b) => s + Number(b.price || 0), 0);

  const spendByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(spendByCategory).map(([name, value]) => ({ name, value }));

  const spendByType = bookings.reduce((acc: Record<string, number>, b) => {
    acc[b.booking_type] = (acc[b.booking_type] || 0) + Number(b.price || 0);
    return acc;
  }, {});

  const barData = Object.entries(spendByType).map(([name, value]) => ({ name, spend: value }));

  const potentialSavings = vendors.reduce((s, v) => {
    const discount = Number(v.discount_percentage || 0);
    return s + (totalSpend * discount / 100 / Math.max(vendors.length, 1));
  }, 0);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vendor Analytics</h1>
            <p className="text-sm text-muted-foreground">Spend consolidation, benchmarking & negotiation insights</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Travel Spend</p>
              <p className="text-2xl font-bold">${(totalSpend + totalBookingSpend).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Preferred Vendors</p>
              <p className="text-2xl font-bold">{vendors.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-1">
                <p className="text-sm text-muted-foreground">Est. Savings Potential</p>
                <TrendingDown className="w-4 h-4 text-chart-1" />
              </div>
              <p className="text-2xl font-bold text-chart-1">${potentialSavings.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spend by Booking Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Spend by Booking Type</CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="spend" fill="hsl(210, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No booking data available yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Expense Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><PieChart className="w-4 h-4" /> Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No expense data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Preferred Vendor Performance</CardTitle>
            <CardDescription>Negotiation leverage through consolidated spend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No preferred vendors configured. Add vendors in the Policy Engine.</p>
            ) : (
              <div className="space-y-3">
                {vendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{vendor.vendor_name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.vendor_type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {vendor.discount_percentage && (
                        <Badge variant="outline" className="text-chart-1">
                          <TrendingDown className="w-3 h-3 mr-1" /> {vendor.discount_percentage}% discount
                        </Badge>
                      )}
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalytics;
