import { motion } from 'framer-motion';
import { Thermometer, Droplets, Cloud, RefreshCw } from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';

export function TemperatureWidget() {
  const { temperature, refreshTemperature, settings } = useJarvis();

  const displayTemp = settings.temperatureUnit === 'fahrenheit' 
    ? Math.round(temperature.current * 9/5 + 32)
    : temperature.current;

  const tempUnit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const getTemperatureColor = () => {
    if (temperature.current > 30) return 'text-destructive';
    if (temperature.current < 10) return 'text-primary';
    return 'text-success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Temperature</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refreshTemperature}
          className="hover:bg-primary/10"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl jarvis-gradient flex items-center justify-center">
            <Thermometer className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <p className={`text-4xl font-bold ${getTemperatureColor()}`}>
              {displayTemp}{tempUnit}
            </p>
            <p className="text-sm text-muted-foreground">{temperature.condition}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            <div>
              <p className="text-lg font-semibold">{temperature.humidity}%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{temperature.condition}</p>
              <p className="text-xs text-muted-foreground">Condition</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Last updated: {new Date(temperature.lastFetched).toLocaleString()}
      </div>
    </motion.div>
  );
}
