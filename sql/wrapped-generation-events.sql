CREATE TABLE IF NOT EXISTS public.wrapped_generation_events (event_id uuid PRIMARY KEY, generated_at timestamptz NOT NULL DEFAULT now(), platform text NOT NULL CHECK (platform IN ('whatsapp','telegram','meta','imessage','sms')));
CREATE INDEX IF NOT EXISTS wrapped_generation_events_generated_at_idx ON public.wrapped_generation_events (generated_at);
