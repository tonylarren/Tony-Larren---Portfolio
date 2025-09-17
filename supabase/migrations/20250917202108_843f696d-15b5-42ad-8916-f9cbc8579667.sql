-- Allow public access to profile data for portfolio display
CREATE POLICY "Public can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Drop the restrictive policy that requires authentication
DROP POLICY "Users can view their own profile" ON public.profiles;