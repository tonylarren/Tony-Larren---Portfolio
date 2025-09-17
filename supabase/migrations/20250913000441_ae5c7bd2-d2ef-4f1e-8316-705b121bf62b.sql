-- Create profiles table for admin user info
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Your Name',
  description TEXT NOT NULL DEFAULT 'Your description here',
  years_experience INTEGER NOT NULL DEFAULT 0,
  projects_count INTEGER NOT NULL DEFAULT 0,
  profile_image TEXT,
  cv_en TEXT,
  cv_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  live_demo_link TEXT,
  github_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (only user can manage their own profile)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for projects (only user can manage their own projects)
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow public read access to profiles and projects for the portfolio
CREATE POLICY "Public can view profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Public can view projects" 
ON public.projects 
FOR SELECT 
TO anon 
USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', true);

-- Create storage policies for project images
CREATE POLICY "Public can view project images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their project images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their project images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for profile images
CREATE POLICY "Public can view profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their profile images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their profile images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for CVs
CREATE POLICY "Public can view CVs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs');

CREATE POLICY "Authenticated users can upload CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their CVs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their CVs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cvs' AND auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, description)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Your Name'),
    'Your description here'
  );
  RETURN new;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();