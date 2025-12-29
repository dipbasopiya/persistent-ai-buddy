import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJarvis } from '@/contexts/JarvisContext';
import { cn } from '@/lib/utils';
import { formatIndiaDate } from '@/lib/dateUtils';

const priorityColors = {
  low: 'border-l-muted-foreground',
  medium: 'border-l-warning',
  high: 'border-l-destructive',
};

export function TasksWidget() {
  const { tasks, updateTask } = useJarvis();

  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const toggleComplete = async (task: typeof tasks[0]) => {
    await updateTask({
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? undefined : new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="jarvis-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Upcoming Tasks</h3>
        <Link 
          to="/tasks" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / (tasks.length || 1)) * 100}%` }}
            className="h-full jarvis-gradient"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {upcomingTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No pending tasks. You're all caught up!
          </p>
        ) : (
          upcomingTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-muted/50 border-l-4',
                priorityColors[task.priority]
              )}
            >
              <button
                onClick={() => toggleComplete(task)}
                className="flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-medium text-sm truncate',
                  task.status === 'completed' && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatIndiaDate(task.dueDate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
