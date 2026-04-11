-- Add completed_task_count to plan stats RPC
CREATE OR REPLACE FUNCTION public.get_plan_stats(plan_ids UUID[])
RETURNS TABLE(plan_id UUID, participant_count BIGINT, pending_task_count BIGINT, completed_task_count BIGINT, total_expenses NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    p.id AS plan_id,
    (SELECT COUNT(*) FROM participants pt WHERE pt.plan_id = p.id) AS participant_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id AND t.status = 'pending') AS pending_task_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.plan_id = p.id AND t.status = 'done') AS completed_task_count,
    (SELECT COALESCE(SUM(t.expense_amount), 0) FROM tasks t WHERE t.plan_id = p.id) AS total_expenses
  FROM unnest(plan_ids) AS pid(id)
  JOIN plans p ON p.id = pid.id
  WHERE EXISTS (
    SELECT 1 FROM participants pt2
    WHERE pt2.plan_id = p.id AND pt2.user_id = auth.uid()
  );
$$;
