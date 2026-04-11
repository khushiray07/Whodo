import { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { computeSettlements } from '../lib/settlement';
import type { Task, Participant, ExpenseSplit, Settlement } from '../types/database';

export function useSettlement(tasks: Task[], participants: Participant[]) {
  const [expenseSplits, setExpenseSplits] = useState<ExpenseSplit[]>([]);

  // Fetch expense splits for all tasks that have expenses
  useEffect(() => {
    const taskIds = tasks
      .filter((t) => t.expense_amount != null && t.expense_amount > 0)
      .map((t) => t.id);

    if (taskIds.length === 0) {
      setExpenseSplits([]);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('expense_splits')
        .select('*')
        .in('task_id', taskIds);
      setExpenseSplits(data ?? []);
    })();
  }, [tasks]);

  const settlements = useMemo(
    () => computeSettlements(tasks, participants, expenseSplits),
    [tasks, participants, expenseSplits],
  );

  const totalSpent = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.expense_amount ?? 0), 0);
  }, [tasks]);

  const perPerson = useMemo(() => {
    if (participants.length === 0) return 0;
    return Math.round((totalSpent / participants.length) * 100) / 100;
  }, [totalSpent, participants.length]);

  return { settlements, totalSpent, perPerson, expenseSplits };
}
