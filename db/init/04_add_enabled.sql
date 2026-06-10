-- issue #20: enable/disable a source from data instead of hardcoded ids in SQL.
ALTER TABLE public.stranka ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

-- Preserve current behaviour: the old scraper only processed ids 2,7,8,9,10.
-- Sciencemag(1), akademon(3), vtm(4) and aldebaran(5) were effectively off.
UPDATE public.stranka SET enabled = false WHERE id_stranka IN (1, 3, 4, 5);
