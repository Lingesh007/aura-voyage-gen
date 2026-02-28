import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Shield, BookOpen, Building2, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PolicyEngine = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // New policy form
  const [newPolicy, setNewPolicy] = useState({ name: "", description: "" });
  const [newRule, setNewRule] = useState({ policy_id: "", rule_type: "spend_limit", name: "", description: "", conditions: "{}" });
  const [newVendor, setNewVendor] = useState({ vendor_name: "", vendor_type: "airline", discount_percentage: "", notes: "" });
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      // Check admin role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const userIsAdmin = roles?.some(r => r.role === "admin") || false;
      setIsAdmin(userIsAdmin);

      const [policiesRes, rulesRes, vendorsRes, auditRes] = await Promise.all([
        supabase.from("travel_policies").select("*").order("created_at", { ascending: false }),
        supabase.from("policy_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("preferred_vendors").select("*").order("vendor_name"),
        userIsAdmin ? supabase.from("policy_audit_log").select("*").order("created_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
      ]);

      setPolicies(policiesRes.data || []);
      setRules(rulesRes.data || []);
      setVendors(vendorsRes.data || []);
      setAuditLog(auditRes.data || []);
    } catch (error) {
      console.error("Error fetching policy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("travel_policies").insert({
      name: newPolicy.name, description: newPolicy.description, created_by: user.id,
    });
    if (error) { toast.error("Failed to create policy"); return; }
    toast.success("Policy created");
    setShowPolicyDialog(false);
    setNewPolicy({ name: "", description: "" });
    fetchData();
  };

  const createRule = async () => {
    let conditions = {};
    try { conditions = JSON.parse(newRule.conditions); } catch { toast.error("Invalid JSON conditions"); return; }
    const { error } = await supabase.from("policy_rules").insert({
      policy_id: newRule.policy_id, rule_type: newRule.rule_type as any, name: newRule.name,
      description: newRule.description, conditions,
    });
    if (error) { toast.error("Failed to create rule"); return; }
    toast.success("Rule created");
    setShowRuleDialog(false);
    fetchData();
  };

  const createVendor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("preferred_vendors").insert({
      vendor_name: newVendor.vendor_name, vendor_type: newVendor.vendor_type,
      discount_percentage: newVendor.discount_percentage ? parseFloat(newVendor.discount_percentage) : null,
      notes: newVendor.notes, created_by: user.id,
    });
    if (error) { toast.error("Failed to add vendor"); return; }
    toast.success("Vendor added");
    setShowVendorDialog(false);
    setNewVendor({ vendor_name: "", vendor_type: "airline", discount_percentage: "", notes: "" });
    fetchData();
  };

  const ruleTypeLabels: Record<string, string> = {
    spend_limit: "Spend Limit",
    approval_required: "Approval Required",
    preferred_vendor: "Preferred Vendor",
    advance_booking: "Advance Booking",
    cabin_class: "Cabin Class",
    custom: "Custom Rule",
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Policy Engine</h1>
              <p className="text-sm text-muted-foreground">Configure travel policies, rules, and preferred vendors</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="policies" className="gap-2"><Shield className="w-4 h-4" /> Policies</TabsTrigger>
            <TabsTrigger value="rules" className="gap-2"><BookOpen className="w-4 h-4" /> Rules</TabsTrigger>
            <TabsTrigger value="vendors" className="gap-2"><Building2 className="w-4 h-4" /> Vendors</TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><History className="w-4 h-4" /> Audit Log</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Travel Policies</h2>
              {isAdmin && (
                <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Policy</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Travel Policy</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Policy Name</Label><Input value={newPolicy.name} onChange={e => setNewPolicy(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Travel Policy" /></div>
                      <div><Label>Description</Label><Textarea value={newPolicy.description} onChange={e => setNewPolicy(p => ({ ...p, description: e.target.value }))} placeholder="Describe the policy..." /></div>
                      <Button onClick={createPolicy} disabled={!newPolicy.name}>Create Policy</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {policies.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No policies configured yet.{isAdmin && " Create your first policy above."}</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {policies.map(policy => (
                  <Card key={policy.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{policy.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={policy.is_active ? "default" : "secondary"}>{policy.is_active ? "Active" : "Inactive"}</Badge>
                          <Badge variant="outline">v{policy.version}</Badge>
                        </div>
                      </div>
                      <CardDescription>{policy.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{rules.filter(r => r.policy_id === policy.id).length} rules attached</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Policy Rules</h2>
              {isAdmin && policies.length > 0 && (
                <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Rule</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Policy Rule</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Policy</Label>
                        <Select value={newRule.policy_id} onValueChange={v => setNewRule(r => ({ ...r, policy_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                          <SelectContent>{policies.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Rule Type</Label>
                        <Select value={newRule.rule_type} onValueChange={v => setNewRule(r => ({ ...r, rule_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(ruleTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Rule Name</Label><Input value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} placeholder="e.g. Max hotel per night" /></div>
                      <div><Label>Conditions (JSON)</Label><Textarea value={newRule.conditions} onChange={e => setNewRule(r => ({ ...r, conditions: e.target.value }))} placeholder='{"max_amount": 300, "currency": "USD"}' className="font-mono text-xs" /></div>
                      <Button onClick={createRule} disabled={!newRule.policy_id || !newRule.name}>Create Rule</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {rules.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No rules configured yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {rules.map(rule => (
                  <Card key={rule.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{rule.name}</p>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ruleTypeLabels[rule.rule_type] || rule.rule_type}</Badge>
                          <Badge variant={rule.is_active ? "default" : "secondary"} className="text-xs">{rule.is_active ? "Active" : "Off"}</Badge>
                        </div>
                      </div>
                      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                        <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto">{JSON.stringify(rule.conditions, null, 2)}</pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Preferred Vendors</h2>
              {isAdmin && (
                <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Vendor</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Preferred Vendor</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Vendor Name</Label><Input value={newVendor.vendor_name} onChange={e => setNewVendor(v => ({ ...v, vendor_name: e.target.value }))} placeholder="e.g. Emirates Airlines" /></div>
                      <div><Label>Type</Label>
                        <Select value={newVendor.vendor_type} onValueChange={v => setNewVendor(vn => ({ ...vn, vendor_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airline">Airline</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="car_rental">Car Rental</SelectItem>
                            <SelectItem value="ground_transport">Ground Transport</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Discount %</Label><Input type="number" value={newVendor.discount_percentage} onChange={e => setNewVendor(v => ({ ...v, discount_percentage: e.target.value }))} placeholder="e.g. 15" /></div>
                      <div><Label>Notes</Label><Textarea value={newVendor.notes} onChange={e => setNewVendor(v => ({ ...v, notes: e.target.value }))} /></div>
                      <Button onClick={createVendor} disabled={!newVendor.vendor_name}>Add Vendor</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {vendors.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No preferred vendors configured.</CardContent></Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {vendors.map(vendor => (
                  <Card key={vendor.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{vendor.vendor_name}</h3>
                        <Badge variant="outline">{vendor.vendor_type}</Badge>
                      </div>
                      {vendor.discount_percentage && (
                        <p className="text-sm text-primary font-medium">{vendor.discount_percentage}% negotiated discount</p>
                      )}
                      {vendor.notes && <p className="text-xs text-muted-foreground mt-1">{vendor.notes}</p>}
                      {vendor.contract_end && (
                        <p className="text-xs text-muted-foreground mt-1">Contract until {new Date(vendor.contract_end).toLocaleDateString()}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <h2 className="text-lg font-semibold">Audit Trail</h2>
            {!isAdmin ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Only administrators can view the audit log.</CardContent></Card>
            ) : auditLog.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No audit entries yet.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {auditLog.map(entry => (
                  <Card key={entry.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{entry.action}</p>
                          {entry.changes && <pre className="text-xs text-muted-foreground mt-1">{JSON.stringify(entry.changes, null, 2)}</pre>}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PolicyEngine;
