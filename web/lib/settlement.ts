import type { Task, Participant, Settlement } from '../types/database';

export function computeSettlements(
  tasks: Task[],
  participants: Participant[],
): Settlement[] {
  if (participants.length <= 1) return [];

  const balances = new Map<string, number>();
  for (const p of participants) {
    balances.set(p.id, 0);
  }

  const expenses = tasks.filter((t) => t.expense_amount != null && t.expense_amount > 0);
  if (expenses.length === 0) return [];

  for (const expense of expenses) {
    const amount = expense.expense_amount!;
    const payerId = expense.expense_paid_by ?? expense.assigned_to ?? expense.created_by;

    const eligible = participants.filter(
      (p) => new Date(p.joined_at) <= new Date(expense.created_at),
    );
    if (eligible.length === 0) continue;

    const share = amount / eligible.length;

    balances.set(payerId, (balances.get(payerId) ?? 0) + amount);

    for (const p of eligible) {
      balances.set(p.id, (balances.get(p.id) ?? 0) - share);
    }
  }

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
