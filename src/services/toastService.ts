import { toast } from 'sonner';
import { playNotificationSound } from './notificationService';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showToast(type: ToastType, message: string, options?: ToastOptions) {
  const baseOptions = {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  };

  // Play sound based on toast type
  playNotificationSound(type);

  switch (type) {
    case 'success':
      toast.success(message, baseOptions);
      break;
    case 'warning':
      toast.warning(message, baseOptions);
      break;
    case 'error':
      toast.error(message, baseOptions);
      break;
    case 'info':
    default:
      toast.info(message, baseOptions);
      break;
  }
}

// Alert-specific toasts
export function showAlertToast(message: string, severity: 'info' | 'warning' | 'error' | 'success') {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
    success: '✅',
  };

  showToast(severity, `${icons[severity]} ${message}`, { duration: 5000 });
}

// Decision toasts
export function showDecisionToast(type: 'proceed' | 'attention' | 'reschedule' | 'high-risk') {
  const messages: Record<string, { text: string; type: ToastType }> = {
    'proceed': { text: 'All systems nominal - Proceed', type: 'success' },
    'attention': { text: 'Some metrics need attention', type: 'warning' },
    'reschedule': { text: 'Consider reorganizing schedule', type: 'info' },
    'high-risk': { text: 'Critical issues detected!', type: 'error' },
  };

  const msg = messages[type];
  showToast(msg.type, `Decision Gate: ${msg.text}`, { duration: 6000 });
}

// Device action toasts
export function showDeviceToast(deviceName: string, action: 'on' | 'off') {
  const emoji = action === 'on' ? '🟢' : '🔴';
  showToast('info', `${emoji} ${deviceName} turned ${action.toUpperCase()}`);
}

// Task reminder toasts
export function showTaskReminderToast(taskTitle: string) {
  showToast('warning', `📋 Task Reminder: ${taskTitle}`, { 
    duration: 8000,
    description: 'This task needs your attention'
  });
}

// Fire alert toast
export function showFireAlertToast() {
  showToast('error', '🔥 FIRE ALERT! Emergency detected!', {
    duration: 10000,
    description: 'Please evacuate immediately'
  });
}

// Permission error toast
export function showPermissionErrorToast(feature: string) {
  showToast('error', `Permission denied for ${feature}`, {
    description: 'Please enable permissions in your browser settings'
  });
}