-- Paste Board: a single shared, collaborative document.
-- Intentionally public: anyone (including anonymous visitors) can read AND edit it.
CREATE TABLE public.paste_board (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article TEXT NOT NULL DEFAULT '',
  contenu TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.paste_board ENABLE ROW LEVEL SECURITY;

-- Anyone can view the board
CREATE POLICY "Anyone can view paste board"
ON public.paste_board
FOR SELECT
USING (true);

-- Anyone can edit the board (collaborative, no authentication required)
CREATE POLICY "Anyone can update paste board"
ON public.paste_board
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow inserts as a safety net in case the seed row is ever missing
CREATE POLICY "Anyone can insert paste board"
ON public.paste_board
FOR INSERT
WITH CHECK (true);

-- Keep updated_at fresh on every edit
CREATE TRIGGER update_paste_board_updated_at
BEFORE UPDATE ON public.paste_board
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the single shared document
INSERT INTO public.paste_board (article, contenu) VALUES ('', '');

-- Site settings: controls what the site's main entry point ("/") displays.
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_mode TEXT NOT NULL DEFAULT 'portfolio' CHECK (home_mode IN ('portfolio', 'paste_board')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read the current mode (needed to render the correct home page)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only authenticated admins can change the mode
CREATE POLICY "Authenticated users can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the single settings row (defaults to portfolio, preserving current behavior)
INSERT INTO public.site_settings (home_mode) VALUES ('portfolio');
