import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle,
  Trash2,
  Edit2,
  Flag,
  ListTodo,
} from 'lucide-react';
import { useJarvis } from '@/contexts/JarvisContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { showToast } from '@/services/toastService';
import { formatIndiaDate } from '@/lib/dateUtils';

const priorityColors = {
  low: 'border-l-muted-foreground text-muted-foreground',
  medium: 'border-l-warning text-warning',
  high: 'border-l-destructive text-destructive',
};

const statusColors = {
  pending: 'bg-muted/50',
  'in-progress': 'bg-primary/10 jarvis-border-glow',
  completed: 'bg-success/10',
};

export function TasksModule() {
  const { tasks, addTask, updateTask, deleteTask } = useJarvis();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
  });

  const handleSubmit = async () => {
    if (!newTask.title.trim()) return;

    if (editingTask) {
      await updateTask({
        ...editingTask,
        ...newTask,
      });
      showToast('success', 'Task updated successfully');
    } else {
      await addTask(newTask);
      showToast('success', 'Task created successfully');
    }

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      status: task.status,
    });
    setIsDialogOpen(true);
  };

  const toggleComplete = async (task: Task) => {
    await updateTask({
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
      completedAt: task.status === 'completed' ? undefined : new Date().toISOString(),
    });
    showToast(task.status === 'completed' ? 'info' : 'success', 
      task.status === 'completed' ? 'Task marked as pending' : 'Task completed!');
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    showToast('warning', `Task "${task.title}" deleted`);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  }).sort((a, b) => {
    const statusOrder = { pending: 0, 'in-progress': 1, completed: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold jarvis-gradient-text">Tasks & Schedule</h2>
          <p className="text-muted-foreground text-sm">Manage your daily activities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto jarvis-gradient" onClick={() => {
              setEditingTask(null);
              setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'pending',
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="jarvis-card border-border max-w-[95vw] md:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-background/50"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-background/50"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'low' | 'medium' | 'high' })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) => setNewTask({ ...newTask, status: value as 'pending' | 'in-progress' | 'completed' })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full jarvis-gradient">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="jarvis-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <ListTodo className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Circle className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs md:text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="jarvis-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-success" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={cn(filter === status && 'jarvis-gradient')}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Task List */}
      <Card className="jarvis-card">
        <CardContent className="p-4 md:p-6">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                No tasks found. Create one to get started!
              </motion.p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task, index) => {
                  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-l-4 transition-all',
                        priorityColors[task.priority],
                        statusColors[task.status],
                        isOverdue && 'border-destructive/50 bg-destructive/5'
                      )}
                    >
                      <button onClick={() => toggleComplete(task)} className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'font-medium text-sm md:text-base truncate',
                            task.status === 'completed' && 'line-through text-muted-foreground'
                          )}>
                            {task.title}
                          </p>
                          <Flag className={cn('w-3 h-3 md:w-4 md:h-4 flex-shrink-0', priorityColors[task.priority])} />
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatIndiaDate(task.dueDate)}
                          </span>
                          {isOverdue && (
                            <span className="text-xs text-destructive font-medium">Overdue!</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 md:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(task)}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(task)}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default TasksModule;
