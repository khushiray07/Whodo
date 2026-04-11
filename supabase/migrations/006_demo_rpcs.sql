-- Demo RPCs for hackathon distribution
-- get_plan_stats: batch stats query (replaces N+1 in home screen)
-- claim_task: atomic task claim with optimistic locking
-- lookup_plan_by_invite: extended to include participant check

-- Batch plan stats — only returns stats for plans the caller participates in
CREATE OR REPLACE FUNCTION public.get_plan_stats(plan_ids UUID[])
RETURNS TABLE(plan_id UUID, participant_count BIGINT, pending_task_count BIGINT, total_expenses NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    p.id AS plan_id,
    (SELECT COUNT(*) FROM participants pt WHERE pt.plan_id = p.id) AS participant_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id AND t.status = 'pending') AS pending_task_count,
    (SELECT COALESCE(SUM(t.expense_amount), 0) FROM tasks t WHERE t.plan_id = p.id) AS total_expenses
  FROM unnest(plan_ids) AS pid(id)
  JOIN plans p ON p.id = pid.id
  -- Caller check: only return stats for plans the caller is a participant in
  WHERE EXISTS (
    SELECT 1 FROM participants pt2
    WHERE pt2.plan_id = p.id AND pt2.user_id = auth.uid()
  );
$$;

-- Atomic task claim with optimistic locking
-- Returns true if claim succeeded, false if already claimed
CREATE OR REPLACE FUNCTION public.claim_task(p_task_id UUID, p_claimer_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE tasks SET assigned_to = p_claimer_id
  WHERE id = p_task_id AND assigned_to IS NULL;
  RETURN FOUND;
END;
$$;

-- Replace lookup_plan_by_invite to also check if caller is already a participant
-- Must DROP first because return type changed (added already_joined column)
DROP FUNCTION IF EXISTS public.lookup_plan_by_invite(text);
CREATE OR REPLACE FUNCTION public.lookup_plan_by_invite(code TEXT)
RETURNS TABLE(id UUID, title TEXT, participant_count BIGINT, event_date DATE, already_joined BOOLEAN)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.title,
    COUNT(pt.id),
    p.event_date,
    EXISTS (
      SELECT 1 FROM participants pt2
      WHERE pt2.plan_id = p.id AND pt2.user_id = auth.uid()
    ) AS already_joined
  FROM plans p LEFT JOIN participants pt ON pt.plan_id = p.id
  WHERE p.invite_code = code AND p.status = 'active'
  GROUP BY p.id, p.title, p.event_date;
$$;
