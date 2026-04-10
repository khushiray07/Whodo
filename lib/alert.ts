import { Alert, Platform } from 'react-native';
import { emitToast, emitConfirm } from './overlay-events';

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
