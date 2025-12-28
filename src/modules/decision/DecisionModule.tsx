import { motion } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle,
  Zap,
  History,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calculateDecision } from '@/services/decisionEngine';
import { showDecisionToast } from '@/services/toastService';

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

export function DecisionModule() {
  const { decisions, tasks, confidence, addDecision, logs } = useJarvis();

  const currentDecision = calculateDecision(tasks, confidence, logs);
  const StatusStyle = decisionStyles[currentDecision.type];
  const StatusIcon = StatusStyle.icon;

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;
  const recentAlerts = logs.filter(l => 
    l.severity === 'error' || l.severity === 'warning'
  ).slice(-5).length;

  const handleGenerateDecision = () => {
    addDecision(
      currentDecision.type,
      `System Analysis - ${new Date().toLocaleDateString()}`,
      currentDecision.reason,
      currentDecision.factors
    );
    showDecisionToast(currentDecision.type);
  };

  const recentDecisions = [...decisions].reverse().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold jarvis-gradient-text">Decision Gate</h2>
          <p className="text-muted-foreground text-sm">AI-powered workflow analysis</p>
        </div>
        <Button onClick={handleGenerateDecision} className="w-full md:w-auto jarvis-gradient">
          <Brain className="w-4 h-4 mr-2" />
          Generate Decision
        </Button>
      </div>

      {/* Current Status */}
      <Card className={cn('jarvis-card overflow-hidden', StatusStyle.border)}>
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <motion.div
              className={cn('w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center', StatusStyle.bg)}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <StatusIcon className={cn('w-12 h-12 md:w-16 md:h-16', StatusStyle.color)} />
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                <span className={cn('text-3xl md:text-4xl font-bold', StatusStyle.color)}>
                  {StatusStyle.label}
                </span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs md:text-sm font-medium',
                  StatusStyle.bg,
                  StatusStyle.color
                )}>
                  Current Status
                </span>
              </div>

              <p className="text-muted-foreground text-sm md:text-base mb-4">
                {currentDecision.reason}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold">{confidence.score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="p-2 md:p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold">{pendingTasks}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-2 md:p-3 bg-muted/50 rounded-xl text-center">
                  <p className={cn('text-xl md:text-2xl font-bold', overdueTasks > 0 && 'text-destructive')}>
                    {overdueTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
                <div className="p-2 md:p-3 bg-muted/50 rounded-xl text-center">
                  <p className={cn('text-xl md:text-2xl font-bold', recentAlerts > 2 && 'text-warning')}>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Object.entries(decisionStyles).map(([key, style]) => {
          const Icon = style.icon;
          const isActive = key === currentDecision.type;
          return (
            <Card 
              key={key} 
              className={cn(
                'jarvis-card transition-all',
                isActive && `${style.border} ${style.bg} jarvis-glow`
              )}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                  <div className={cn('w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center', style.bg)}>
                    <Icon className={cn('w-5 h-5 md:w-6 md:h-6', style.color)} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className={cn('font-semibold text-sm', isActive && style.color)}>
                      {style.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">
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
            <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto scrollbar-jarvis">
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
                      'p-3 md:p-4 rounded-xl border-l-4',
                      style.bg,
                      style.border
                    )}
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0', style.bg)}>
                        <Icon className={cn('w-4 h-4 md:w-5 md:h-5', style.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                          <p className="font-semibold text-sm md:text-base truncate">{decision.title}</p>
                          <span className={cn('text-xs md:text-sm font-medium', style.color)}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{decision.reason}</p>
                        <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                          {decision.factors.slice(0, 4).map((factor, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-muted/50 rounded text-xs truncate max-w-[150px]"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
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
    </div>
  );
}

export default DecisionModule;
