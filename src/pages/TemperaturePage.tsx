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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';

const conditionIcons: Record<string, typeof Sun> = {
  'Clear': Sun,
  'Sunny': Sun,
  'Cloudy': Cloud,
  'Partly Cloudy': Cloud,
  'Rainy': CloudRain,
  'Snowy': Snowflake,
};

export function TemperaturePage() {
  const { temperature, refreshTemperature, settings, logs } = useJarvis();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayTemp = settings.temperatureUnit === 'fahrenheit' 
    ? Math.round(temperature.current * 9/5 + 32)
    : temperature.current;

  const tempUnit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshTemperature();
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

  // Prepare chart data
  const chartData = temperature.history.map((entry, index) => ({
    time: new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: settings.temperatureUnit === 'fahrenheit' 
      ? Math.round(entry.temp * 9/5 + 32)
      : entry.temp,
  }));

  // Seasonal suggestion
  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return { name: 'Spring', emoji: '🌸', suggestion: 'Perfect time for outdoor activities! Consider light layers.' };
    if (month >= 5 && month <= 7) return { name: 'Summer', emoji: '☀️', suggestion: 'Stay cool with light clothing, use sunscreen, and drink plenty of water.' };
    if (month >= 8 && month <= 10) return { name: 'Autumn', emoji: '🍂', suggestion: 'Layer up for variable temperatures. Great for walks and outdoor events.' };
    return { name: 'Winter', emoji: '❄️', suggestion: 'Bundle up warmly! Keep indoor heating at a comfortable level.' };
  };

  const season = getSeason();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">Temperature Module</h1>
          <p className="text-muted-foreground mt-1">Real-time weather monitoring and alerts</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="jarvis-gradient"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Main Temperature Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 jarvis-card overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <motion.div 
                  className="w-32 h-32 rounded-3xl jarvis-gradient flex items-center justify-center jarvis-glow-strong"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Thermometer className="w-16 h-16 text-primary-foreground" />
                </motion.div>
                <div>
                  <p className="text-7xl font-bold jarvis-gradient-text">
                    {displayTemp}{tempUnit}
                  </p>
                  <p className="text-xl text-muted-foreground mt-2 flex items-center gap-2">
                    <ConditionIcon className="w-6 h-6" />
                    {temperature.condition}
                  </p>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Droplets className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{temperature.humidity}%</p>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <Wind className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">12 km/h</p>
                  <p className="text-sm text-muted-foreground">Wind</p>
                </div>
              </div>
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
            <p className="text-muted-foreground">{season.suggestion}</p>
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
              <p className="font-medium">{alert.message}</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
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
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No temperature history yet. Click refresh to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="jarvis-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {settings.temperatureUnit === 'fahrenheit' ? '95°F' : '35°C'}
                </p>
                <p className="text-sm text-muted-foreground">Today's High</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="jarvis-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {settings.temperatureUnit === 'fahrenheit' ? '59°F' : '15°C'}
                </p>
                <p className="text-sm text-muted-foreground">Today's Low</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="jarvis-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {settings.temperatureUnit === 'fahrenheit' ? '72°F' : '22°C'}
                </p>
                <p className="text-sm text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default TemperaturePage;
