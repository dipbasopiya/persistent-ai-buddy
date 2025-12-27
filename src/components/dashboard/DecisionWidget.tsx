import { motion } from 'framer-motion';
import { Brain, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { cn } from '@/lib/utils';

const decisionStyles = {
  'proceed': { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  'attention': { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  'reschedule': { icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
  'high-risk': { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function DecisionWidget() {
  const { decisions, confidence, tasks } = useJarvis();
  
  const latestDecision = decisions[decisions.length - 1];
  
  // Calculate current status
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;

  const currentStatus = 
    overdueTasks > 2 || confidence.score < 40 ? 'high-risk' :
    overdueTasks > 0 || confidence.score < 60 ? 'attention' :
    pendingTasks > 5 ? 'reschedule' : 'proceed';

  const StatusIcon = decisionStyles[currentStatus].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Decision Gate
        </h3>
      </div>

      <div className={cn(
        'p-4 rounded-xl',
        decisionStyles[currentStatus].bg
      )}>
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('w-8 h-8', decisionStyles[currentStatus].color)} />
          <div>
            <p className={cn('font-semibold text-lg capitalize', decisionStyles[currentStatus].color)}>
              {currentStatus.replace('-', ' ')}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentStatus === 'proceed' && 'All systems nominal. Continue with current workflow.'}
              {currentStatus === 'attention' && 'Some tasks need attention. Review pending items.'}
              {currentStatus === 'reschedule' && 'Consider reorganizing your schedule.'}
              {currentStatus === 'high-risk' && 'Immediate attention required. High priority tasks overdue.'}
            </p>
          </div>
        </div>
      </div>

      {latestDecision && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Latest Decision</p>
          <p className="text-sm font-medium">{latestDecision.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(latestDecision.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-semibold">{pendingTasks}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-semibold text-destructive">{overdueTasks}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-semibold">{confidence.score}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
      </div>
    </motion.div>
  );
}
