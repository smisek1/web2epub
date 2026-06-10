-- issue #13: track when an article was imported (distinct from its publish date).
ALTER TABLE public.clanky ADD COLUMN IF NOT EXISTS datum_importu timestamptz DEFAULT now();
