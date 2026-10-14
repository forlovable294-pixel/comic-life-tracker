CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  status text NOT NULL DEFAULT 'Locked in',
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  bucket text NOT NULL DEFAULT 'should' CHECK (bucket IN ('must','should','side')),
  category text NOT NULL DEFAULT 'personal',
  priority int NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  due_date date NOT NULL DEFAULT current_date,
  estimate_minutes int CHECK (estimate_minutes IS NULL OR estimate_minutes BETWEEN 0 AND 1440),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 2000),
  done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_user_due ON public.tasks(user_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL,
  mood int CHECK (mood IS NULL OR mood BETWEEN 1 AND 5),
  energy int CHECK (energy IS NULL OR energy BETWEEN 1 AND 5),
  focus_minutes int NOT NULL DEFAULT 0 CHECK (focus_minutes BETWEEN 0 AND 1440),
  learning_minutes int NOT NULL DEFAULT 0 CHECK (learning_minutes BETWEEN 0 AND 1440),
  steps int NOT NULL DEFAULT 0 CHECK (steps BETWEEN 0 AND 200000),
  cardio_minutes int NOT NULL DEFAULT 0 CHECK (cardio_minutes BETWEEN 0 AND 1440),
  sleep_hours numeric(4,1) CHECK (sleep_hours IS NULL OR sleep_hours BETWEEN 0 AND 24),
  workout_done boolean NOT NULL DEFAULT false,
  highlight text CHECK (highlight IS NULL OR char_length(highlight) <= 500),
  journal text CHECK (journal IS NULL OR char_length(journal) <= 10000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs" ON public.daily_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();