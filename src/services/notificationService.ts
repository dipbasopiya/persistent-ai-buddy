// Browser Notification Service with Sound Support

// Sound URLs for different notification types
const NOTIFICATION_SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  warning: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
  info: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3',
  default: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
} as const;

type SoundType = keyof typeof NOTIFICATION_SOUNDS;

let audioContext: AudioContext | null = null;
const audioCache: Map<string, AudioBuffer> = new Map();

// Initialize audio context on first user interaction
export function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play notification sound
export async function playNotificationSound(type: SoundType = 'default') {
  const soundEnabled = localStorage.getItem('jarvis-sound-enabled') !== 'false';
  if (!soundEnabled) return;

  try {
    const audio = new Audio(NOTIFICATION_SOUNDS[type]);
    audio.volume = 0.3;
    await audio.play();
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendBrowserNotification(
  title: string, 
  options?: NotificationOptions & { soundType?: SoundType }
): void {
  if (!('Notification' in window)) return;
  
  const notificationsEnabled = localStorage.getItem('jarvis-notifications-enabled') === 'true';
  
  if (Notification.permission === 'granted' && notificationsEnabled) {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
    
    // Play sound with notification
    if (options?.soundType) {
      playNotificationSound(options.soundType);
    }
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Sound settings
export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem('jarvis-sound-enabled', String(enabled));
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem('jarvis-sound-enabled') !== 'false';
}