import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Thermometer, 
  Fan, 
  Shield, 
  Tv, 
  Power,
  Zap,
  Activity,
  Clock,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { showDeviceToast } from '@/services/toastService';

const deviceIcons = {
  light: Lightbulb,
  thermostat: Thermometer,
  fan: Fan,
  security: Shield,
  appliance: Tv,
};

const deviceColors = {
  light: 'from-yellow-400 to-orange-500',
  thermostat: 'from-red-400 to-pink-500',
  fan: 'from-cyan-400 to-blue-500',
  security: 'from-green-400 to-emerald-500',
  appliance: 'from-purple-400 to-violet-500',
};

export function DevicesModule() {
  const { devices, toggleDevice, updateDeviceValue, logs } = useJarvis();

  const activeDevices = devices.filter(d => d.isOn).length;
  
  const deviceLogs = logs
    .filter(l => l.type === 'device')
    .slice(-5)
    .reverse();

  const handleToggle = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      toggleDevice(deviceId);
      showDeviceToast(device.name, device.isOn ? 'off' : 'on');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold jarvis-gradient-text">Device Control</h2>
          <p className="text-muted-foreground text-sm">Manage your smart home devices</p>
        </div>
        <div className="px-4 py-2 rounded-xl jarvis-glass jarvis-border-glow">
          <span className="text-sm">
            <span className="font-bold text-primary">{activeDevices}</span>
            <span className="text-muted-foreground">/{devices.length} Active</span>
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="jarvis-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl jarvis-gradient flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{activeDevices}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Active Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="jarvis-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-success" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{deviceLogs.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Recent Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="jarvis-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
                  {devices.find(d => d.type === 'security')?.isOn ? 'Armed' : 'Disarmed'}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Security</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {devices.map((device, index) => {
          const Icon = deviceIcons[device.type];
          const gradientClass = deviceColors[device.type];
          
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                'jarvis-card transition-all duration-300',
                device.isOn && 'jarvis-border-glow'
              )}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all',
                      device.isOn 
                        ? `bg-gradient-to-br ${gradientClass} shadow-lg` 
                        : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6 md:w-7 md:h-7 transition-colors',
                        device.isOn ? 'text-white' : 'text-muted-foreground'
                      )} />
                    </div>
                    <Switch
                      checked={device.isOn}
                      onCheckedChange={() => handleToggle(device.id)}
                    />
                  </div>

                  <h3 className="font-semibold text-base md:text-lg mb-1">{device.name}</h3>
                  <p className={cn(
                    'text-sm',
                    device.isOn ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {device.isOn ? 'Active' : 'Inactive'}
                  </p>

                  {device.isOn && device.value !== undefined && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      {device.type === 'thermostat' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Temperature</span>
                            <span className="font-bold text-primary">{device.value}°C</span>
                          </div>
                          <Slider
                            value={[device.value]}
                            min={16}
                            max={30}
                            step={1}
                            onValueChange={(value) => updateDeviceValue(device.id, value[0])}
                            className="w-full"
                          />
                        </div>
                      )}
                      {device.type === 'fan' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Speed</span>
                            <span className="font-bold text-primary">{device.value}%</span>
                          </div>
                          <Slider
                            value={[device.value]}
                            min={0}
                            max={100}
                            step={10}
                            onValueChange={(value) => updateDeviceValue(device.id, value[0])}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(device.lastChanged).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Device Activity */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No device activity yet. Toggle a device to see activity.
            </p>
          ) : (
            <div className="space-y-2">
              {deviceLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Power className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* IoT Integration Note */}
      <Card className="jarvis-card border-primary/30 bg-primary/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl jarvis-gradient flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base md:text-lg">IoT Integration Ready</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Designed for future ESP32 / IoT API integration. Connect physical devices via REST API.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="px-2 py-1 bg-muted/50 rounded-full text-xs">ESP32</div>
                <div className="px-2 py-1 bg-muted/50 rounded-full text-xs">MQTT</div>
                <div className="px-2 py-1 bg-muted/50 rounded-full text-xs">REST API</div>
                <div className="px-2 py-1 bg-muted/50 rounded-full text-xs">WebSocket</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DevicesModule;
