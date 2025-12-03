-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create travel_requests table
CREATE TABLE public.travel_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    destination text NOT NULL,
    departure_date date NOT NULL,
    return_date date NOT NULL,
    purpose text NOT NULL,
    estimated_budget numeric NOT NULL,
    trip_type text DEFAULT 'business',
    notes text,
    status request_status NOT NULL DEFAULT 'pending',
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on travel_requests
ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;

-- Create approval_actions table for audit trail
CREATE TABLE public.approval_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid REFERENCES public.travel_requests(id) ON DELETE CASCADE NOT NULL,
    action_by uuid NOT NULL,
    action text NOT NULL,
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on approval_actions
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_approver(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('manager', 'admin')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for travel_requests
CREATE POLICY "Users can view their own requests"
ON public.travel_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Approvers can view all pending requests"
ON public.travel_requests FOR SELECT
USING (public.is_approver(auth.uid()));

CREATE POLICY "Users can create their own requests"
ON public.travel_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
ON public.travel_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Approvers can update request status"
ON public.travel_requests FOR UPDATE
USING (public.is_approver(auth.uid()));

CREATE POLICY "Users can delete their own pending requests"
ON public.travel_requests FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for approval_actions
CREATE POLICY "Users can view actions on their requests"
ON public.approval_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.travel_requests
    WHERE id = request_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approvers can view all actions"
ON public.approval_actions FOR SELECT
USING (public.is_approver(auth.uid()));

CREATE POLICY "Approvers can create actions"
ON public.approval_actions FOR INSERT
WITH CHECK (public.is_approver(auth.uid()) AND auth.uid() = action_by);

-- Trigger for updated_at
CREATE TRIGGER update_travel_requests_updated_at
BEFORE UPDATE ON public.travel_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();