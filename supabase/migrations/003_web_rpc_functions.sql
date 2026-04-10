-- Public RPC for invite code lookup (unauthenticated)
-- Returns only plan title, participant count, and date. No user data, no plan ID.
CREATE OR REPLACE FUNCTION public.lookup_plan_by_invite(code TEXT)
RETURNS TABLE(title TEXT, participant_count BIGINT, event_date DATE)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT p.title, COUNT(pt.id), p.event_date
  FROM plans p LEFT JOIN participants pt ON pt.plan_id = p.id
  WHERE p.invite_code = code AND p.status = 'active'
  GROUP BY p.id, p.title, p.event_date;
$$;

-- Public RPC for landing page stats (unauthenticated)
-- Returns aggregate counts only, no user data.
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(plans_count BIGINT, tasks_count BIGINT)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    (SELECT COUNT(*) FROM plans WHERE status = 'active'),
    (SELECT COUNT(*) FROM tasks);
$$;

-- Web push subscriptions table (for P1 web push notifications)
CREATE TABLE IF NOT EXISTS web_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_web_push_user ON web_push_subscriptions(user_id);

ALTER TABLE web_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions" ON web_push_subscriptions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
