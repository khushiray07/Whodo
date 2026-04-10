import type { Participant } from '../types/database';

export type ParsedTask = {
  title: string;
  assigneeName: string | null;
  assigneeId: string | null;
  amount: number | null;
  deadline: string | null;
  raw: string;
};

export function parseTaskInput(input: string, participants: Participant[]): ParsedTask {
  let text = input.trim();
  let assigneeName: string | null = null;
  let assigneeId: string | null = null;
  let amount: number | null = null;
  let deadline: string | null = null;

  // Extract amount: ₹500, 500rs, rs500, 500 rupees, Rs. 500
  const amountMatch = text.match(/(?:₹|rs\.?\s*|rupees?\s*)(\d+(?:\.\d+)?)/i)
    || text.match(/(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|rupees?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    text = text.replace(amountMatch[0], '').trim();
  }

  // Extract deadline: "by tomorrow", "by friday", "by 15th", "deadline 2025-06-05"
  const tomorrowMatch = text.match(/\b(?:by\s+)?tomorrow\b/i);
  if (tomorrowMatch) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    deadline = d.toISOString().split('T')[0];
    text = text.replace(tomorrowMatch[0], '').trim();
  }

  const dateMatch = text.match(/\b(?:by\s+)?(\d{4}-\d{2}-\d{2})\b/);
  if (dateMatch) {
    deadline = dateMatch[1];
    text = text.replace(dateMatch[0], '').trim();
  }

  // Find participant name in text (case-insensitive, longest match first)
  const sortedParticipants = [...participants].sort((a, b) => b.name.length - a.name.length);
  for (const p of sortedParticipants) {
    const nameRegex = new RegExp(`\\b${escapeRegex(p.name)}\\b`, 'i');
    if (nameRegex.test(text)) {
      assigneeName = p.name;
      assigneeId = p.id;
      text = text.replace(nameRegex, '').trim();
      break;
    }
  }

  // Also try common patterns: "X tu/ko/se ... kar/do/dena"
  // "assign to X", "X should", "X will", "for X"
  if (!assigneeId) {
    for (const p of sortedParticipants) {
      const patterns = [
        new RegExp(`(?:assign(?:ed)?\\s+to|for)\\s+${escapeRegex(p.name)}`, 'i'),
        new RegExp(`${escapeRegex(p.name)}\\s+(?:tu|ko|se|should|will|can|please)`, 'i'),
      ];
      for (const pat of patterns) {
        if (pat.test(input)) {
          assigneeName = p.name;
          assigneeId = p.id;
          text = text.replace(pat, '').trim();
          break;
        }
      }
      if (assigneeId) break;
    }
  }

  // Clean up common filler words at start/end
  text = text
    .replace(/^(?:tu|ko|se|please|can you|could you|should)\s+/i, '')
    .replace(/\s+(?:kar|karo|karna|kar dena|kar do|karde|please|asap)$/i, '')
    .replace(/^[-–—,\s]+|[-–—,\s]+$/g, '')
    .trim();

  // Capitalize first letter
  if (text) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return {
    title: text || input.trim(),
    assigneeName,
    assigneeId,
    amount,
    deadline,
    raw: input,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
