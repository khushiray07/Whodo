'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTasks } from '@/hooks/useTasks';
import { useParticipants } from '@/hooks/useParticipants';
import { computeSettlements } from '@/lib/settlement';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { strings } from '@/constants/strings';
import { format } from '@/lib/date';
import confetti from 'canvas-confetti';
import type { Plan } from '@/types/database';
import Link from 'next/link';

type Tab = 'tasks' | 'expenses' | 'settle';

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tab, setTab] = useState<Tab>('tasks');
  const [newTask, setNewTask] = useState('');
  const [newExpenseAmt, setNewExpenseAmt] = useState('');
  const [planLoading, setPlanLoading] = useState(true);
  const [prevAllDone, setPrevAllDone] = useState(false);

  const { tasks, pending, done, expenses, loading: tasksLoading, createTask, claimTask, completeTask, deleteTask } = useTasks(planId);
  const { participants, getMyParticipant } = useParticipants(planId);

  const settlements = computeSettlements(tasks, participants);
  const totalExpenses = expenses.reduce((sum, t) => sum + (t.expense_amount ?? 0), 0);
  const totalTasks = tasks.filter((t) => !t.is_standalone_expense).length;
  const doneTasks = done.length;

  // Fetch plan details
  useEffect(() => {
    async function fetchPlan() {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();
      setPlan(data as Plan | null);
      setPlanLoading(false);
    }
    fetchPlan();
  }, [planId]);

  // Confetti on 100% completion
  useEffect(() => {
    const allDone = totalTasks > 0 && doneTasks === totalTasks;
    if (allDone && !prevAllDone) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
    setPrevAllDone(allDone);
  }, [totalTasks, doneTasks, prevAllDone]);

  const handleCreateTask = useCallback(async () => {
    if (!newTask.trim()) return;
    const myP = await getMyParticipant();
    if (!myP) return;
    const amt = newExpenseAmt ? parseFloat(newExpenseAmt) : undefined;
    await createTask(myP.id, newTask.trim(), undefined, undefined, amt, amt ? myP.id : undefined);
    setNewTask('');
    setNewExpenseAmt('');
  }, [newTask, newExpenseAmt, getMyParticipant, createTask]);

  if (planLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container rounded-2xl animate-pulse" />)}</div>;
  }

  if (!plan) {
    return <div className="text-center py-16"><p className="text-on-surface-variant">Plan not found</p></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          {plan.event_date && <p className="text-sm text-on-surface-variant">{format(plan.event_date)}</p>}
        </div>
        <Link href={`/app/share/${plan.id}`}>
          <Button variant="secondary" className="text-sm">Share</Button>
        </Link>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>{doneTasks} of {totalTasks} tasks done</span>
            <span>{Math.round((doneTasks / totalTasks) * 100)}%</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {participants.map((p) => (
          <Avatar key={p.id} name={p.name} color={p.color} size={32} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30">
        {(['tasks', 'expenses', 'settle'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t === 'tasks' ? 'Tasks' : t === 'expenses' ? 'Expenses' : 'Settle'}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          {/* Create task input */}
          <div className="flex gap-2">
            <Input
              placeholder={strings.createTaskPlaceholder}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <Input
              placeholder="₹"
              value={newExpenseAmt}
              onChange={(e) => setNewExpenseAmt(e.target.value)}
              type="number"
              className="w-20"
            />
            <Button onClick={handleCreateTask} disabled={!newTask.trim()} className="shrink-0">+</Button>
          </div>

          {/* Pending tasks */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant mb-2">{strings.abhiKeKaam}</h3>
              <div className="space-y-2">
                {pending.map((task) => {
                  const assignee = participants.find((p) => p.id === task.assigned_to);
                  return (
                    <div key={task.id} className="bg-white rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                      {assignee ? (
                        <Avatar name={assignee.name} color={assignee.color} size={28} />
                      ) : (
                        <button
                          onClick={async () => {
                            const myP = await getMyParticipant();
                            if (myP) claimTask(task.id, myP.id);
                          }}
                          className="w-7 h-7 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-xs text-outline-variant hover:border-primary hover:text-primary transition-colors"
                        >
                          +
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex gap-2 text-xs text-on-surface-variant mt-0.5">
                          {task.expense_amount != null && <span>₹{task.expense_amount}</span>}
                          {task.deadline && <span>by {format(task.deadline)}</span>}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => completeTask(task.id)}
                        className="text-xs px-3 py-1.5"
                      >
                        Done
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Done tasks */}
          {done.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-on-surface-variant mb-2">{strings.hoGayeKaam}</h3>
              <div className="space-y-2 opacity-60">
                {done.map((task) => {
                  const assignee = participants.find((p) => p.id === task.assigned_to);
                  return (
                    <div key={task.id} className="bg-white rounded-2xl p-3 border border-outline-variant/10 flex items-center gap-3">
                      {assignee && <Avatar name={assignee.name} color={assignee.color} size={28} />}
                      <p className="flex-1 text-sm line-through">{task.title}</p>
                      <button onClick={() => deleteTask(task.id)} className="text-xs text-error hover:underline">Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pending.length === 0 && done.length === 0 && !tasksLoading && (
            <div className="text-center py-8">
              <p className="text-on-surface-variant">{strings.emptyTasksHint}</p>
              <p className="text-sm text-outline mt-1">{strings.emptyTasksSubHint}</p>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-2xl p-4 text-center">
            <p className="text-sm text-on-surface-variant">{strings.totalSpent}</p>
            <p className="text-3xl font-bold text-primary">₹{totalExpenses.toFixed(0)}</p>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-on-surface-variant">{strings.expensesEmpty}</p>
              <p className="text-sm text-outline mt-1">{strings.expensesEmptyHint}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((task) => {
                const payer = participants.find((p) => p.id === (task.expense_paid_by ?? task.assigned_to ?? task.created_by));
                return (
                  <div key={task.id} className="bg-white rounded-2xl p-3 border border-outline-variant/20 flex items-center gap-3">
                    {payer && <Avatar name={payer.name} color={payer.color} size={28} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {payer && <p className="text-xs text-on-surface-variant">paid by {payer.name}</p>}
                    </div>
                    <span className="text-sm font-semibold">₹{task.expense_amount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settle Tab */}
      {tab === 'settle' && (
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-2xl p-4 text-center">
            <p className="text-sm text-on-surface-variant">{strings.totalGroupSpend}</p>
            <p className="text-3xl font-bold text-primary">₹{totalExpenses.toFixed(0)}</p>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-on-surface-variant">{strings.expensesEmpty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-on-surface-variant">{strings.smartSettlements}</h3>
              {settlements.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-outline-variant/20 flex items-center gap-3">
                  <Avatar name={s.from.name} color={s.from.color} size={36} />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-on-surface-variant">owes</p>
                    <p className="text-lg font-bold text-primary">₹{s.amount}</p>
                  </div>
                  <Avatar name={s.to.name} color={s.to.color} size={36} />
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hey ${s.to.name}! I owe you ₹${s.amount} from "${plan.title}" on Whodo.`)}`}
                    target="_blank"
                    rel="noopener"
                    className="ml-2"
                  >
                    <Button variant="whatsapp" className="text-xs px-3 py-1.5">WhatsApp</Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
