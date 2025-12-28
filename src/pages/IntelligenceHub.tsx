import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { DecisionModule } from '@/modules/decision/DecisionModule';
import { DevicesModule } from '@/modules/devices/DevicesModule';

export function IntelligenceHub() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold jarvis-gradient-text">Intelligence Hub</h1>
          <p className="text-muted-foreground text-sm">Decision & execution layer</p>
        </div>
      </div>

      <DecisionModule />
      <DevicesModule />
    </motion.div>
  );
}

export default IntelligenceHub;
