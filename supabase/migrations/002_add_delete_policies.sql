-- Add DELETE policies for plan deletion
-- Only the plan creator can delete the plan and its related data

-- Plans: only creator can delete
CREATE POLICY plans_delete ON plans FOR DELETE USING (created_by = auth.uid());

-- Participants: plan creator can delete participants
CREATE POLICY participants_delete ON participants FOR DELETE USING (
  plan_id IN (SELECT id FROM plans WHERE created_by = auth.uid())
);

-- Tasks: plan creator or plan participants can delete tasks
CREATE POLICY tasks_delete ON tasks FOR DELETE USING (
  plan_id IN (
    SELECT id FROM plans WHERE created_by = auth.uid()
    UNION
    SELECT plan_id FROM participants WHERE user_id = auth.uid()
  )
);

-- Notifications: user can delete their own notifications, or plan creator can delete plan notifications
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (
  user_id = auth.uid()
  OR plan_id IN (SELECT id FROM plans WHERE created_by = auth.uid())
);

-- Activity log: plan creator can delete activity logs
CREATE POLICY activity_delete ON activity_log FOR DELETE USING (
  plan_id IN (SELECT id FROM plans WHERE created_by = auth.uid())
);
