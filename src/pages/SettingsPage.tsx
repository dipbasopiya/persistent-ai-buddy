import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Mic, 
  Camera,
  Thermometer,
  Clock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { settings, updateSettings, addLog } = useJarvis();

  const handleReset = () => {
    updateSettings({
      theme: 'dark',
      temperatureUnit: 'celsius',
      notificationsEnabled: true,
      voiceEnabled: true,
      cameraEnabled: false,
      inactivityThreshold: 30,
    });
    addLog('system', 'info', 'Settings reset to defaults');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your JARVIS experience</p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how JARVIS looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={settings.theme === 'dark'}
                  onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
                />
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Temperature Unit</p>
                <p className="text-sm text-muted-foreground">Display temperature in Celsius or Fahrenheit</p>
              </div>
              <Select
                value={settings.temperatureUnit}
                onValueChange={(value) => updateSettings({ temperatureUnit: value as 'celsius' | 'fahrenheit' })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Voice Announcements</p>
                <p className="text-sm text-muted-foreground">Enable voice feedback</p>
              </div>
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => updateSettings({ voiceEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Behavior Monitoring */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Behavior Monitoring
            </CardTitle>
            <CardDescription>Configure attention detection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Camera Monitoring</p>
                <p className="text-sm text-muted-foreground">Enable attention detection</p>
              </div>
              <Switch
                checked={settings.cameraEnabled}
                onCheckedChange={(checked) => updateSettings({ cameraEnabled: checked })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Inactivity Threshold</p>
                  <p className="text-sm text-muted-foreground">
                    Alert after {settings.inactivityThreshold} seconds of inactivity
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">{settings.inactivityThreshold}s</span>
              </div>
              <Slider
                value={[settings.inactivityThreshold]}
                min={10}
                max={120}
                step={5}
                onValueChange={(value) => updateSettings({ inactivityThreshold: value[0] })}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              About JARVIS
            </CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">React + TypeScript</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">IndexedDB + localStorage</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-success font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online
              </span>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-xl jarvis-border-glow">
              <p className="text-sm font-medium text-primary">Design Engineering Project</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI Personal Assistant with modular architecture, persistent storage, and smart automation features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default SettingsPage;
