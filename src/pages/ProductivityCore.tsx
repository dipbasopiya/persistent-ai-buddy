import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { TasksModule } from '@/modules/tasks/TasksModule';
import { ProgressModule } from '@/modules/progress/ProgressModule';

export function ProductivityCore() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold jarvis-gradient-text">Productivity Core</h1>
          <p className="text-muted-foreground text-sm">Task management & performance analytics</p>
        </div>
      </div>

      <TasksModule />
      <ProgressModule />
    </motion.div>
  );
}

export default ProductivityCore;
