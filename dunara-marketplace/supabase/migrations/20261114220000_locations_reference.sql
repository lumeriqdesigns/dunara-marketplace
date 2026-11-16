-- Optional reference table for Nigeria places (Kwara-first + SW metros).
-- Application also ships static data in src/data/locations.ts for chips/UI.
-- provider_service_areas remains the source of truth for seller coverage.

CREATE TABLE IF NOT EXISTS public.locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  state           TEXT NOT NULL,
  lga             TEXT,
  delivery_zone   TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_state ON public.locations (state);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations (slug);
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations (name);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Locations are publicly readable" ON public.locations;
CREATE POLICY "Locations are publicly readable"
  ON public.locations FOR SELECT
  USING (is_active = true);

COMMENT ON TABLE public.locations IS
  'Reference places for search chips and service-area pickers. Not a substitute for provider_service_areas.';
