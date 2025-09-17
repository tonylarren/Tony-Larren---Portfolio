-- Remove the public access policy for profiles table to fix security vulnerability
-- This prevents unauthorized access to personal information while maintaining admin functionality

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Keep the existing secure policies for authenticated users:
-- - "Users can view their own profile" - allows users to see their own data
-- - "Users can create their own profile" - allows profile creation
-- - "Users can update their own profile" - allows profile updates