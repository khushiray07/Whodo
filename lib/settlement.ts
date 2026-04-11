import type { Task, Participant, ExpenseSplit, Settlement } from '../types/database';

export function computeSettlements(
  tasks: Task[],
  participants: Participant[],
  expenseSplits: ExpenseSplit[] = [],
): Settlement[] {
  if (participants.length <= 1) return [];

  const balances = new Map<string, number>();
  for (const p of participants) {
    balances.set(p.id, 0);
  }

  const expenses = tasks.filter((t) => t.expense_amount != null && t.expense_amount > 0);
  if (expenses.length === 0) return [];

  // Index splits by task_id for fast lookup
  const splitsByTask = new Map<string, ExpenseSplit[]>();
  for (const split of expenseSplits) {
    const arr = splitsByTask.get(split.task_id) ?? [];
    arr.push(split);
    splitsByTask.set(split.task_id, arr);
  }

  for (const expense of expenses) {
    const amount = expense.expense_amount!;
    const payerId = expense.expense_paid_by ?? expense.assigned_to ?? expense.created_by;

    const customSplits = splitsByTask.get(expense.id);

    if (customSplits && customSplits.length > 0) {
      // Custom split: divide by weights among specified participants
      const totalWeight = customSplits.reduce((sum, s) => sum + s.weight, 0);
      if (totalWeight <= 0) continue;

      // Payer gets credit
      balances.set(payerId, (balances.get(payerId) ?? 0) + amount);

      // Each split participant gets debited their weighted share
      for (const split of customSplits) {
        const share = (split.weight / totalWeight) * amount;
        balances.set(split.participant_id, (balances.get(split.participant_id) ?? 0) - share);
      }
    } else {
      // Default: equal split among all eligible participants (joined before expense)
      const eligible = participants.filter(
        (p) => new Date(p.joined_at) <= new Date(expense.created_at),
      );
      if (eligible.length === 0) continue;

      const share = amount / eligible.length;

      // Payer gets credit
      balances.set(payerId, (balances.get(payerId) ?? 0) + amount);

      // Everyone (including payer) gets debited their share
      for (const p of eligible) {
        balances.set(p.id, (balances.get(p.id) ?? 0) - share);
      }
    }
  }

  // Build settlement list using greedy algorithm
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, balance] of balances) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ id, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const settlements: Settlement[] = [];

  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].amount, creditors[ci].amount);
    if (transfer > 0.01) {
      const fromP = participantMap.get(debtors[di].id);
      const toP = participantMap.get(creditors[ci].id);
      if (fromP && toP) {
        settlements.push({
          from: fromP,
          to: toP,
          amount: Math.round(transfer * 100) / 100,
        });
      }
    }

    debtors[di].amount -= transfer;
    creditors[ci].amount -= transfer;

    if (debtors[di].amount < 0.01) di++;
    if (creditors[ci].amount < 0.01) ci++;
  }

  return settlements;
}
