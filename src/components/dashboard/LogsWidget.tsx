import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJarvis } from '@/contexts/JarvisContext';
import { cn } from '@/lib/utils';

const severityStyles = {
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
};

export function LogsWidget() {
  const { logs } = useJarvis();

  const recentLogs = logs.slice(-5).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <Link 
          to="/logs" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {recentLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No activity yet
          </p>
        ) : (
          recentLogs.map((log) => {
            const { icon: Icon, color, bg } = severityStyles[log.severity];
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                  <Icon className={cn('w-4 h-4', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{log.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{log.type}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
