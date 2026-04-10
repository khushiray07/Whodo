import { Linking, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showAlert } from './alert';

const WEB_DOMAIN = 'https://whodo.space';

export function buildInviteLink(inviteCode: string): string {
  return `${WEB_DOMAIN}/join/${inviteCode}`;
}

export function buildInviteMessage(planTitle: string, inviteCode: string): string {
  const link = buildInviteLink(inviteCode);
  return `Join "${planTitle}" on Whodo! 🎯\n\n👉 ${link}\n\nOr use code: ${inviteCode}`;
}

function openURL(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

export async function shareViaWhatsApp(planTitle: string, inviteCode: string): Promise<boolean> {
  const message = buildInviteMessage(planTitle, inviteCode);
  const encoded = encodeURIComponent(message);

  if (Platform.OS === 'web') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${planTitle}" on Whodo`,
          text: message,
          url: buildInviteLink(inviteCode),
        });
        return true;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    return true;
  }

  // Native: try whatsapp:// scheme first
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
    await Share.share({
      message,
      ...(Platform.OS === 'ios' ? { url: buildInviteLink(inviteCode) } : {}),
    });
    return true;
  } catch {}

  // Last resort: clipboard
  await Clipboard.setStringAsync(message);
  showAlert('Link copied!', 'Message copied to clipboard. Share it with your group!');
  return false;
}

export async function sendReminder(
  fromName: string,
  toName: string,
  amount: number,
  planTitle: string,
  planId: string,
  phone?: string,
): Promise<boolean> {
  const planLink = `${WEB_DOMAIN}/plan/${planId}/settle`;
  const message = `Hey ${toName}! You owe ${fromName} ₹${amount} from "${planTitle}" on Whodo. Settle up kar! 💸\n\n👉 ${planLink}`;
  const encoded = encodeURIComponent(message);

  if (Platform.OS === 'web') {
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    return true;
  }

  if (phone) {
    try {
      await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
      return true;
    } catch {}
  }

  const whatsappUrl = `whatsapp://send?text=${encoded}`;
  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }
  } catch {}

  try {
    await Share.share({ message });
    return true;
  } catch {}

  await Clipboard.setStringAsync(message);
  showAlert('Message copied!', 'Reminder copied to clipboard.');
  return false;
}

export async function sendTaskReminder(
  assigneeName: string,
  taskTitle: string,
  planTitle: string,
  planId: string,
): Promise<boolean> {
  const planLink = `${WEB_DOMAIN}/plan/${planId}`;
  const message = `Hey ${assigneeName}! Reminder: "${taskTitle}" is still pending in "${planTitle}" on Whodo. Kar de yaar! 🙏\n\n👉 ${planLink}`;
  const encoded = encodeURIComponent(message);

  if (Platform.OS === 'web') {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    return true;
  }

  const whatsappUrl = `whatsapp://send?text=${encoded}`;
  try {
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    }
  } catch {}

  try {
    await Share.share({ message });
    return true;
  } catch {}

  await Clipboard.setStringAsync(message);
  showAlert('Reminder copied!', 'Message copied to clipboard.');
  return false;
}
