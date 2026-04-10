type ToastEvent = {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'error' | 'success';
};

type ConfirmEvent = {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
};

type Handler<T> = (event: T) => void;

const toastHandlers = new Set<Handler<ToastEvent>>();
const confirmHandlers = new Set<Handler<ConfirmEvent>>();

let counter = 0;

export function emitToast(title: string, message?: string, type: ToastEvent['type'] = 'info') {
  const event: ToastEvent = { id: String(++counter), title, message, type };
  toastHandlers.forEach((h) => h(event));
}

export function onToast(handler: Handler<ToastEvent>): () => void {
  toastHandlers.add(handler);
  return () => { toastHandlers.delete(handler); };
}

export function emitConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'OK',
  cancelText = 'Cancel',
) {
  const event: ConfirmEvent = { id: String(++counter), title, message, confirmText, cancelText, onConfirm };
  confirmHandlers.forEach((h) => h(event));
}

export function onConfirm(handler: Handler<ConfirmEvent>): () => void {
  confirmHandlers.add(handler);
  return () => { confirmHandlers.delete(handler); };
}

export type { ToastEvent, ConfirmEvent };
