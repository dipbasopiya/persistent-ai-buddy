import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Activity } from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { cn } from '@/lib/utils';

export function ConfidenceWidget() {
  const { confidence } = useJarvis();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'At Risk';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Confidence Score</h3>
        <span className={cn('text-sm font-medium', getScoreColor(confidence.score))}>
          {getScoreLabel(confidence.score)}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(confidence.score / 100) * 352} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-3xl font-bold', getScoreColor(confidence.score))}>
              {confidence.score}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <FactorBar
            icon={<Target className="w-4 h-4" />}
            label="Task Completion"
            value={confidence.factors.taskCompletion}
          />
          <FactorBar
            icon={<Clock className="w-4 h-4" />}
            label="Timeliness"
            value={confidence.factors.timeliness}
          />
          <FactorBar
            icon={<Activity className="w-4 h-4" />}
            label="Consistency"
            value={confidence.factors.consistency}
          />
        </div>
      </div>
    </motion.div>
  );
}

function FactorBar({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full jarvis-gradient rounded-full"
        />
      </div>
    </div>
  );
}
