-- Expense splits: per-expense participant subsets with custom weights
-- Enables Splitwise-style splitting (not everyone in every expense, custom ratios)

CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  UNIQUE(task_id, participant_id)
);

ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- RLS: same access as tasks (plan participants can read/write)
CREATE POLICY expense_splits_select ON expense_splits FOR SELECT USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN participants p ON p.plan_id = t.plan_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY expense_splits_insert ON expense_splits FOR INSERT WITH CHECK (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN participants p ON p.plan_id = t.plan_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY expense_splits_delete ON expense_splits FOR DELETE USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN participants p ON p.plan_id = t.plan_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE INDEX idx_expense_splits_task ON expense_splits(task_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE expense_splits;
