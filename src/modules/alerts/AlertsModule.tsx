import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Flame, 
  Bell,
  Zap,
  Leaf,
  Sun,
  Snowflake,
  CloudRain,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSeasonInfo } from '@/services/decisionEngine';
import { showFireAlertToast, showAlertToast } from '@/services/toastService';

const seasonIcons = {
  'Spring': Leaf,
  'Summer': Sun,
  'Autumn': CloudRain,
  'Winter': Snowflake,
};

const seasonColors = {
  'Spring': 'text-success',
  'Summer': 'text-warning',
  'Autumn': 'text-accent',
  'Winter': 'text-primary',
};

export function AlertsModule() {
  const { triggerFireAlert, logs } = useJarvis();
  const season = getSeasonInfo();
  const SeasonIcon = seasonIcons[season.name as keyof typeof seasonIcons] || Sun;
  const seasonColor = seasonColors[season.name as keyof typeof seasonColors] || 'text-primary';

  const handleFireAlert = () => {
    triggerFireAlert();
    showFireAlertToast();
  };

  // Recent behavior alerts
  const behaviorAlerts = logs
    .filter(l => l.type === 'behavior' || l.type === 'alert')
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-6">
      {/* Fire Alert */}
      <Card className="jarvis-card border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Flame className="w-6 h-6" />
            Fire Emergency Alert
          </CardTitle>
          <CardDescription>
            Simulate a fire emergency alert for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
                <Flame className="w-7 h-7 md:w-8 md:h-8 text-destructive animate-pulse" />
              </div>
              <div>
                <p className="font-medium">Emergency Protocol</p>
                <p className="text-sm text-muted-foreground">
                  Triggers immediate alert with visual warning
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleFireAlert}
              className="w-full md:w-auto jarvis-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              Trigger Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Alerts */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SeasonIcon className={cn('w-6 h-6', seasonColor)} />
            {season.name} Season Alerts
          </CardTitle>
          <CardDescription>
            AI-powered lifestyle suggestions based on current season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {season.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50"
              >
                <Bell className={cn('w-5 h-5 flex-shrink-0', seasonColor)} />
                <p className="text-sm font-medium">{alert}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Behavior Alerts */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {behaviorAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No alerts yet. Activity will be recorded here.
            </p>
          ) : (
            <div className="space-y-2">
              {behaviorAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl',
                    alert.severity === 'error' && 'bg-destructive/10',
                    alert.severity === 'warning' && 'bg-warning/10',
                    alert.severity === 'success' && 'bg-success/10',
                    alert.severity === 'info' && 'bg-primary/10'
                  )}
                >
                  <AlertTriangle className={cn(
                    'w-5 h-5 flex-shrink-0',
                    alert.severity === 'error' && 'text-destructive',
                    alert.severity === 'warning' && 'text-warning',
                    alert.severity === 'success' && 'text-success',
                    alert.severity === 'info' && 'text-primary'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AlertsModule;
