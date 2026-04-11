export type Profile = {
  id: string;
  display_name: string;
  phone: string | null;
  push_token: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type PlanStatus = 'active' | 'completed' | 'archived';
export type PlanTemplate = 'birthday' | 'trip' | 'chores' | 'hackathon' | 'dinner' | 'custom';

export type Plan = {
  id: string;
  title: string;
  event_date: string | null;
  status: PlanStatus;
  created_by: string;
  invite_code: string;
  template: PlanTemplate;
  created_at: string;
};

export type JoinedVia = 'organizer_added' | 'app_joined';

export type Participant = {
  id: string;
  plan_id: string;
  name: string;
  user_id: string | null;
  color: string;
  joined_via: JoinedVia;
  joined_at: string;
};

export type TaskStatus = 'pending' | 'done';

export type Task = {
  id: string;
  plan_id: string;
  title: string;
  assigned_to: string | null;
  deadline: string | null;
  status: TaskStatus;
  is_standalone_expense: boolean;
  expense_amount: number | null;
  expense_paid_by: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
};

export type NotificationType =
  | 'task_claimed'
  | 'task_done'
  | 'expense_logged'
  | 'deadline_approaching'
  | 'settlement_reminder'
  | 'participant_joined';

export type Notification = {
  id: string;
  user_id: string;
  plan_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export type ActivityAction =
  | 'task_created'
  | 'task_claimed'
  | 'task_completed'
  | 'expense_logged'
  | 'participant_joined'
  | 'plan_created';

export type ActivityLogEntry = {
  id: string;
  plan_id: string;
  actor_participant_id: string;
  action: ActivityAction;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_participant_id: string;
  content: string;
  created_at: string;
};

export type ExpenseSplit = {
  id: string;
  task_id: string;
  participant_id: string;
  weight: number;
};

export type Settlement = {
  from: Participant;
  to: Participant;
  amount: number;
};
