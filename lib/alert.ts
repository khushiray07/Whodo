import { Alert, Platform } from 'react-native';
import { emitToast, emitConfirm, emitActionSheet, type ActionSheetOption } from './overlay-events';

export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    emitToast(title, message, 'info');
  } else {
    Alert.alert(title, message);
  }
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'OK',
  cancelText = 'Cancel',
) {
  if (Platform.OS === 'web') {
    emitConfirm(title, message, onConfirm, confirmText, cancelText);
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export function showActionSheet(
  title: string,
  options: ActionSheetOption[],
  subtitle?: string,
) {
  if (Platform.OS === 'web') {
    emitActionSheet(title, options, subtitle);
  } else {
    Alert.alert(
      title,
      subtitle,
      [
        ...options.map((opt) => ({
          text: opt.text,
          style: (opt.destructive ? 'destructive' : 'default') as any,
          onPress: opt.onPress,
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }
}
