import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { TemperatureModule } from '@/modules/temperature/TemperatureModule';
import { AlertsModule } from '@/modules/alerts/AlertsModule';
import { CameraModule } from '@/modules/camera/CameraModule';

export function ContextMonitor() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold jarvis-gradient-text">Context Monitor</h1>
          <p className="text-muted-foreground text-sm">Environment & behavior intelligence</p>
        </div>
      </div>

      <TemperatureModule />
      <AlertsModule />
      <CameraModule />
    </motion.div>
  );
}

export default ContextMonitor;
