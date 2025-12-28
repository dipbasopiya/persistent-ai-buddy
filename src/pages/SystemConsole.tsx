import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { LogsModule } from '@/modules/logs/LogsModule';

export function SystemConsole() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold jarvis-gradient-text">System Console</h1>
          <p className="text-muted-foreground text-sm">Configuration and diagnostics</p>
        </div>
      </div>

      <LogsModule />
    </motion.div>
  );
}

export default SystemConsole;
