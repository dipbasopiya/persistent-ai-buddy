import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Activity,
  Award,
  Zap,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export function ProgressPage() {
  const { tasks, confidence, recalculateConfidence } = useJarvis();

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Prepare chart data
  const pieData = [
    { name: 'Completed', value: stats.completed, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: stats.inProgress, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: stats.pending, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  const confidenceHistory = confidence.history.slice(-14).map((entry, index) => ({
    day: `Day ${index + 1}`,
    score: entry.score,
  }));

  // Weekly progress (simulated)
  const weeklyData = [
    { day: 'Mon', tasks: 5, completed: 4 },
    { day: 'Tue', tasks: 3, completed: 3 },
    { day: 'Wed', tasks: 7, completed: 5 },
    { day: 'Thu', tasks: 4, completed: 4 },
    { day: 'Fri', tasks: 6, completed: 4 },
    { day: 'Sat', tasks: 2, completed: 2 },
    { day: 'Sun', tasks: 1, completed: 1 },
  ];

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

  const getProductivityFeedback = () => {
    if (confidence.score >= 80) {
      return {
        title: 'Outstanding Performance!',
        message: 'You are maintaining excellent productivity. Keep up the great work!',
        type: 'success',
      };
    }
    if (confidence.score >= 60) {
      return {
        title: 'Good Progress',
        message: 'You are on track. Consider prioritizing pending tasks to improve further.',
        type: 'info',
      };
    }
    if (confidence.score >= 40) {
      return {
        title: 'Room for Improvement',
        message: 'Focus on completing overdue tasks and maintaining consistency.',
        type: 'warning',
      };
    }
    return {
      title: 'Action Required',
      message: 'Your productivity score is low. Review your task list and prioritize urgent items.',
      type: 'error',
    };
  };

  const feedback = getProductivityFeedback();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">Work Progress</h1>
          <p className="text-muted-foreground mt-1">Track your productivity and performance metrics</p>
        </div>
        <Button onClick={recalculateConfidence} className="jarvis-gradient">
          <Zap className="w-4 h-4 mr-2" />
          Recalculate Score
        </Button>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Confidence Score
            </CardTitle>
            <CardDescription>
              Overall performance metric based on task completion, timeliness, and consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              {/* Main Score Circle */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 440' }}
                    animate={{ strokeDasharray: `${(confidence.score / 100) * 440} 440` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn('text-5xl font-bold', getScoreColor(confidence.score))}
                  >
                    {confidence.score}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm">Task Completion</span>
                    </div>
                    <span className="font-medium">{confidence.factors.taskCompletion}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence.factors.taskCompletion}%` }}
                      className="h-full jarvis-gradient rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-sm">Timeliness</span>
                    </div>
                    <span className="font-medium">{confidence.factors.timeliness}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence.factors.timeliness}%` }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-success" />
                      <span className="text-sm">Consistency</span>
                    </div>
                    <span className="font-medium">{confidence.factors.consistency}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence.factors.consistency}%` }}
                      className="h-full bg-success rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className={cn(
          'jarvis-card',
          feedback.type === 'success' && 'border-success/30 bg-success/5',
          feedback.type === 'warning' && 'border-warning/30 bg-warning/5',
          feedback.type === 'error' && 'border-destructive/30 bg-destructive/5'
        )}>
          <CardHeader>
            <CardTitle className="text-lg">AI Productivity Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn(
                'text-2xl font-bold',
                feedback.type === 'success' && 'text-success',
                feedback.type === 'warning' && 'text-warning',
                feedback.type === 'error' && 'text-destructive',
                feedback.type === 'info' && 'text-primary'
              )}>
                {feedback.title}
              </div>
              <p className="text-muted-foreground">{feedback.message}</p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Status: <span className={cn('font-medium', getScoreColor(confidence.score))}>
                    {getScoreLabel(confidence.score)}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence History */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {confidenceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={confidenceHistory}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No history data yet. Complete more tasks to build your history.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="jarvis-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center justify-center gap-8">
                <ResponsiveContainer width={200} height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: entry.color }}
                      />
                      <span className="text-sm">{entry.name}</span>
                      <span className="font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>No tasks yet. Add tasks to see distribution.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card className="jarvis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="tasks" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProgressPage;
