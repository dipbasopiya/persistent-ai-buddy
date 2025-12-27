import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Task,
  LogEntry,
  DeviceState,
  Decision,
  TemperatureData,
  ConfidenceData,
  getSettings,
  saveSettings,
  getDevices,
  saveDevices,
  updateDevice as updateDeviceStorage,
  getTemperature,
  saveTemperature,
  getConfidence,
  saveConfidence,
  getTasks,
  addTask as addTaskStorage,
  updateTask as updateTaskStorage,
  deleteTask as deleteTaskStorage,
  getLogs,
  addLog as addLogStorage,
  clearLogs,
  getDecisions,
  addDecision as addDecisionStorage,
  generateId,
  initDB,
} from '@/lib/storage';

interface JarvisContextType {
  // State
  settings: Settings;
  tasks: Task[];
  logs: LogEntry[];
  devices: DeviceState[];
  decisions: Decision[];
  temperature: TemperatureData;
  confidence: ConfidenceData;
  isLoading: boolean;
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Logs
  addLog: (type: LogEntry['type'], severity: LogEntry['severity'], message: string, details?: string) => Promise<void>;
  clearAllLogs: () => Promise<void>;
  
  // Devices
  toggleDevice: (id: string) => void;
  updateDeviceValue: (id: string, value: number) => void;
  
  // Temperature
  refreshTemperature: () => void;
  
  // Confidence
  recalculateConfidence: () => void;
  
  // Decisions
  addDecision: (type: Decision['type'], title: string, reason: string, factors: string[]) => Promise<void>;
  
  // Alerts
  triggerFireAlert: () => void;
}

const JarvisContext = createContext<JarvisContextType | null>(null);

export function JarvisProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [devices, setDevices] = useState<DeviceState[]>(getDevices);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [temperature, setTemperature] = useState<TemperatureData>(getTemperature);
  const [confidence, setConfidence] = useState<ConfidenceData>(getConfidence);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const [tasksData, logsData, decisionsData] = await Promise.all([
          getTasks(),
          getLogs(),
          getDecisions(),
        ]);
        setTasks(tasksData);
        setLogs(logsData);
        setDecisions(decisionsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
  }, [settings.theme]);

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Tasks
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await addTaskStorage(task);
    setTasks(prev => [...prev, task]);
    await addLogStorage({
      id: generateId(),
      type: 'system',
      severity: 'info',
      message: `Task created: ${task.title}`,
      timestamp: new Date().toISOString(),
    });
    setLogs(await getLogs());
  }, []);

  const updateTask = useCallback(async (task: Task) => {
    await updateTaskStorage(task);
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    await addLogStorage({
      id: generateId(),
      type: 'system',
      severity: 'info',
      message: `Task updated: ${task.title}`,
      timestamp: new Date().toISOString(),
    });
    setLogs(await getLogs());
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    await deleteTaskStorage(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    await addLogStorage({
      id: generateId(),
      type: 'system',
      severity: 'warning',
      message: `Task deleted: ${task?.title || 'Unknown'}`,
      timestamp: new Date().toISOString(),
    });
    setLogs(await getLogs());
  }, [tasks]);

  // Logs
  const addLog = useCallback(async (
    type: LogEntry['type'],
    severity: LogEntry['severity'],
    message: string,
    details?: string
  ) => {
    const log: LogEntry = {
      id: generateId(),
      type,
      severity,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    await addLogStorage(log);
    setLogs(prev => [...prev, log]);
  }, []);

  const clearAllLogs = useCallback(async () => {
    await clearLogs();
    setLogs([]);
  }, []);

  // Devices
  const toggleDevice = useCallback((id: string) => {
    const device = devices.find(d => d.id === id);
    const newDevices = updateDeviceStorage(id, { isOn: !device?.isOn });
    setDevices(newDevices);
    addLog('device', 'info', `${device?.name} turned ${device?.isOn ? 'OFF' : 'ON'}`);
  }, [devices, addLog]);

  const updateDeviceValue = useCallback((id: string, value: number) => {
    const device = devices.find(d => d.id === id);
    const newDevices = updateDeviceStorage(id, { value });
    setDevices(newDevices);
    addLog('device', 'info', `${device?.name} value set to ${value}`);
  }, [devices, addLog]);

  // Temperature
  const refreshTemperature = useCallback(() => {
    // Simulate temperature fetch
    const newTemp = Math.round(18 + Math.random() * 15);
    const newHumidity = Math.round(40 + Math.random() * 40);
    const conditions = ['Clear', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Sunny'];
    const newCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const newData: TemperatureData = {
      current: newTemp,
      humidity: newHumidity,
      condition: newCondition,
      lastFetched: new Date().toISOString(),
      history: [
        ...temperature.history.slice(-23),
        { time: new Date().toISOString(), temp: newTemp },
      ],
    };
    saveTemperature(newData);
    setTemperature(newData);

    // Generate alerts based on temperature
    if (newTemp > 30) {
      addLog('alert', 'warning', 'High temperature detected! Stay hydrated and avoid prolonged sun exposure.');
    } else if (newTemp < 10) {
      addLog('alert', 'warning', 'Low temperature detected! Dress warmly and stay comfortable.');
    }
  }, [temperature.history, addLog]);

  // Confidence
  const recalculateConfidence = useCallback(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length || 1;
    
    const taskCompletion = Math.round((completedTasks / totalTasks) * 100);
    
    // Calculate timeliness (completed on time)
    const onTimeTasks = tasks.filter(t => 
      t.status === 'completed' && 
      t.completedAt && 
      new Date(t.completedAt) <= new Date(t.dueDate)
    ).length;
    const timeliness = totalTasks > 0 ? Math.round((onTimeTasks / totalTasks) * 100) : 50;
    
    // Consistency based on activity
    const recentLogs = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });
    const consistency = Math.min(100, Math.round(recentLogs.length * 5));
    
    const score = Math.round((taskCompletion * 0.4 + timeliness * 0.35 + consistency * 0.25));
    
    const newData: ConfidenceData = {
      score,
      factors: { taskCompletion, timeliness, consistency },
      history: [
        ...confidence.history.slice(-29),
        { date: new Date().toISOString(), score },
      ],
      lastCalculated: new Date().toISOString(),
    };
    saveConfidence(newData);
    setConfidence(newData);
  }, [tasks, logs, confidence.history]);

  // Decisions
  const addDecision = useCallback(async (
    type: Decision['type'],
    title: string,
    reason: string,
    factors: string[]
  ) => {
    const decision: Decision = {
      id: generateId(),
      type,
      title,
      reason,
      factors,
      timestamp: new Date().toISOString(),
    };
    await addDecisionStorage(decision);
    setDecisions(prev => [...prev, decision]);
    await addLog('decision', 
      type === 'high-risk' ? 'error' : type === 'attention' ? 'warning' : 'info',
      `Decision: ${title}`,
      reason
    );
  }, [addLog]);

  // Fire Alert
  const triggerFireAlert = useCallback(() => {
    addLog('alert', 'error', '🔥 FIRE ALERT! Emergency detected! Please evacuate immediately.');
    addDecision(
      'high-risk',
      'Fire Emergency Detected',
      'System has detected a potential fire hazard. Immediate action required.',
      ['Smoke sensor triggered', 'Temperature spike detected', 'Emergency protocols activated']
    );
  }, [addLog, addDecision]);

  // Recalculate confidence on task changes
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      recalculateConfidence();
    }
  }, [tasks, isLoading]);

  const value: JarvisContextType = {
    settings,
    tasks,
    logs,
    devices,
    decisions,
    temperature,
    confidence,
    isLoading,
    updateSettings,
    addTask,
    updateTask,
    deleteTask,
    addLog,
    clearAllLogs,
    toggleDevice,
    updateDeviceValue,
    refreshTemperature,
    recalculateConfidence,
    addDecision,
    triggerFireAlert,
  };

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  );
}

export function useJarvis() {
  const context = useContext(JarvisContext);
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
}
