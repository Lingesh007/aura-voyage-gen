
-- =============================================
-- TRAVEL POLICIES & RULES ENGINE
-- =============================================

CREATE TABLE public.travel_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage policies" ON public.travel_policies
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active policies" ON public.travel_policies
  FOR SELECT TO authenticated USING (is_active = true);

-- Policy Rules
CREATE TYPE public.rule_type AS ENUM ('spend_limit', 'approval_required', 'preferred_vendor', 'advance_booking', 'cabin_class', 'custom');

CREATE TABLE public.policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES public.travel_policies(id) ON DELETE CASCADE,
  rule_type public.rule_type NOT NULL,
  name text NOT NULL,
  description text,
  conditions jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rules" ON public.policy_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active rules" ON public.policy_rules
  FOR SELECT TO authenticated USING (is_active = true);

-- Preferred Vendors
CREATE TABLE public.preferred_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES public.travel_policies(id) ON DELETE SET NULL,
  vendor_name text NOT NULL,
  vendor_type text NOT NULL, -- airline, hotel, car_rental, etc.
  contract_rate numeric,
  discount_percentage numeric,
  contract_start date,
  contract_end date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.preferred_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vendors" ON public.preferred_vendors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active vendors" ON public.preferred_vendors
  FOR SELECT TO authenticated USING (is_active = true);

-- Policy Audit Trail
CREATE TABLE public.policy_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES public.travel_policies(id) ON DELETE SET NULL,
  action text NOT NULL,
  changed_by uuid NOT NULL,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.policy_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create audit logs" ON public.policy_audit_log
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- EXPENSE MANAGEMENT
-- =============================================

CREATE TYPE public.expense_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'reimbursed');
CREATE TYPE public.expense_category AS ENUM ('flights', 'hotels', 'meals', 'transport', 'communication', 'entertainment', 'office_supplies', 'other');

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  travel_request_id uuid REFERENCES public.travel_requests(id) ON DELETE SET NULL,
  category public.expense_category NOT NULL DEFAULT 'other',
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  merchant_name text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url text,
  ocr_data jsonb,
  status public.expense_status NOT NULL DEFAULT 'draft',
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Approvers can view submitted expenses" ON public.expenses
  FOR SELECT USING (public.is_approver(auth.uid()) AND status != 'draft');

CREATE POLICY "Approvers can update submitted expenses" ON public.expenses
  FOR UPDATE USING (public.is_approver(auth.uid()) AND status = 'submitted');

-- Expense Reports (group expenses)
CREATE TABLE public.expense_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  travel_request_id uuid REFERENCES public.travel_requests(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status public.expense_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reports" ON public.expense_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Approvers can view submitted reports" ON public.expense_reports
  FOR SELECT USING (public.is_approver(auth.uid()) AND status != 'draft');

CREATE POLICY "Approvers can update submitted reports" ON public.expense_reports
  FOR UPDATE USING (public.is_approver(auth.uid()) AND status = 'submitted');

-- =============================================
-- VENDOR ANALYTICS (spend_summary materialized view approach via table)
-- =============================================

CREATE TABLE public.vendor_spend_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  vendor_type text NOT NULL,
  total_spend numeric NOT NULL DEFAULT 0,
  booking_count integer NOT NULL DEFAULT 0,
  avg_transaction numeric NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_spend_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view spend summaries" ON public.vendor_spend_summary
  FOR SELECT USING (public.is_approver(auth.uid()));

CREATE POLICY "System can insert spend summaries" ON public.vendor_spend_summary
  FOR INSERT WITH CHECK (public.is_approver(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_travel_policies_updated_at BEFORE UPDATE ON public.travel_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_rules_updated_at BEFORE UPDATE ON public.policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preferred_vendors_updated_at BEFORE UPDATE ON public.preferred_vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_reports_updated_at BEFORE UPDATE ON public.expense_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
