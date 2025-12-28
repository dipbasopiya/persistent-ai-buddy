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
    
    // Show toast for temperature alerts
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
      alerts.push({ type: 'warning', message: 'High temperature! Stay hydrated and seek shade.' });
    }
    if (temperature.current < 10) {
      alerts.push({ type: 'info', message: 'Cold weather! Dress warmly.' });
    }
    if (temperature.humidity > 80) {
      alerts.push({ type: 'warning', message: 'High humidity levels detected.' });
    }
    if (temperature.humidity < 30) {
      alerts.push({ type: 'info', message: 'Low humidity. Consider using a humidifier.' });
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
    <div className="space-y-6">
      {/* Main Temperature Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 jarvis-card overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-8">
                <motion.div 
                  className="w-20 h-20 md:w-32 md:h-32 rounded-3xl jarvis-gradient flex items-center justify-center jarvis-glow-strong"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Thermometer className="w-10 h-10 md:w-16 md:h-16 text-primary-foreground" />
                </motion.div>
                <div>
                  <p className="text-4xl md:text-7xl font-bold jarvis-gradient-text">
                    {displayTemp}{tempUnit}
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground mt-2 flex items-center gap-2">
                    <ConditionIcon className="w-5 h-5 md:w-6 md:h-6" />
                    {temperature.condition}
                  </p>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-4 md:gap-6">
                <div className="text-center p-3 md:p-4 bg-muted/50 rounded-xl">
                  <Droplets className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-xl md:text-2xl font-bold">{temperature.humidity}%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center p-3 md:p-4 bg-muted/50 rounded-xl">
                  <Wind className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-xl md:text-2xl font-bold">12 km/h</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Wind</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-6">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full md:w-auto jarvis-gradient"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Season Card */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{season.emoji}</span>
              {season.name} Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm md:text-base">{season.suggestion}</p>
            <div className="mt-4 p-4 bg-primary/10 rounded-xl jarvis-border-glow">
              <p className="text-sm font-medium text-primary">AI Recommendation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on current conditions, {temperature.current > 25 ? 'stay hydrated and avoid prolonged sun exposure' : 'consider bringing a light jacket for outdoor activities'}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl',
                alert.type === 'warning' ? 'bg-warning/10 border border-warning/30' : 'bg-primary/10 border border-primary/30'
              )}
            >
              <AlertTriangle className={cn('w-5 h-5', alert.type === 'warning' ? 'text-warning' : 'text-primary')} />
              <p className="font-medium text-sm md:text-base">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Temperature History Chart */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle>Temperature History</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
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
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>No temperature history yet. Click refresh to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TemperatureModule;
