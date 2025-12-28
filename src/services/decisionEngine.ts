import { Task, ConfidenceData, LogEntry } from '@/lib/storage';

export type DecisionType = 'proceed' | 'attention' | 'reschedule' | 'high-risk';

export interface DecisionResult {
  type: DecisionType;
  title: string;
  reason: string;
  factors: string[];
}

export function calculateDecision(
  tasks: Task[],
  confidence: ConfidenceData,
  logs: LogEntry[]
): DecisionResult {
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;
  const recentAlerts = logs.filter(l => 
    l.severity === 'error' || l.severity === 'warning'
  ).slice(-5).length;

  const factorsList = [
    `Confidence Score: ${confidence.score}%`,
    `Pending Tasks: ${pendingTasks}`,
    `Overdue Tasks: ${overdueTasks}`,
    `Recent Alerts: ${recentAlerts}`,
  ];

  if (overdueTasks > 2 || confidence.score < 40) {
    return {
      type: 'high-risk',
      title: 'High Risk - Action Required',
      reason: 'Multiple critical issues detected. Immediate action required.',
      factors: factorsList,
    };
  }
  
  if (overdueTasks > 0 || confidence.score < 60) {
    return {
      type: 'attention',
      title: 'Needs Attention',
      reason: 'Some tasks or metrics need attention. Review pending items and adjust priorities.',
      factors: factorsList,
    };
  }
  
  if (pendingTasks > 5) {
    return {
      type: 'reschedule',
      title: 'Consider Rescheduling',
      reason: 'Task queue is getting large. Consider reorganizing your schedule.',
      factors: factorsList,
    };
  }
  
  return {
    type: 'proceed',
    title: 'Proceed',
    reason: 'All metrics are within acceptable ranges. Continue with current workflow.',
    factors: factorsList,
  };
}

export function getSeasonInfo(): { name: string; emoji: string; suggestion: string; alerts: string[] } {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) {
    return {
      name: 'Spring',
      emoji: '🌸',
      suggestion: 'Perfect time for outdoor activities! Consider light layers.',
      alerts: ['Allergy season - keep antihistamines handy', 'Perfect weather for outdoor exercise'],
    };
  }
  
  if (month >= 5 && month <= 7) {
    return {
      name: 'Summer',
      emoji: '☀️',
      suggestion: 'Stay cool with light clothing, use sunscreen, and drink plenty of water.',
      alerts: ['Stay hydrated - drink at least 8 glasses of water', 'Use sunscreen for outdoor activities', 'Avoid peak sun hours (11am-3pm)'],
    };
  }
  
  if (month >= 8 && month <= 10) {
    return {
      name: 'Autumn',
      emoji: '🍂',
      suggestion: 'Layer up for variable temperatures. Great for walks and outdoor events.',
      alerts: ['Layer clothing for temperature changes', 'Prepare for earlier sunsets'],
    };
  }
  
  return {
    name: 'Winter',
    emoji: '❄️',
    suggestion: 'Bundle up warmly! Keep indoor heating at a comfortable level.',
    alerts: ['Keep warm and dress in layers', 'Check heating systems regularly', 'Watch for icy conditions'],
  };
}

export function getProductivityFeedback(score: number): { title: string; message: string; type: 'success' | 'info' | 'warning' | 'error' } {
  if (score >= 80) {
    return {
      title: 'Outstanding Performance!',
      message: 'You are maintaining excellent productivity. Keep up the great work!',
      type: 'success',
    };
  }
  if (score >= 60) {
    return {
      title: 'Good Progress',
      message: 'You are on track. Consider prioritizing pending tasks to improve further.',
      type: 'info',
    };
  }
  if (score >= 40) {
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
}
