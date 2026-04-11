import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/database';

export function useTasks(planId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(undefined);

  const fetchTasks = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });
    setTasks(data ?? []);
    setLoading(false);
  }, [planId]);

  fetchRef.current = fetchTasks;

  useEffect(() => {
    fetchRef.current?.();

    if (!planId) return;

    const uid = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`tasks-${planId}-${uid}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `plan_id=eq.${planId}`,
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [planId]);

  const createTask = useCallback(async (
    participantId: string,
    title: string,
    assignedTo?: string,
    deadline?: string,
    expenseAmount?: number,
    expensePaidBy?: string,
  ) => {
    if (!planId) return;
    const isExpenseOnly = !title && !!expenseAmount;
    const { error } = await supabase.from('tasks').insert({
      plan_id: planId,
      title: title || 'Expense',
      assigned_to: assignedTo || null,
      deadline: deadline || null,
      status: 'pending',
      is_standalone_expense: isExpenseOnly,
      expense_amount: expenseAmount || null,
      expense_paid_by: expensePaidBy || null,
      created_by: participantId,
    });
    if (error) throw error;
  }, [planId]);

  const claimTask = useCallback(async (taskId: string, participantId: string) => {
    // Optimistic update
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigned_to: participantId } : t)),
    );

    try {
      const { data: claimed, error } = await supabase.rpc('claim_task', {
        p_task_id: taskId,
        p_claimer_id: participantId,
      });
      if (error) throw error;
      if (!claimed) throw new Error('Someone else grabbed this one!');
    } catch (err) {
      // Revert on failure
      setTasks(previousTasks);
      throw err;
    }
  }, [tasks]);

  const completeTask = useCallback(async (
    taskId: string,
    expenseAmount?: number,
    expensePaidBy?: string,
  ) => {
    const updates: Record<string, unknown> = {
      status: 'done',
      completed_at: new Date().toISOString(),
    };
    if (expenseAmount != null) {
      updates.expense_amount = expenseAmount;
      updates.expense_paid_by = expensePaidBy ?? undefined;
    }
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
    if (error) throw error;
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  }, []);

  const pending = tasks.filter((t) => t.status === 'pending' && !t.is_standalone_expense);
  const done = tasks.filter((t) => t.status === 'done' && !t.is_standalone_expense);
  const expenses = tasks.filter((t) => t.expense_amount != null && t.expense_amount > 0);

  return { tasks, pending, done, expenses, loading, fetchTasks, createTask, claimTask, completeTask, deleteTask };
}
