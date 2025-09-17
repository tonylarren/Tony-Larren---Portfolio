-- Add multilingual fields to projects table
ALTER TABLE public.projects 
ADD COLUMN description_en text,
ADD COLUMN description_fr text,
ADD COLUMN about_project_en text,
ADD COLUMN about_project_fr text;

-- Add multilingual fields and new fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN description_en text,
ADD COLUMN description_fr text,
ADD COLUMN title text,
ADD COLUMN about text;

-- Update existing data to populate new fields with current description values
UPDATE public.projects 
SET description_en = description, 
    description_fr = description,
    about_project_en = about_project,
    about_project_fr = about_project
WHERE description_en IS NULL;

UPDATE public.profiles
SET description_en = description,
    description_fr = description
WHERE description_en IS NULL;