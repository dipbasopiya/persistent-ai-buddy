import { motion } from 'framer-motion';
import { Lightbulb, Thermometer, Fan, Shield, Tv, Power } from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const deviceIcons = {
  light: Lightbulb,
  thermostat: Thermometer,
  fan: Fan,
  security: Shield,
  appliance: Tv,
};

export function DevicesWidget() {
  const { devices, toggleDevice } = useJarvis();

  const activeDevices = devices.filter(d => d.isOn).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Device Control</h3>
        <span className="text-sm text-muted-foreground">
          {activeDevices}/{devices.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {devices.slice(0, 4).map((device) => {
          const Icon = deviceIcons[device.type];
          return (
            <div
              key={device.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg transition-all',
                device.isOn ? 'bg-primary/10 jarvis-border-glow' : 'bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  device.isOn ? 'jarvis-gradient' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    device.isOn ? 'text-primary-foreground' : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <p className="font-medium text-sm">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.isOn ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <Switch
                checked={device.isOn}
                onCheckedChange={() => toggleDevice(device.id)}
              />
            </div>
          );
        })}
      </div>

      {devices.length > 4 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          +{devices.length - 4} more devices
        </p>
      )}
    </motion.div>
  );
}
