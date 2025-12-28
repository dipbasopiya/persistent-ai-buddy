import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Cloud, 
  CloudRain,
  Snowflake,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { getSeasonInfo } from '@/services/decisionEngine';
import { showAlertToast } from '@/services/toastService';

const conditionIcons: Record<string, typeof Sun> = {
  'Clear': Sun,
  'Sunny': Sun,
  'Cloudy': Cloud,
  'Partly Cloudy': Cloud,
  'Rainy': CloudRain,
  'Snowy': Snowflake,
};

export function TemperatureModule() {
  const { temperature, refreshTemperature, settings } = useJarvis();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayTemp = settings.temperatureUnit === 'fahrenheit' 
    ? Math.round(temperature.current * 9/5 + 32)
    : temperature.current;

  const tempUnit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshTemperature();
    
    if (temperature.current > 30) {
      showAlertToast('High temperature detected! Stay hydrated.', 'warning');
    } else if (temperature.current < 10) {
      showAlertToast('Low temperature! Dress warmly.', 'info');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getTemperatureAlerts = () => {
    const alerts = [];
    if (temperature.current > 30) {
      alerts.push({ type: 'warning', message: 'High temperature! Stay hydrated.' });
    }
    if (temperature.current < 10) {
      alerts.push({ type: 'info', message: 'Cold weather! Dress warmly.' });
    }
    if (temperature.humidity > 80) {
      alerts.push({ type: 'warning', message: 'High humidity levels.' });
    }
    if (temperature.humidity < 30) {
      alerts.push({ type: 'info', message: 'Low humidity detected.' });
    }
    return alerts;
  };

  const alerts = getTemperatureAlerts();
  const ConditionIcon = conditionIcons[temperature.condition] || Cloud;
  const season = getSeasonInfo();

  const chartData = temperature.history.map((entry) => ({
    time: new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: settings.temperatureUnit === 'fahrenheit' 
      ? Math.round(entry.temp * 9/5 + 32)
      : entry.temp,
  }));

  return (
    <div className="space-y-4">
      {/* Main Temperature Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border rounded-xl overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl jarvis-gradient flex items-center justify-center"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Thermometer className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                </motion.div>
                <div>
                  <p className="text-3xl md:text-5xl font-bold jarvis-gradient-text">
                    {displayTemp}{tempUnit}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground mt-1 flex items-center gap-2">
                    <ConditionIcon className="w-4 h-4" />
                    {temperature.condition}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{temperature.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Wind className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">12 km/h</p>
                  <p className="text-xs text-muted-foreground">Wind</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              className="mt-4 jarvis-gradient"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Season Card */}
        <Card className="bg-card border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">{season.emoji}</span>
              {season.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{season.suggestion}</p>
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <p className="text-xs font-medium text-primary">Recommendation</p>
              <p className="text-xs text-muted-foreground mt-1">
                {temperature.current > 25 ? 'Stay hydrated' : 'Bring a jacket'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                alert.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{alert.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Temperature History Chart */}
      <Card className="bg-card border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Temperature History</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#tempGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              <p>Click refresh to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TemperatureModule;
