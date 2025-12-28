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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold jarvis-gradient-text">Command Center</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">System overview at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl jarvis-glass jarvis-border-glow">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">JARVIS Active</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Temperature"
          value={`${displayTemp}${tempUnit}`}
          subtitle={temperature.condition}
          icon={<Thermometer className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />}
        />
        <StatCard
          title="Active Alerts"
          value={todayAlerts}
          subtitle="Today"
          icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />}
          variant={todayAlerts > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Tasks"
          value={`${completedTasks}/${tasks.length}`}
          subtitle="Completed"
          icon={<ListTodo className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />}
        />
        <StatCard
          title="Confidence"
          value={confidence.score}
          subtitle="Score"
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />}
          variant={confidence.score >= 70 ? 'success' : confidence.score >= 50 ? 'warning' : 'danger'}
        />
      </div>

      {/* Decision & Devices Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Gate Status */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Decision Gate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={cn('text-3xl md:text-4xl font-bold', decisionColors[currentDecision.type])}>
                {currentDecision.type === 'proceed' && 'Proceed'}
                {currentDecision.type === 'attention' && 'Attention'}
                {currentDecision.type === 'reschedule' && 'Reschedule'}
                {currentDecision.type === 'high-risk' && 'High Risk'}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-2">{currentDecision.reason}</p>
            {latestDecision && (
              <p className="text-xs text-muted-foreground mt-4">
                Last decision: {new Date(latestDecision.timestamp).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Devices Summary */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Devices Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {activeDevices}<span className="text-muted-foreground text-xl">/{devices.length}</span>
              </div>
              <span className="text-muted-foreground">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {devices.slice(0, 6).map((device) => (
                <div 
                  key={device.id}
                  className={cn(
                    'p-2 rounded-lg text-center text-xs',
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
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-jarvis">
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    log.severity === 'error' && 'bg-destructive',
                    log.severity === 'warning' && 'bg-warning',
                    log.severity === 'success' && 'bg-success',
                    log.severity === 'info' && 'bg-primary'
                  )} />
                  <p className="text-sm flex-1 truncate">{log.message}</p>
                  <span className="text-xs text-muted-foreground">
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
