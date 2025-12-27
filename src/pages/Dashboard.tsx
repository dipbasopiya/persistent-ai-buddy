import { motion } from 'framer-motion';
import { 
  Activity, 
  Thermometer, 
  ListTodo, 
  Brain,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { TemperatureWidget } from '@/components/dashboard/TemperatureWidget';
import { ConfidenceWidget } from '@/components/dashboard/ConfidenceWidget';
import { DecisionWidget } from '@/components/dashboard/DecisionWidget';
import { DevicesWidget } from '@/components/dashboard/DevicesWidget';
import { TasksWidget } from '@/components/dashboard/TasksWidget';
import { LogsWidget } from '@/components/dashboard/LogsWidget';
import { useJarvis } from '@/contexts/JarvisContext';

export function Dashboard() {
  const { tasks, devices, logs, confidence } = useJarvis();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const activeDevices = devices.filter(d => d.isOn).length;
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.timestamp).toDateString();
    return logDate === new Date().toDateString();
  }).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your personal assistant overview
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl jarvis-glass jarvis-border-glow">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">JARVIS Active</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasks Completed"
          value={`${completedTasks}/${tasks.length}`}
          subtitle="Total progress"
          icon={<ListTodo className="w-6 h-6 text-primary-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Confidence Score"
          value={confidence.score}
          subtitle="Based on performance"
          icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
          variant={confidence.score >= 70 ? 'success' : confidence.score >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Active Devices"
          value={`${activeDevices}/${devices.length}`}
          subtitle="IoT devices"
          icon={<Activity className="w-6 h-6 text-primary-foreground" />}
        />
        <StatCard
          title="Today's Activity"
          value={todayLogs}
          subtitle="Log entries"
          icon={<Brain className="w-6 h-6 text-primary-foreground" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureWidget />
        <ConfidenceWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DecisionWidget />
        <DevicesWidget />
        <TasksWidget />
      </div>

      {/* Activity Log */}
      <LogsWidget />
    </motion.div>
  );
}

export default Dashboard;
