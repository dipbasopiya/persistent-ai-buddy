import { motion } from 'framer-motion';
import { Activity, Thermometer, ListTodo, Brain, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateDecision } from '@/services/decisionEngine';
import { cn } from '@/lib/utils';

const decisionColors = {
  'proceed': 'text-success',
  'attention': 'text-warning',
  'reschedule': 'text-primary',
  'high-risk': 'text-destructive',
};

export function CommandCenter() {
  const { tasks, devices, logs, confidence, temperature, settings, decisions } = useJarvis();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeDevices = devices.filter(d => d.isOn).length;
  const todayAlerts = logs.filter(l => {
    const logDate = new Date(l.timestamp).toDateString();
    return logDate === new Date().toDateString() && (l.severity === 'warning' || l.severity === 'error');
  }).length;

  const currentDecision = calculateDecision(tasks, confidence, logs);
  const latestDecision = decisions.length > 0 ? decisions[decisions.length - 1] : null;

  const displayTemp = settings.temperatureUnit === 'fahrenheit' 
    ? Math.round(temperature.current * 9/5 + 32)
    : temperature.current;
  const tempUnit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold jarvis-gradient-text">Command Center</h1>
          <p className="text-muted-foreground text-sm">System overview at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">JARVIS Active</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Temperature"
          value={`${displayTemp}${tempUnit}`}
          subtitle={temperature.condition}
          icon={<Thermometer className="w-4 h-4 text-primary-foreground" />}
        />
        <StatCard
          title="Active Alerts"
          value={todayAlerts}
          subtitle="Today"
          icon={<AlertTriangle className="w-4 h-4 text-primary-foreground" />}
          variant={todayAlerts > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Tasks"
          value={`${completedTasks}/${tasks.length}`}
          subtitle="Completed"
          icon={<ListTodo className="w-4 h-4 text-primary-foreground" />}
        />
        <StatCard
          title="Confidence"
          value={confidence.score}
          subtitle="Score"
          icon={<TrendingUp className="w-4 h-4 text-primary-foreground" />}
          variant={confidence.score >= 70 ? 'success' : confidence.score >= 50 ? 'warning' : 'danger'}
        />
      </div>

      {/* Decision & Devices Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Decision Gate Status */}
        <Card className="bg-card border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-primary" />
              Decision Gate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={cn('text-2xl md:text-3xl font-bold', decisionColors[currentDecision.type])}>
              {currentDecision.type === 'proceed' && 'Proceed'}
              {currentDecision.type === 'attention' && 'Attention'}
              {currentDecision.type === 'reschedule' && 'Reschedule'}
              {currentDecision.type === 'high-risk' && 'High Risk'}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{currentDecision.reason}</p>
            {latestDecision && (
              <p className="text-xs text-muted-foreground mt-2">
                Last: {new Date(latestDecision.timestamp).toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Devices Summary */}
        <Card className="bg-card border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" />
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-primary">{activeDevices}</span>
              <span className="text-muted-foreground text-sm">/ {devices.length} active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {devices.slice(0, 6).map((device) => (
                <div 
                  key={device.id}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-center text-xs truncate',
                    device.isOn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {device.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-jarvis">
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    log.severity === 'error' && 'bg-destructive',
                    log.severity === 'warning' && 'bg-warning',
                    log.severity === 'success' && 'bg-success',
                    log.severity === 'info' && 'bg-primary'
                  )} />
                  <p className="text-sm flex-1 truncate">{log.message}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CommandCenter;
