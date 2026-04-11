CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants manage comments" ON task_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN tasks t ON t.plan_id = p.plan_id
      WHERE t.id = task_comments.task_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      JOIN tasks t ON t.plan_id = p.plan_id
      WHERE t.id = task_comments.task_id
      AND p.user_id = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
