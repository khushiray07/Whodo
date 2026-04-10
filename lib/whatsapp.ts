import { Linking, Alert, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export function buildInviteLink(inviteCode: string): string {
  return `whodo://join/${inviteCode}`;
}

export function buildInviteMessage(planTitle: string, inviteCode: string): string {
  return `Join "${planTitle}" on Whodo! 🎯\n\nOpen in app: ${buildInviteLink(inviteCode)}\n\nOr use invite code: ${inviteCode}`;
}

export async function shareViaWhatsApp(planTitle: string, inviteCode: string): Promise<boolean> {
  const message = buildInviteMessage(planTitle, inviteCode);
  const encoded = encodeURIComponent(message);

  // Try whatsapp:// scheme first — this reliably opens WhatsApp
  const whatsappUrl = `whatsapp://send?text=${encoded}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }
  } catch {}

  // Fallback: native share sheet (works even without WhatsApp)
  try {
    await Share.share({
      message,
      ...(Platform.OS === 'ios' ? { url: buildInviteLink(inviteCode) } : {}),
    });
    return true;
  } catch {}

  // Last resort: clipboard
  await Clipboard.setStringAsync(message);
  Alert.alert('Link copied!', 'Message copied to clipboard. Share it with your group!');
  return false;
}

export async function sendReminder(
  fromName: string,
  toName: string,
  amount: number,
  phone?: string,
): Promise<boolean> {
  const message = `Hey ${toName}! You owe ${fromName} ₹${amount} on Whodo. Settle up kar! 💸`;
  const encoded = encodeURIComponent(message);

  // If we have a phone number, use wa.me with the number
  if (phone) {
    const url = `https://wa.me/${phone}?text=${encoded}`;
    try {
      await Linking.openURL(url);
      return true;
    } catch {}
  }

  // No phone — try whatsapp:// scheme
  const whatsappUrl = `whatsapp://send?text=${encoded}`;
  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }
  } catch {}

  // Fallback: native share sheet
  try {
    await Share.share({ message });
    return true;
  } catch {}

  // Last resort: clipboard
  await Clipboard.setStringAsync(message);
  Alert.alert('Message copied!', 'Reminder copied to clipboard.');
  return false;
}
