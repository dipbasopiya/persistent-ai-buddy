import { motion } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle,
  Zap,
  History,
  TrendingUp,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const decisionStyles = {
  'proceed': { 
    icon: CheckCircle2, 
    color: 'text-success', 
    bg: 'bg-success/10',
    border: 'border-success/30',
    label: 'Proceed'
  },
  'attention': { 
    icon: AlertTriangle, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    label: 'Needs Attention'
  },
  'reschedule': { 
    icon: Clock, 
    color: 'text-primary', 
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    label: 'Reschedule'
  },
  'high-risk': { 
    icon: XCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'High Risk'
  },
};

export function DecisionsPage() {
  const { decisions, tasks, confidence, addDecision, logs } = useJarvis();

  // Calculate current status
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;
  const recentAlerts = logs.filter(l => 
    l.severity === 'error' || l.severity === 'warning'
  ).slice(-5).length;

  const calculateDecision = () => {
    if (overdueTasks > 2 || confidence.score < 40) {
      return 'high-risk';
    }
    if (overdueTasks > 0 || confidence.score < 60) {
      return 'attention';
    }
    if (pendingTasks > 5) {
      return 'reschedule';
    }
    return 'proceed';
  };

  const currentStatus = calculateDecision();
  const StatusStyle = decisionStyles[currentStatus];
  const StatusIcon = StatusStyle.icon;

  const handleGenerateDecision = () => {
    const reasons: Record<string, string> = {
      'proceed': 'All metrics are within acceptable ranges. Continue with current workflow.',
      'attention': 'Some tasks or metrics need attention. Review pending items and adjust priorities.',
      'reschedule': 'Task queue is getting large. Consider reorganizing your schedule.',
      'high-risk': 'Multiple critical issues detected. Immediate action required.',
    };

    const factorsList = [
      `Confidence Score: ${confidence.score}%`,
      `Pending Tasks: ${pendingTasks}`,
      `Overdue Tasks: ${overdueTasks}`,
      `Recent Alerts: ${recentAlerts}`,
    ];

    addDecision(
      currentStatus,
      `System Analysis - ${new Date().toLocaleDateString()}`,
      reasons[currentStatus],
      factorsList
    );
  };

  const recentDecisions = [...decisions].reverse().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">Decision Gate</h1>
          <p className="text-muted-foreground mt-1">AI-powered workflow analysis and recommendations</p>
        </div>
        <Button onClick={handleGenerateDecision} className="jarvis-gradient">
          <Brain className="w-4 h-4 mr-2" />
          Generate Decision
        </Button>
      </div>

      {/* Current Status */}
      <Card className={cn('jarvis-card overflow-hidden', StatusStyle.border)}>
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <motion.div
              className={cn('w-32 h-32 rounded-3xl flex items-center justify-center', StatusStyle.bg)}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <StatusIcon className={cn('w-16 h-16', StatusStyle.color)} />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn('text-4xl font-bold', StatusStyle.color)}>
                  {StatusStyle.label}
                </span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  StatusStyle.bg,
                  StatusStyle.color
                )}>
                  Current Status
                </span>
              </div>

              <p className="text-muted-foreground mb-4">
                {currentStatus === 'proceed' && 'All systems nominal. You are on track to meet your goals.'}
                {currentStatus === 'attention' && 'Some metrics need your attention. Review and take action.'}
                {currentStatus === 'reschedule' && 'Consider reorganizing your schedule for optimal productivity.'}
                {currentStatus === 'high-risk' && 'Critical issues detected. Immediate intervention recommended.'}
              </p>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-2xl font-bold">{confidence.score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-2xl font-bold">{pendingTasks}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className={cn('text-2xl font-bold', overdueTasks > 0 && 'text-destructive')}>
                    {overdueTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className={cn('text-2xl font-bold', recentAlerts > 2 && 'text-warning')}>
                    {recentAlerts}
                  </p>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(decisionStyles).map(([key, style]) => {
          const Icon = style.icon;
          const isActive = key === currentStatus;
          return (
            <Card 
              key={key} 
              className={cn(
                'jarvis-card transition-all',
                isActive && `${style.border} ${style.bg} jarvis-glow`
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', style.bg)}>
                    <Icon className={cn('w-6 h-6', style.color)} />
                  </div>
                  <div>
                    <p className={cn('font-semibold', isActive && style.color)}>
                      {style.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key === 'proceed' && 'All clear'}
                      {key === 'attention' && 'Review needed'}
                      {key === 'reschedule' && 'Reorganize'}
                      {key === 'high-risk' && 'Action required'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Decision History */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Decision History
          </CardTitle>
          <CardDescription>
            Previous system analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentDecisions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No decisions recorded yet. Click "Generate Decision" to start.
            </p>
          ) : (
            <div className="space-y-4">
              {recentDecisions.map((decision, index) => {
                const style = decisionStyles[decision.type];
                const Icon = style.icon;
                return (
                  <motion.div
                    key={decision.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border-l-4',
                      style.bg,
                      style.border
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', style.bg)}>
                        <Icon className={cn('w-5 h-5', style.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{decision.title}</p>
                          <span className={cn('text-sm font-medium', style.color)}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{decision.reason}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {decision.factors.map((factor, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-muted/50 rounded text-xs"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(decision.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DecisionsPage;
