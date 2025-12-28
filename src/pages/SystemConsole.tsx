import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, FileText, Download, Search, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useJarvis } from '@/contexts/JarvisContext';
import { SettingsModule } from '@/modules/settings/SettingsModule';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const severityStyles = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  error: { color: 'text-red-400', bg: 'bg-red-500/20' },
  success: { color: 'text-green-400', bg: 'bg-green-500/20' },
};

function LogsSection() {
  const { logs, clearAllLogs } = useJarvis();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity =
        severityFilter === 'all' || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    })
    .reverse();

  const exportLogs = (format: 'json' | 'csv') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(filteredLogs, null, 2);
      filename = `jarvis-logs-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['Timestamp', 'Type', 'Severity', 'Message'];
      const rows = filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.type,
        log.severity,
        `"${log.message.replace(/"/g, '""')}"`,
      ]);
      content = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      filename = `jarvis-logs-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Control Logs
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs('json')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs('csv')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllLogs}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[400px] md:h-[500px] rounded-lg border border-border/50 bg-background/50">
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const style = severityStyles[log.severity] || severityStyles.info;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg ${style.bg} border border-border/30`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={style.color}>
                          {log.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{log.type}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{log.message}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </CardContent>
    </Card>
  );
}

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

      <div className="grid gap-6">
        <SettingsModule />
        <LogsSection />
      </div>
    </motion.div>
  );
}

export default SystemConsole;
