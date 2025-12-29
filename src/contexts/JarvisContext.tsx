import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
import {
  getCurrentPosition,
  fetchWeather,
  getSavedLocation,
  LocationData,
} from '@/services/weatherService';

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
  location: LocationData | null;
  isWeatherLoading: boolean;
  
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
  
  // Temperature & Location
  refreshTemperature: () => Promise<void>;
  updateLocation: (location: LocationData) => Promise<void>;
  
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
  const [location, setLocation] = useState<LocationData | null>(getSavedLocation);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const weatherIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Apply theme with system preference support
  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.classList.remove('light', 'dark');
      if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(settings.theme);
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Fetch real weather data (defined without addLog dependency to avoid circular)
  const fetchRealWeather = useCallback(async (loc: LocationData, logFn?: typeof addLog) => {
    setIsWeatherLoading(true);
    try {
      const weather = await fetchWeather(loc);
      const currentTemp = getTemperature();
      const newData: TemperatureData = {
        current: weather.temperature,
        humidity: weather.humidity,
        condition: weather.condition,
        lastFetched: new Date().toISOString(),
        locationName: loc.city || `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`,
        history: [
          ...currentTemp.history.slice(-23),
          { time: new Date().toISOString(), temp: weather.temperature },
        ],
      };
      saveTemperature(newData);
      setTemperature(newData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Initialize location and weather on first load
  useEffect(() => {
    const initWeather = async () => {
      let currentLocation = getSavedLocation();
      
      if (!currentLocation) {
        try {
          currentLocation = await getCurrentPosition();
          setLocation(currentLocation);
        } catch (error) {
          console.log('Geolocation failed, using default location');
          // Default to a fallback location
          currentLocation = { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA' };
          setLocation(currentLocation);
        }
      }

      if (currentLocation) {
        await fetchRealWeather(currentLocation);
      }
    };

    initWeather();
  }, []);

  // Set up weather refresh interval (every 10 minutes)
  useEffect(() => {
    if (weatherIntervalRef.current) {
      clearInterval(weatherIntervalRef.current);
    }

    weatherIntervalRef.current = setInterval(() => {
      const currentLoc = getSavedLocation();
      if (currentLoc) {
        fetchRealWeather(currentLoc);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      if (weatherIntervalRef.current) {
        clearInterval(weatherIntervalRef.current);
      }
    };
  }, [fetchRealWeather]);

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

  // Temperature - now fetches real data
  const refreshTemperature = useCallback(async () => {
    const currentLoc = location || getSavedLocation();
    if (currentLoc) {
      await fetchRealWeather(currentLoc);
    }
  }, [location, fetchRealWeather]);

  // Update location and fetch weather
  const updateLocation = useCallback(async (newLocation: LocationData) => {
    setLocation(newLocation);
    await fetchRealWeather(newLocation);
    addLog('system', 'info', `Location updated to ${newLocation.city || 'new location'}`);
  }, [fetchRealWeather, addLog]);

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
    location,
    isWeatherLoading,
    updateSettings,
    addTask,
    updateTask,
    deleteTask,
    addLog,
    clearAllLogs,
    toggleDevice,
    updateDeviceValue,
    refreshTemperature,
    updateLocation,
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
