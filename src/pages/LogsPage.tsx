import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportData } from '@/lib/storage';
import { cn } from '@/lib/utils';

const severityStyles = {
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
};

const typeLabels = {
  alert: 'Alert',
  decision: 'Decision',
  device: 'Device',
  behavior: 'Behavior',
  system: 'System',
};

export function LogsPage() {
  const { logs, clearAllLogs } = useJarvis();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  }).reverse();

  const handleExport = async (format: 'json' | 'csv') => {
    const data = await exportData();
    
    if (format === 'json') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jarvis-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Convert logs to CSV
      const csvData = JSON.parse(data);
      const logsArray = csvData.logs;
      const headers = ['ID', 'Type', 'Severity', 'Message', 'Details', 'Timestamp'];
      const rows = logsArray.map((log: any) => [
        log.id,
        log.type,
        log.severity,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.timestamp,
      ]);
      
      const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jarvis-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.severity === 'error').length,
    warnings: logs.filter(l => l.severity === 'warning').length,
    info: logs.filter(l => l.severity === 'info').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold jarvis-gradient-text">Control Logs</h1>
          <p className="text-muted-foreground mt-1">View and export all system activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button 
            variant="destructive" 
            onClick={clearAllLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="jarvis-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.errors}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.warnings}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.info}</p>
                <p className="text-sm text-muted-foreground">Info</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="decision">Decision</SelectItem>
            <SelectItem value="device">Device</SelectItem>
            <SelectItem value="behavior">Behavior</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <Card className="jarvis-card">
        <CardContent className="p-6">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {logs.length === 0 ? 'No logs yet. Activity will be recorded here.' : 'No logs match your filters.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-jarvis">
              {filteredLogs.map((log, index) => {
                const { icon: Icon, color, bg } = severityStyles[log.severity];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl',
                      bg
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                      <Icon className={cn('w-5 h-5', color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-sm font-medium', color)}>
                          {log.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {typeLabels[log.type]}
                        </span>
                      </div>
                      <p className="font-medium mt-1">{log.message}</p>
                      {log.details && (
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default LogsPage;
