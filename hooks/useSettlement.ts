import { useMemo } from 'react';
import { computeSettlements } from '../lib/settlement';
import type { Task, Participant, Settlement } from '../types/database';

export function useSettlement(tasks: Task[], participants: Participant[]) {
  const settlements = useMemo(
    () => computeSettlements(tasks, participants),
    [tasks, participants],
  );

  const totalSpent = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.expense_amount ?? 0), 0);
  }, [tasks]);

  const perPerson = useMemo(() => {
    if (participants.length === 0) return 0;
    return Math.round((totalSpent / participants.length) * 100) / 100;
  }, [totalSpent, participants.length]);

  return { settlements, totalSpent, perPerson };
}
