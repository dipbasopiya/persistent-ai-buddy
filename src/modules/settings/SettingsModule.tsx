import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, BellOff, Monitor, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { playNotificationSound, isSoundEnabled, setSoundEnabled } from '@/services/notificationService';

export function SettingsModule() {
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      const stored = localStorage.getItem('jarvis-notifications-enabled');
      setNotificationsEnabled(stored === 'true' && Notification.permission === 'granted');
    }
    setSoundEnabledState(isSoundEnabled());
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`, { duration: 2000 });
    playNotificationSound('success');
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      playNotificationSound('error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('jarvis-notifications-enabled', 'true');
        toast.success('Notifications enabled');
        playNotificationSound('success');
        new Notification('JARVIS Notifications', {
          body: 'You will now receive alerts and reminders',
          icon: '/favicon.ico'
        });
      } else if (permission === 'denied') {
        toast.error('Notification permission denied');
        playNotificationSound('error');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
      playNotificationSound('error');
    }
  };

  const toggleNotifications = (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      setNotificationsEnabled(enabled);
      localStorage.setItem('jarvis-notifications-enabled', String(enabled));
      toast.info(enabled ? 'Notifications enabled' : 'Notifications disabled');
      playNotificationSound(enabled ? 'success' : 'info');
    }
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setSoundEnabled(enabled);
    toast.info(enabled ? 'Sound enabled' : 'Sound disabled');
    if (enabled) {
      playNotificationSound('success');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Theme Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="w-4 h-4 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('light')}
              size="sm"
              className="flex-1 min-w-[80px] gap-2"
            >
              <Sun className="w-4 h-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('dark')}
              size="sm"
              className="flex-1 min-w-[80px] gap-2"
            >
              <Moon className="w-4 h-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => handleThemeChange('system')}
              size="sm"
              className="flex-1 min-w-[80px] gap-2"
            >
              <Monitor className="w-4 h-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="w-4 h-4 text-primary" />
            Sound
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound" className="text-sm font-medium">
                Notification Sounds
              </Label>
              <p className="text-xs text-muted-foreground">
                Play sounds for alerts and actions
              </p>
            </div>
            <Switch
              id="sound"
              checked={soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive alerts for tasks and events
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>

          {notificationPermission === 'denied' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <BellOff className="w-4 h-4 text-destructive flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-destructive">Blocked</p>
                <p className="text-muted-foreground">Enable in browser settings</p>
              </div>
            </div>
          )}

          {notificationPermission === 'default' && (
            <Button onClick={requestNotificationPermission} variant="outline" size="sm" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Request Permission
            </Button>
          )}

          {notificationPermission === 'granted' && notificationsEnabled && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Bell className="w-4 h-4 text-green-500" />
              <p className="text-xs text-green-500">Notifications active</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SettingsModule;