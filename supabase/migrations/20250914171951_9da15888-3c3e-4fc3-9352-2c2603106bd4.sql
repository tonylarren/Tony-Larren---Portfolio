-- Add new columns to projects table for enhanced project details
ALTER TABLE public.projects 
ADD COLUMN technologies text[] DEFAULT '{}',
ADD COLUMN key_features text[] DEFAULT '{}',
ADD COLUMN about_project text DEFAULT '';

-- Add comment for clarity
COMMENT ON COLUMN public.projects.technologies IS 'Array of technologies used in the project';
COMMENT ON COLUMN public.projects.key_features IS 'Array of key features of the project';
COMMENT ON COLUMN public.projects.about_project IS 'Detailed description about the project';