-- Rename description column to short_bio_en and add short_bio_fr column
ALTER TABLE public.profiles 
RENAME COLUMN description TO short_bio_en;

ALTER TABLE public.profiles 
ADD COLUMN short_bio_fr text;