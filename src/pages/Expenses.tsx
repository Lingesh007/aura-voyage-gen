import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, Camera, Receipt, FileText, Check, X, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  flights: "Flights", hotels: "Hotels", meals: "Meals", transport: "Transport",
  communication: "Communication", entertainment: "Entertainment", office_supplies: "Office Supplies", other: "Other",
};

const statusColors: Record<string, string> = {
  draft: "secondary", submitted: "outline", approved: "default", rejected: "destructive", reimbursed: "default",
};

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newExpense, setNewExpense] = useState({
    category: "other", amount: "", currency: "USD", description: "",
    merchant_name: "", expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      setExpenses(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }

    setOcrProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const { data, error } = await supabase.functions.invoke("receipt-ocr", {
          body: { imageBase64: base64, mimeType: file.type },
        });

        if (error) { toast.error("OCR processing failed"); setOcrProcessing(false); return; }

        const receipt = data?.receiptData;
        if (receipt) {
          setNewExpense({
            category: receipt.category || "other",
            amount: receipt.amount?.toString() || "",
            currency: receipt.currency || "USD",
            description: receipt.items?.map((i: any) => i.description).join(", ") || "",
            merchant_name: receipt.merchant_name || "",
            expense_date: receipt.date || new Date().toISOString().split("T")[0],
          });
          toast.success("Receipt data extracted successfully!");
        } else {
          toast.error("Could not extract receipt data");
        }
        setOcrProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to process receipt");
      setOcrProcessing(false);
    }
  };

  const createExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      category: newExpense.category as any,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      description: newExpense.description,
      merchant_name: newExpense.merchant_name,
      expense_date: newExpense.expense_date,
      status: "draft" as any,
    });
    if (error) { toast.error("Failed to create expense"); return; }
    toast.success("Expense added");
    setShowNewExpense(false);
    setNewExpense({ category: "other", amount: "", currency: "USD", description: "", merchant_name: "", expense_date: new Date().toISOString().split("T")[0] });
    fetchExpenses();
  };

  const submitExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").update({ status: "submitted" as any }).eq("id", id);
    if (error) { toast.error("Failed to submit"); return; }
    toast.success("Expense submitted for approval");
    fetchExpenses();
  };

  const totalDraft = expenses.filter(e => e.status === "draft").reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter(e => e.status === "submitted").reduce((s, e) => s + Number(e.amount), 0);
  const totalApproved = expenses.filter(e => e.status === "approved" || e.status === "reimbursed").reduce((s, e) => s + Number(e.amount), 0);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Expense Management</h1>
              <p className="text-sm text-muted-foreground">Capture receipts, track expenses, manage reimbursements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={ocrProcessing}>
              <Camera className="w-4 h-4 mr-1" /> {ocrProcessing ? "Processing..." : "Scan Receipt"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
            <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Add Expense</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>New Expense</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Amount</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense(x => ({ ...x, amount: e.target.value }))} placeholder="0.00" /></div>
                    <div><Label>Currency</Label>
                      <Select value={newExpense.currency} onValueChange={v => setNewExpense(x => ({ ...x, currency: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Category</Label>
                    <Select value={newExpense.category} onValueChange={v => setNewExpense(x => ({ ...x, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Merchant</Label><Input value={newExpense.merchant_name} onChange={e => setNewExpense(x => ({ ...x, merchant_name: e.target.value }))} placeholder="Store or vendor name" /></div>
                  <div><Label>Date</Label><Input type="date" value={newExpense.expense_date} onChange={e => setNewExpense(x => ({ ...x, expense_date: e.target.value }))} /></div>
                  <div><Label>Description</Label><Textarea value={newExpense.description} onChange={e => setNewExpense(x => ({ ...x, description: e.target.value }))} placeholder="What was this for?" /></div>
                  <Button onClick={createExpense} disabled={!newExpense.amount} className="w-full">Save Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FileText className="w-8 h-8 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Drafts</p><p className="text-2xl font-bold">${totalDraft.toFixed(2)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Pending Approval</p><p className="text-2xl font-bold">${totalPending.toFixed(2)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-chart-1" /><div><p className="text-sm text-muted-foreground">Approved/Reimbursed</p><p className="text-2xl font-bold">${totalApproved.toFixed(2)}</p></div></div></CardContent></Card>
        </div>

        {/* Expense List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({expenses.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="submitted">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>

          {["all", "draft", "submitted", "approved"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {expenses.filter(e => tab === "all" || e.status === tab).length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No expenses found.</CardContent></Card>
              ) : (
                expenses.filter(e => tab === "all" || e.status === tab).map(expense => (
                  <Card key={expense.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Receipt className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{expense.merchant_name || "Unknown Merchant"}</p>
                            <p className="text-xs text-muted-foreground">{categoryLabels[expense.category]} • {new Date(expense.expense_date).toLocaleDateString()}</p>
                            {expense.description && <p className="text-xs text-muted-foreground mt-0.5">{expense.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{expense.currency} {Number(expense.amount).toFixed(2)}</p>
                          <Badge variant={statusColors[expense.status] as any}>{expense.status}</Badge>
                          {expense.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => submitExpense(expense.id)}>Submit</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Expenses;
