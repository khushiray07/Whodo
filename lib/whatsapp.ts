import { Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export function buildWhatsAppUrl(text: string, phone?: string): string {
  const truncated = text.length > 200 ? text.slice(0, 197) + '...' : text;
  const encoded = encodeURIComponent(truncated);
  if (phone) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function buildInviteMessage(planTitle: string, inviteCode: string): string {
  return `Join "${planTitle}" on Whodo!\n\nhttps://whodo.app/join/${inviteCode}`;
}

export async function shareViaWhatsApp(planTitle: string, inviteCode: string): Promise<boolean> {
  const message = buildInviteMessage(planTitle, inviteCode);
  const url = buildWhatsAppUrl(message);

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch {}

  // Clipboard fallback
  await Clipboard.setStringAsync(message);
  Alert.alert('Link copied!', 'WhatsApp not available. Message copied to clipboard.');
  return false;
}

export async function sendReminder(
  fromName: string,
  toName: string,
  amount: number,
  phone?: string,
): Promise<boolean> {
  const message = `Hey ${toName}! You owe ${fromName} ₹${amount} on Whodo. Settle up kar! 💸`;

  try {
    const url = buildWhatsAppUrl(message, phone);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch {}

  // Clipboard fallback
  await Clipboard.setStringAsync(message);
  Alert.alert('Message copied!', 'WhatsApp not available. Reminder copied to clipboard.');
  return false;
}
