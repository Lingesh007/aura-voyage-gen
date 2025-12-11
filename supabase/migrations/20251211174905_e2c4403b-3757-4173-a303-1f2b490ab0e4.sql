-- Fix search_history RLS policies - remove anonymous access vulnerability
-- Drop existing policies that allow access when user_id IS NULL
DROP POLICY IF EXISTS "Users can create their own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can delete their own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can update their own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;

-- Recreate policies requiring authentication (user_id must match auth.uid())
CREATE POLICY "Users can create their own search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" 
ON public.search_history 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history" 
ON public.search_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Delete existing anonymous search records that are now orphaned
DELETE FROM public.search_history WHERE user_id IS NULL;