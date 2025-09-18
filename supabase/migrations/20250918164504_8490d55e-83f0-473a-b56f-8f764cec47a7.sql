-- Create skills table for managing technologies and skills
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policies for skills
CREATE POLICY "Public can view visible skills" 
ON public.skills 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Users can create their own skills" 
ON public.skills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
ON public.skills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" 
ON public.skills 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own skills" 
ON public.skills 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for skill logos
INSERT INTO storage.buckets (id, name, public) VALUES ('skill-logos', 'skill-logos', true);

-- Create policies for skill logo uploads
CREATE POLICY "Skill logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'skill-logos');

CREATE POLICY "Users can upload skill logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'skill-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their skill logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'skill-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their skill logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'skill-logos' AND auth.uid()::text = (storage.foldername(name))[1]);