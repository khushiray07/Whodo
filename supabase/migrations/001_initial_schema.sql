-- Whodo v1 Initial Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  invite_code TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL DEFAULT 'custom'
    CHECK (template IN ('birthday','trip','chores','hackathon','dinner','custom')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  color TEXT NOT NULL,
  joined_via TEXT NOT NULL DEFAULT 'organizer_added'
    CHECK (joined_via IN ('organizer_added', 'app_joined')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, user_id)
);
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  assigned_to UUID REFERENCES participants(id),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'done')),
  is_standalone_expense BOOLEAN NOT NULL DEFAULT false,
  expense_amount NUMERIC(10,2),
  expense_paid_by UUID REFERENCES participants(id),
  created_by UUID NOT NULL REFERENCES participants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('task_claimed','task_done','expense_logged',
                    'deadline_approaching','settlement_reminder',
                    'participant_joined')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  actor_participant_id UUID NOT NULL REFERENCES participants(id),
  action TEXT NOT NULL
    CHECK (action IN ('task_created','task_claimed','task_completed',
                      'expense_logged','participant_joined','plan_created')),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_participants_plan ON participants(plan_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_tasks_plan ON tasks(plan_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_activity_plan ON activity_log(plan_id, created_at DESC);
CREATE INDEX idx_plans_invite ON plans(invite_code);
CREATE INDEX idx_plans_created_by ON plans(created_by);

-- =====================
-- RLS Policies
-- =====================

-- Plans
CREATE POLICY plans_select ON plans FOR SELECT USING (
  created_by = auth.uid()
  OR id IN (SELECT plan_id FROM participants WHERE user_id = auth.uid())
);
CREATE POLICY plans_insert ON plans FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY plans_update ON plans FOR UPDATE USING (created_by = auth.uid());

-- Participants
CREATE POLICY participants_select ON participants FOR SELECT USING (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);
CREATE POLICY participants_insert ON participants FOR INSERT WITH CHECK (
  plan_id IN (SELECT id FROM plans WHERE created_by = auth.uid())
  OR user_id = auth.uid()
);

-- Tasks
CREATE POLICY tasks_select ON tasks FOR SELECT USING (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);

-- Notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Activity log
CREATE POLICY activity_select ON activity_log FOR SELECT USING (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);

-- Profiles
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());

-- =====================
-- Triggers
-- =====================

-- Activity log trigger
CREATE OR REPLACE FUNCTION log_task_activity() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (plan_id, actor_participant_id, action, target_type, target_id, metadata)
    VALUES (NEW.plan_id, NEW.created_by,
      CASE WHEN NEW.is_standalone_expense THEN 'expense_logged' ELSE 'task_created' END,
      'task', NEW.id,
      jsonb_build_object('title', NEW.title, 'amount', NEW.expense_amount));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO activity_log (plan_id, actor_participant_id, action, target_type, target_id, metadata)
      VALUES (NEW.plan_id, NEW.assigned_to, 'task_claimed', 'task', NEW.id,
        jsonb_build_object('title', NEW.title));
    END IF;
    IF OLD.status = 'pending' AND NEW.status = 'done' THEN
      INSERT INTO activity_log (plan_id, actor_participant_id, action, target_type, target_id, metadata)
      VALUES (NEW.plan_id, COALESCE(NEW.assigned_to, NEW.created_by), 'task_completed', 'task', NEW.id,
        jsonb_build_object('title', NEW.title, 'amount', NEW.expense_amount));
    END IF;
    IF OLD.expense_amount IS NULL AND NEW.expense_amount IS NOT NULL THEN
      INSERT INTO activity_log (plan_id, actor_participant_id, action, target_type, target_id, metadata)
      VALUES (NEW.plan_id, COALESCE(NEW.expense_paid_by, NEW.assigned_to, NEW.created_by),
        'expense_logged', 'task', NEW.id,
        jsonb_build_object('title', NEW.title, 'amount', NEW.expense_amount));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_activity_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_activity();

-- Notification trigger
CREATE OR REPLACE FUNCTION notify_task_change() RETURNS TRIGGER AS $$
DECLARE
  _participant RECORD;
  _actor_name TEXT;
  _plan_title TEXT;
BEGIN
  SELECT name INTO _actor_name FROM participants
    WHERE id = COALESCE(NEW.assigned_to, NEW.created_by);
  SELECT title INTO _plan_title FROM plans WHERE id = NEW.plan_id;

  FOR _participant IN
    SELECT p.user_id FROM participants p
    WHERE p.plan_id = NEW.plan_id
      AND p.user_id IS NOT NULL
      AND p.user_id != auth.uid()
  LOOP
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'done' THEN
      INSERT INTO notifications (user_id, plan_id, type, title, body, data)
      VALUES (_participant.user_id, NEW.plan_id, 'task_done',
        _plan_title,
        _actor_name || ' completed "' || NEW.title || '"',
        jsonb_build_object('task_id', NEW.id));
    ELSIF TG_OP = 'UPDATE' AND OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO notifications (user_id, plan_id, type, title, body, data)
      VALUES (_participant.user_id, NEW.plan_id, 'task_claimed',
        _plan_title,
        _actor_name || ' claimed "' || NEW.title || '"',
        jsonb_build_object('task_id', NEW.id));
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_notification_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_change();

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE plans;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
