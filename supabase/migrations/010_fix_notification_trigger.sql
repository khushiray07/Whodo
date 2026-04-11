-- Fix: auth.uid() is NULL inside SECURITY DEFINER triggers.
-- Look up the actor's user_id from participants table instead.

DROP TRIGGER IF EXISTS task_notification_trigger ON tasks;

CREATE OR REPLACE FUNCTION notify_task_change() RETURNS TRIGGER AS $$
DECLARE
  _participant RECORD;
  _actor_name TEXT;
  _actor_user_id UUID;
  _plan_title TEXT;
BEGIN
  SELECT name, user_id INTO _actor_name, _actor_user_id FROM participants
    WHERE id = COALESCE(NEW.assigned_to, NEW.created_by);
  SELECT title INTO _plan_title FROM plans WHERE id = NEW.plan_id;

  FOR _participant IN
    SELECT p.user_id FROM participants p
    WHERE p.plan_id = NEW.plan_id
      AND p.user_id IS NOT NULL
      AND p.user_id != COALESCE(_actor_user_id, '00000000-0000-0000-0000-000000000000')
  LOOP
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'done' THEN
      INSERT INTO notifications (user_id, plan_id, type, title, body, data)
      VALUES (_participant.user_id, NEW.plan_id, 'task_done',
        _plan_title,
        COALESCE(_actor_name, 'Someone') || ' completed "' || NEW.title || '"',
        jsonb_build_object('task_id', NEW.id));
    ELSIF TG_OP = 'UPDATE' AND OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO notifications (user_id, plan_id, type, title, body, data)
      VALUES (_participant.user_id, NEW.plan_id, 'task_claimed',
        _plan_title,
        COALESCE(_actor_name, 'Someone') || ' claimed "' || NEW.title || '"',
        jsonb_build_object('task_id', NEW.id));
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_notification_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_change();
