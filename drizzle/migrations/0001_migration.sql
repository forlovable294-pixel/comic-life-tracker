CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{"step_goal":8000,"focus_goal_minutes":120,"gamification":true}'::jsonb;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.life_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9-]{1,40}$'),
  color text NOT NULL DEFAULT 'acid',
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug),
  UNIQUE (id, user_id)
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR char_length(description) <= 4000),
  project_type text NOT NULL DEFAULT 'project' CHECK (project_type IN ('project','research','hackathon','personal')),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','active','paused','shipped','archived')),
  priority int NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  start_date date,
  target_date date,
  tech_stack text[] NOT NULL DEFAULT '{}',
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  progress_method text NOT NULL DEFAULT 'milestones' CHECK (progress_method IN ('milestones','tasks','manual')),
  manual_progress int CHECK (manual_progress IS NULL OR manual_progress BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);
CREATE INDEX projects_user_status ON public.projects(user_id, status);

CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  target_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (project_id, user_id) REFERENCES public.projects(id, user_id) ON DELETE CASCADE
);
CREATE INDEX milestones_project ON public.project_milestones(project_id);

-- tasks: extend additively
ALTER TABLE public.tasks
  ADD COLUMN category_id uuid,
  ADD COLUMN project_id uuid,
  ADD COLUMN description text CHECK (description IS NULL OR char_length(description) <= 4000),
  ADD COLUMN status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  ADD COLUMN scheduled_date date NOT NULL DEFAULT current_date,
  ADD COLUMN due_at timestamptz,
  ADD COLUMN estimated_minutes int CHECK (estimated_minutes IS NULL OR estimated_minutes BETWEEN 0 AND 1440),
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.tasks ADD CONSTRAINT tasks_id_user_unique UNIQUE (id, user_id);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_category_fk FOREIGN KEY (category_id, user_id) REFERENCES public.life_categories(id, user_id) ON DELETE SET NULL (category_id);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_project_fk FOREIGN KEY (project_id, user_id) REFERENCES public.projects(id, user_id) ON DELETE SET NULL (project_id);
CREATE INDEX tasks_user_sched ON public.tasks(user_id, scheduled_date);
CREATE INDEX tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX tasks_project ON public.tasks(project_id);
COMMENT ON COLUMN public.tasks.category IS 'DEPRECATED: replaced by category_id';
COMMENT ON COLUMN public.tasks.due_date IS 'DEPRECATED: replaced by scheduled_date';
COMMENT ON COLUMN public.tasks.notes IS 'DEPRECATED: replaced by description';
COMMENT ON COLUMN public.tasks.done IS 'DEPRECATED: replaced by status';
COMMENT ON COLUMN public.tasks.estimate_minutes IS 'DEPRECATED: replaced by estimated_minutes';

-- daily_logs: extend additively
ALTER TABLE public.daily_logs
  ADD COLUMN reflection text CHECK (reflection IS NULL OR char_length(reflection) <= 10000),
  ADD COLUMN wins text CHECK (wins IS NULL OR char_length(wins) <= 4000),
  ADD COLUMN lessons text CHECK (lessons IS NULL OR char_length(lessons) <= 4000),
  ADD COLUMN next_day_priorities text CHECK (next_day_priorities IS NULL OR char_length(next_day_priorities) <= 4000),
  ADD COLUMN related_task_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN related_project_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.daily_logs.focus_minutes IS 'DEPRECATED: use focus_sessions';
COMMENT ON COLUMN public.daily_logs.learning_minutes IS 'DEPRECATED';
COMMENT ON COLUMN public.daily_logs.steps IS 'DEPRECATED: use health_daily_summaries';
COMMENT ON COLUMN public.daily_logs.cardio_minutes IS 'DEPRECATED: use cardio_sessions';
COMMENT ON COLUMN public.daily_logs.sleep_hours IS 'DEPRECATED';
COMMENT ON COLUMN public.daily_logs.workout_done IS 'DEPRECATED: use workouts';
COMMENT ON COLUMN public.daily_logs.highlight IS 'DEPRECATED: use wins';
COMMENT ON COLUMN public.daily_logs.journal IS 'DEPRECATED: use reflection';

CREATE TABLE public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id uuid,
  category_id uuid,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes BETWEEN 1 AND 720),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_at > started_at),
  FOREIGN KEY (task_id, user_id) REFERENCES public.tasks(id, user_id) ON DELETE SET NULL (task_id),
  FOREIGN KEY (category_id, user_id) REFERENCES public.life_categories(id, user_id) ON DELETE SET NULL (category_id)
);
CREATE INDEX focus_user_started ON public.focus_sessions(user_id, started_at);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  metric_key text NOT NULL,
  target_value numeric NOT NULL CHECK (target_value > 0),
  unit text,
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','abandoned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id, user_id) REFERENCES public.life_categories(id, user_id) ON DELETE SET NULL (category_id)
);

CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  frequency_rule jsonb NOT NULL DEFAULT '{"type":"daily"}'::jsonb,
  target_value numeric NOT NULL DEFAULT 1 CHECK (target_value > 0),
  unit text,
  color text NOT NULL DEFAULT 'acid',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (category_id, user_id) REFERENCES public.life_categories(id, user_id) ON DELETE SET NULL (category_id)
);
CREATE TABLE public.habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_id uuid NOT NULL,
  log_date date NOT NULL,
  value numeric NOT NULL DEFAULT 1 CHECK (value >= 0),
  completed boolean NOT NULL DEFAULT true,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, log_date),
  FOREIGN KEY (habit_id, user_id) REFERENCES public.habits(id, user_id) ON DELETE CASCADE
);
CREATE INDEX habit_logs_user_date ON public.habit_logs(user_id, log_date);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  semester text, academic_year text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);
CREATE TABLE public.academic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  event_type text NOT NULL DEFAULT 'assignment' CHECK (event_type IN ('assignment','exam','quiz','lab','lecture','other')),
  due_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','missed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (subject_id, user_id) REFERENCES public.subjects(id, user_id) ON DELETE SET NULL (subject_id)
);
CREATE INDEX academic_events_user_due ON public.academic_events(user_id, due_at);
CREATE TABLE public.placement_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company text NOT NULL CHECK (char_length(company) BETWEEN 1 AND 120),
  role text NOT NULL CHECK (char_length(role) BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT 'wishlist' CHECK (status IN ('wishlist','applied','oa','interview','offer','rejected','withdrawn')),
  applied_at date, next_event_at timestamptz, job_url text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX placement_user_status ON public.placement_applications(user_id, status);
CREATE TABLE public.research_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  authors text, source_url text,
  reading_status text NOT NULL DEFAULT 'to_read' CHECK (reading_status IN ('to_read','reading','read','summarized')),
  notes text, published_at date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (project_id, user_id) REFERENCES public.projects(id, user_id) ON DELETE SET NULL (project_id)
);

CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_date date NOT NULL,
  workout_type text NOT NULL DEFAULT 'strength',
  duration_minutes int CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 600),
  notes text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','imported','health_connect','demo')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);
CREATE INDEX workouts_user_date ON public.workouts(user_id, workout_date);
CREATE TABLE public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workout_id uuid NOT NULL,
  exercise_name text NOT NULL CHECK (char_length(exercise_name) BETWEEN 1 AND 120),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (workout_id, user_id) REFERENCES public.workouts(id, user_id) ON DELETE CASCADE
);
CREATE TABLE public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  set_number int NOT NULL CHECK (set_number BETWEEN 1 AND 100),
  reps int CHECK (reps IS NULL OR reps BETWEEN 0 AND 1000),
  weight_kg numeric(6,2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 0 AND 1000),
  rpe numeric(3,1) CHECK (rpe IS NULL OR rpe BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (exercise_id, user_id) REFERENCES public.workout_exercises(id, user_id) ON DELETE CASCADE
);
CREATE TABLE public.cardio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL DEFAULT 'run',
  started_at timestamptz NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes BETWEEN 1 AND 1440),
  distance_meters int CHECK (distance_meters IS NULL OR distance_meters BETWEEN 0 AND 1000000),
  average_heart_rate int CHECK (average_heart_rate IS NULL OR average_heart_rate BETWEEN 20 AND 250),
  calories_kcal int CHECK (calories_kcal IS NULL OR calories_kcal BETWEEN 0 AND 20000),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','imported','health_connect','demo')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cardio_user_started ON public.cardio_sessions(user_id, started_at);
CREATE TABLE public.health_daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  source_provider text NOT NULL DEFAULT 'manual' CHECK (source_provider IN ('manual','imported','health_connect','demo')),
  steps_count int CHECK (steps_count IS NULL OR steps_count BETWEEN 0 AND 200000),
  distance_meters int CHECK (distance_meters IS NULL OR distance_meters >= 0),
  active_calories_kcal int CHECK (active_calories_kcal IS NULL OR active_calories_kcal >= 0),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz,
  source_device text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date, source_provider)
);
CREATE TABLE public.health_sync_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('health_connect','healthkit')),
  status text NOT NULL DEFAULT 'not_connected' CHECK (status IN ('not_connected','pending_permission','connected','error','revoked')),
  permission_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_sync_at timestamptz, last_success_at timestamptz,
  last_error_code text, last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  xp_reward int NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  reference_type text, reference_id uuid,
  points int NOT NULL CHECK (points BETWEEN -1000 AND 1000),
  idempotency_key text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX xp_user_time ON public.xp_events(user_id, occurred_at);

CREATE TABLE public.music_embeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('spotify','youtube')),
  embed_url text NOT NULL CHECK (embed_url ~ '^https://(open\.spotify\.com/embed/|www\.youtube-nocookie\.com/embed/)'),
  title text CHECK (title IS NULL OR char_length(title) <= 160),
  is_favorite boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.personal_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  activity_type text NOT NULL DEFAULT 'other',
  started_at timestamptz NOT NULL DEFAULT now(),
  duration_minutes int CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 0 AND 1440),
  rating int CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id, user_id) REFERENCES public.life_categories(id, user_id) ON DELETE SET NULL (category_id)
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['life_categories','projects','project_milestones','tasks','daily_logs','goals','habits','subjects','academic_events','placement_applications','research_items','workouts','health_daily_summaries','health_sync_connections'] LOOP
    EXECUTE format('CREATE TRIGGER %I_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END $$;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['life_categories','projects','project_milestones','focus_sessions','goals','habits','habit_logs','subjects','academic_events','placement_applications','research_items','workouts','workout_exercises','workout_sets','cardio_sessions','health_daily_summaries','music_embeds','personal_activities'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "owner select" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "owner insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "owner update" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "owner delete" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT ON public.health_sync_connections TO authenticated;
GRANT ALL ON public.health_sync_connections TO service_role;
ALTER TABLE public.health_sync_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner select" ON public.health_sync_connections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner insert not_connected" ON public.health_sync_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'not_connected');

GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogue read" ON public.achievements FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.user_achievements, public.xp_events TO authenticated;
GRANT ALL ON public.user_achievements, public.xp_events TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner select" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner select" ON public.xp_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.achievements (key, name, description, xp_reward, icon) VALUES
  ('first_mission','First Blood','Complete your first mission',25,'zap'),
  ('first_log','Dear Diary','Write your first daily log',25,'notebook'),
  ('first_focus','Deep Diver','Log your first focus session',25,'timer'),
  ('missions_10','Ten Down','Complete 10 missions',50,'trophy');

CREATE OR REPLACE FUNCTION public.award_xp(_user uuid, _type text, _ref_type text, _ref uuid, _points int, _key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.xp_events (user_id, event_type, reference_type, reference_id, points, idempotency_key)
  VALUES (_user, _type, _ref_type, _ref, _points, _key) ON CONFLICT (user_id, idempotency_key) DO NOTHING;
END $$;
CREATE OR REPLACE FUNCTION public.unlock(_user uuid, _key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a record;
BEGIN
  SELECT * INTO a FROM public.achievements WHERE key = _key;
  IF a.id IS NULL THEN RETURN; END IF;
  INSERT INTO public.user_achievements (user_id, achievement_id) VALUES (_user, a.id) ON CONFLICT DO NOTHING;
  IF FOUND THEN PERFORM public.award_xp(_user, 'achievement', 'achievement', a.id, a.xp_reward, 'ach:' || _key); END IF;
END $$;

CREATE OR REPLACE FUNCTION public.on_task_xp() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF NEW.status = 'done' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'done') THEN
    PERFORM public.award_xp(NEW.user_id, 'task_completed', 'task', NEW.id, CASE NEW.priority WHEN 1 THEN 20 WHEN 2 THEN 10 ELSE 5 END, 'task:' || NEW.id);
    PERFORM public.unlock(NEW.user_id, 'first_mission');
    SELECT count(*) INTO n FROM public.tasks WHERE user_id = NEW.user_id AND status = 'done';
    IF n >= 10 THEN PERFORM public.unlock(NEW.user_id, 'missions_10'); END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER tasks_xp AFTER INSERT OR UPDATE OF status ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.on_task_xp();

CREATE OR REPLACE FUNCTION public.on_log_xp() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 'daily_log', 'daily_log', NEW.id, 15, 'log:' || NEW.log_date);
  PERFORM public.unlock(NEW.user_id, 'first_log');
  RETURN NEW;
END $$;
CREATE TRIGGER logs_xp AFTER INSERT ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.on_log_xp();

CREATE OR REPLACE FUNCTION public.on_focus_xp() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 'focus_session', 'focus_session', NEW.id, LEAST(GREATEST(NEW.duration_minutes / 5, 1), 30), 'focus:' || NEW.id);
  PERFORM public.unlock(NEW.user_id, 'first_focus');
  RETURN NEW;
END $$;
CREATE TRIGGER focus_xp AFTER INSERT ON public.focus_sessions FOR EACH ROW EXECUTE FUNCTION public.on_focus_xp();

CREATE OR REPLACE FUNCTION public.seed_categories(_user uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.life_categories (user_id, name, slug, color, sort_order) VALUES
    (_user,'Academics','academics','cyan',1),(_user,'Placement prep','placement','acid',2),
    (_user,'Research','research','magenta',3),(_user,'Projects','projects','orange',4),
    (_user,'Hackathons','hackathons','cyan',5),(_user,'Fitness','fitness','acid',6),
    (_user,'Habits','habits','magenta',7),(_user,'Fun','fun','orange',8),(_user,'Personal','personal','muted',9)
  ON CONFLICT (user_id, slug) DO NOTHING;
END $$;

REVOKE EXECUTE ON FUNCTION public.award_xp(uuid,text,text,uuid,int,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unlock(uuid,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_categories(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_task_xp(), public.on_log_xp(), public.on_focus_xp(), public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  PERFORM public.seed_categories(NEW.id);
  RETURN NEW;
END $$;

SELECT public.seed_categories(id) FROM public.profiles;