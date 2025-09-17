-- Add visibility column to projects table
ALTER TABLE public.projects 
ADD COLUMN is_visible boolean DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.projects.is_visible IS 'Whether the project is visible in the public portfolio';