import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface LogEntry {
  id: string;
  type: 'alert' | 'decision' | 'device' | 'behavior' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  timestamp: string;
}

export interface DeviceState {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'fan' | 'security' | 'appliance';
  isOn: boolean;
  value?: number;
  lastChanged: string;
}

export interface Decision {
  id: string;
  type: 'proceed' | 'attention' | 'reschedule' | 'high-risk';
  title: string;
  reason: string;
  factors: string[];
  timestamp: string;
}

export interface ActivitySession {
  id: string;
  startTime: string;
  endTime?: string;
  attentionEvents: { timestamp: string; type: 'active' | 'inactive' }[];
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  temperatureUnit: 'celsius' | 'fahrenheit';
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
  cameraEnabled: boolean;
  inactivityThreshold: number; // seconds
}

// IndexedDB Schema
interface JarvisDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-date': string };
  };
  logs: {
    key: string;
    value: LogEntry;
    indexes: { 'by-type': string; 'by-timestamp': string };
  };
  decisions: {
    key: string;
    value: Decision;
    indexes: { 'by-timestamp': string };
  };
  activitySessions: {
    key: string;
    value: ActivitySession;
    indexes: { 'by-start': string };
  };
}

let db: IDBPDatabase<JarvisDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<JarvisDB>> {
  if (db) return db;
  
  db = await openDB<JarvisDB>('jarvis-db', 1, {
    upgrade(database) {
      // Tasks store
      const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-date', 'dueDate');

      // Logs store
      const logStore = database.createObjectStore('logs', { keyPath: 'id' });
      logStore.createIndex('by-type', 'type');
      logStore.createIndex('by-timestamp', 'timestamp');

      // Decisions store
      const decisionStore = database.createObjectStore('decisions', { keyPath: 'id' });
      decisionStore.createIndex('by-timestamp', 'timestamp');

      // Activity sessions store
      const activityStore = database.createObjectStore('activitySessions', { keyPath: 'id' });
      activityStore.createIndex('by-start', 'startTime');
    },
  });

  return db;
}

// Settings (localStorage)
const SETTINGS_KEY = 'jarvis-settings';
const DEVICES_KEY = 'jarvis-devices';
const TEMPERATURE_KEY = 'jarvis-temperature';
const CONFIDENCE_KEY = 'jarvis-confidence';

export function getSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaults: Settings = {
    theme: 'system',
    temperatureUnit: 'celsius',
    notificationsEnabled: true,
    voiceEnabled: true,
    cameraEnabled: false,
    inactivityThreshold: 30,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Devices (localStorage for quick access)
export function getDevices(): DeviceState[] {
  const stored = localStorage.getItem(DEVICES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaults: DeviceState[] = [
    { id: '1', name: 'Living Room Light', type: 'light', isOn: false, lastChanged: new Date().toISOString() },
    { id: '2', name: 'Thermostat', type: 'thermostat', isOn: true, value: 22, lastChanged: new Date().toISOString() },
    { id: '3', name: 'Ceiling Fan', type: 'fan', isOn: false, value: 50, lastChanged: new Date().toISOString() },
    { id: '4', name: 'Security System', type: 'security', isOn: true, lastChanged: new Date().toISOString() },
    { id: '5', name: 'Smart TV', type: 'appliance', isOn: false, lastChanged: new Date().toISOString() },
    { id: '6', name: 'Bedroom Light', type: 'light', isOn: false, lastChanged: new Date().toISOString() },
  ];
  localStorage.setItem(DEVICES_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveDevices(devices: DeviceState[]): void {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

export function updateDevice(id: string, updates: Partial<DeviceState>): DeviceState[] {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === id);
  if (index !== -1) {
    devices[index] = { ...devices[index], ...updates, lastChanged: new Date().toISOString() };
    saveDevices(devices);
  }
  return devices;
}

// Temperature (localStorage)
export interface TemperatureData {
  current: number;
  humidity: number;
  condition: string;
  lastFetched: string;
  history: { time: string; temp: number }[];
  locationName?: string;
}

export function getTemperature(): TemperatureData {
  const stored = localStorage.getItem(TEMPERATURE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaults: TemperatureData = {
    current: 24,
    humidity: 55,
    condition: 'Clear',
    lastFetched: new Date().toISOString(),
    history: [],
  };
  localStorage.setItem(TEMPERATURE_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveTemperature(data: TemperatureData): void {
  localStorage.setItem(TEMPERATURE_KEY, JSON.stringify(data));
}

// Confidence Score (localStorage)
export interface ConfidenceData {
  score: number;
  factors: {
    taskCompletion: number;
    timeliness: number;
    consistency: number;
  };
  history: { date: string; score: number }[];
  lastCalculated: string;
}

export function getConfidence(): ConfidenceData {
  const stored = localStorage.getItem(CONFIDENCE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const defaults: ConfidenceData = {
    score: 75,
    factors: {
      taskCompletion: 80,
      timeliness: 70,
      consistency: 75,
    },
    history: [],
    lastCalculated: new Date().toISOString(),
  };
  localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveConfidence(data: ConfidenceData): void {
  localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(data));
}

// Tasks (IndexedDB)
export async function getTasks(): Promise<Task[]> {
  const database = await initDB();
  return database.getAll('tasks');
}

export async function addTask(task: Task): Promise<void> {
  const database = await initDB();
  await database.add('tasks', task);
}

export async function updateTask(task: Task): Promise<void> {
  const database = await initDB();
  await database.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('tasks', id);
}

// Logs (IndexedDB)
export async function getLogs(): Promise<LogEntry[]> {
  const database = await initDB();
  return database.getAll('logs');
}

export async function addLog(log: LogEntry): Promise<void> {
  const database = await initDB();
  await database.add('logs', log);
}

export async function clearLogs(): Promise<void> {
  const database = await initDB();
  await database.clear('logs');
}

// Decisions (IndexedDB)
export async function getDecisions(): Promise<Decision[]> {
  const database = await initDB();
  return database.getAll('decisions');
}

export async function addDecision(decision: Decision): Promise<void> {
  const database = await initDB();
  await database.add('decisions', decision);
}

// Activity Sessions (IndexedDB)
export async function getActivitySessions(): Promise<ActivitySession[]> {
  const database = await initDB();
  return database.getAll('activitySessions');
}

export async function addActivitySession(session: ActivitySession): Promise<void> {
  const database = await initDB();
  await database.add('activitySessions', session);
}

export async function updateActivitySession(session: ActivitySession): Promise<void> {
  const database = await initDB();
  await database.put('activitySessions', session);
}

// Helper to generate IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export data
export async function exportData(): Promise<string> {
  const database = await initDB();
  const data = {
    tasks: await database.getAll('tasks'),
    logs: await database.getAll('logs'),
    decisions: await database.getAll('decisions'),
    activitySessions: await database.getAll('activitySessions'),
    settings: getSettings(),
    devices: getDevices(),
    temperature: getTemperature(),
    confidence: getConfidence(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}
