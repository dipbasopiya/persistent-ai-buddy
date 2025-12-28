import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  Clock,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { showAlertToast, showPermissionErrorToast } from '@/services/toastService';

export function CameraModule() {
  const { settings, updateSettings, addLog } = useJarvis();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const [isInactive, setIsInactive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      showAlertToast('Camera monitoring enabled', 'success');
    } catch (error) {
      addLog('behavior', 'error', 'Failed to access camera. Please check permissions.');
      showPermissionErrorToast('camera');
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
    showAlertToast('Camera monitoring disabled', 'info');
  };

  const handleActivity = useCallback(() => {
    setLastActivityTime(new Date());
    if (isInactive) {
      setIsInactive(false);
      addLog('behavior', 'success', 'User activity detected - Welcome back!');
      showAlertToast('Welcome back! Activity detected.', 'success');
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
        showAlertToast('Inactivity detected! Take a break or refocus.', 'warning');
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isCameraActive, lastActivityTime, settings.inactivityThreshold, isInactive, addLog]);

  useEffect(() => {
    if (isCameraActive) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('touchstart', handleActivity);

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
      };
    }
  }, [isCameraActive, handleActivity]);

  return (
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
                      <EyeOff className="w-5 h-5 text-warning flex-shrink-0" />
                      <div>
                        <p className="font-medium text-warning">Inactivity Detected</p>
                        <p className="text-sm text-muted-foreground">
                          No activity for {settings.inactivityThreshold}+ seconds
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 text-success flex-shrink-0" />
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
  );
}

export default CameraModule;
