import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Camera, 
  Flame, 
  Eye, 
  EyeOff, 
  Bell,
  Clock,
  Activity,
  Zap,
  Leaf,
  Sun,
  Snowflake,
  CloudRain,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function AlertsPage() {
  const { settings, updateSettings, addLog, triggerFireAlert, logs } = useJarvis();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const [isInactive, setIsInactive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get seasonal alerts
  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return { name: 'Spring', icon: Leaf, color: 'text-success', alerts: ['Allergy season - keep antihistamines handy', 'Perfect weather for outdoor exercise'] };
    if (month >= 5 && month <= 7) return { name: 'Summer', icon: Sun, color: 'text-warning', alerts: ['Stay hydrated - drink at least 8 glasses of water', 'Use sunscreen for outdoor activities', 'Avoid peak sun hours (11am-3pm)'] };
    if (month >= 8 && month <= 10) return { name: 'Autumn', icon: CloudRain, color: 'text-accent', alerts: ['Layer clothing for temperature changes', 'Prepare for earlier sunsets'] };
    return { name: 'Winter', icon: Snowflake, color: 'text-primary', alerts: ['Keep warm and dress in layers', 'Check heating systems regularly', 'Watch for icy conditions'] };
  };

  const season = getSeason();

  // Camera attention detection
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      updateSettings({ cameraEnabled: true });
      addLog('behavior', 'info', 'Camera attention detection activated');
    } catch (error) {
      addLog('behavior', 'error', 'Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    updateSettings({ cameraEnabled: false });
    addLog('behavior', 'info', 'Camera attention detection deactivated');
  };

  // Inactivity detection (simulated)
  const handleActivity = useCallback(() => {
    setLastActivityTime(new Date());
    if (isInactive) {
      setIsInactive(false);
      addLog('behavior', 'success', 'User activity detected - Welcome back!');
    }
  }, [isInactive, addLog]);

  useEffect(() => {
    if (!isCameraActive) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const inactiveSeconds = (now.getTime() - lastActivityTime.getTime()) / 1000;
      
      if (inactiveSeconds > settings.inactivityThreshold && !isInactive) {
        setIsInactive(true);
        addLog('behavior', 'warning', `Inactivity detected for ${settings.inactivityThreshold} seconds. Take a break or refocus!`);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isCameraActive, lastActivityTime, settings.inactivityThreshold, isInactive, addLog]);

  useEffect(() => {
    if (isCameraActive) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
      };
    }
  }, [isCameraActive, handleActivity]);

  // Recent behavior alerts
  const behaviorAlerts = logs
    .filter(l => l.type === 'behavior' || l.type === 'alert')
    .slice(-5)
    .reverse();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold jarvis-gradient-text">Alerts & Behavior</h1>
        <p className="text-muted-foreground mt-1">Smart monitoring and safety systems</p>
      </div>

      {/* Fire Alert */}
      <Card className="jarvis-card border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Flame className="w-6 h-6" />
            Fire Emergency Alert
          </CardTitle>
          <CardDescription>
            Simulate a fire emergency alert for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                <Flame className="w-8 h-8 text-destructive animate-pulse" />
              </div>
              <div>
                <p className="font-medium">Emergency Protocol</p>
                <p className="text-sm text-muted-foreground">
                  Triggers immediate alert with sound and visual warning
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={triggerFireAlert}
              className="jarvis-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              Trigger Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Alerts */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <season.icon className={cn('w-6 h-6', season.color)} />
            {season.name} Season Alerts
          </CardTitle>
          <CardDescription>
            AI-powered lifestyle suggestions based on current season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {season.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
              >
                <Bell className={cn('w-5 h-5', season.color)} />
                <p className="text-sm font-medium">{alert}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera Attention Detection */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Camera Attention Detection
          </CardTitle>
          <CardDescription>
            Monitor focus and detect inactivity using your camera (no images stored)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Enable Camera Monitoring</p>
                  <p className="text-sm text-muted-foreground">
                    Requires camera permission
                  </p>
                </div>
                <Switch 
                  checked={isCameraActive}
                  onCheckedChange={(checked) => checked ? startCamera() : stopCamera()}
                />
              </div>

              {isCameraActive && (
                <div className="space-y-4">
                  <div className={cn(
                    'flex items-center gap-3 p-4 rounded-xl',
                    isInactive ? 'bg-warning/10 border border-warning/30' : 'bg-success/10 border border-success/30'
                  )}>
                    {isInactive ? (
                      <>
                        <EyeOff className="w-5 h-5 text-warning" />
                        <div>
                          <p className="font-medium text-warning">Inactivity Detected</p>
                          <p className="text-sm text-muted-foreground">
                            No activity for {settings.inactivityThreshold}+ seconds
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium text-success">Active & Focused</p>
                          <p className="text-sm text-muted-foreground">
                            Last activity: just now
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Inactivity threshold: {settings.inactivityThreshold} seconds
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              {isCameraActive ? (
                <div className="relative rounded-xl overflow-hidden bg-muted aspect-video jarvis-border-glow">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                    LIVE
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted aspect-video flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Camera disabled</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Behavior Alerts */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Recent Behavior Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {behaviorAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No behavior alerts yet. Enable monitoring to start tracking.
            </p>
          ) : (
            <div className="space-y-2">
              {behaviorAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl',
                    alert.severity === 'error' && 'bg-destructive/10',
                    alert.severity === 'warning' && 'bg-warning/10',
                    alert.severity === 'success' && 'bg-success/10',
                    alert.severity === 'info' && 'bg-primary/10'
                  )}
                >
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    alert.severity === 'error' && 'text-destructive',
                    alert.severity === 'warning' && 'text-warning',
                    alert.severity === 'success' && 'text-success',
                    alert.severity === 'info' && 'text-primary'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AlertsPage;
