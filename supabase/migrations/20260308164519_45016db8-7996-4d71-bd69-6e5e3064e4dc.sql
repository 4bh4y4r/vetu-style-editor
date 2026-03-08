
ALTER TABLE public.profiles
  ADD COLUMN height_cm integer,
  ADD COLUMN body_type text,
  ADD COLUMN skin_tone text,
  ADD COLUMN onboarding_complete boolean NOT NULL DEFAULT false;
