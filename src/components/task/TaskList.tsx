import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Fab,
  Collapse,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,

} from '@mui/icons-material';
import { Task, TaskStatus, CreateTaskData, UpdateTaskData, TaskFilters, TaskSortBy } from '@/types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { taskService } from '@/services/taskService';

interface TaskListProps {
  projectId: string;
  onTaskCountChange?: (count: number, completedCount: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, onTaskCountChange }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filter and sort states
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: undefined,
    priority: undefined,
    assignedTo: '',
    tags: [],
    dueDateFrom: undefined,
    dueDateTo: undefined,
  });
  const [sortBy, setSortBy] = useState<TaskSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadTasks();
  }, [projectId, filters, sortBy, sortOrder]);

  useEffect(() => {
    if (onTaskCountChange) {
      const completedCount = tasks.filter(task => task.status === 'completed').length;
      onTaskCountChange(tasks.length, completedCount);
    }
  }, [tasks, onTaskCountChange]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getTasksByProject(projectId, user?.uid || '', {
          ...filters,
        });
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      await taskService.createTask(user?.uid || '', projectId, data);
      await loadTasks();
      setFormOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (id: string, data: UpdateTaskData) => {
    try {
      await taskService.updateTask(id, user?.uid || '', data);
      await loadTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const handleEditTask = async (data: UpdateTaskData) => {
    if (!editingTask) return;
    
    try {
      await taskService.updateTask(editingTask.id, user?.uid || '', data);
      await loadTasks();
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id, user?.uid || '');
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await taskService.updateTaskStatus(id, user?.uid || '', status);
      await loadTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      priority: undefined,
      assignedTo: '',
      tags: [],
      dueDateFrom: undefined,
      dueDateTo: undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.assignedTo) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    return count;
  };

  const groupedTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed'),
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Stack spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Box key={index}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2, borderRadius: 2 }} />
            </Box>
          ))}
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header with filters and sort */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tasks ({tasks.length})
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => setFiltersOpen(!filtersOpen)}
              color={getActiveFiltersCount() > 0 ? 'primary' : 'default'}
            >
              <FilterIcon />
              {getActiveFiltersCount() > 0 && (
                <Chip
                  label={getActiveFiltersCount()}
                  size="small"
                  sx={{ ml: 0.5, height: 16, fontSize: '0.7rem' }}
                />
              )}
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              size="small"
            >
              {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 2 }}>
            <Stack spacing={2}>
              <TextField
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority || ''}
                    label="Priority"
                    onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value as TaskSortBy)}
                  >
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="dueDate">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  onClick={clearFilters}
                  disabled={getActiveFiltersCount() === 0}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Collapse>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Task Groups */}
      {tasks.length === 0 ? (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ fontSize: 64, opacity: 0.3 }}>📋</Box>
            <Typography variant="h5" fontWeight="600" color="text.primary">
              No tasks found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {getActiveFiltersCount() > 0
                ? 'Try adjusting your filters or create a new task.'
                : 'Get started by creating your first task.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Create Task
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {/* To Do Tasks */}
          {groupedTasks.todo.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#9e9e9e', fontWeight: 600 }}>
                To Do ({groupedTasks.todo.length})
              </Typography>
              {groupedTasks.todo.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                />
              ))}
            </Paper>
          )}

          {/* In Progress Tasks */}
          {groupedTasks['in-progress'].length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#ff9800', fontWeight: 600 }}>
                In Progress ({groupedTasks['in-progress'].length})
              </Typography>
              {groupedTasks['in-progress'].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                />
              ))}
            </Paper>
          )}

          {/* Completed Tasks */}
          {groupedTasks.completed.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50', fontWeight: 600 }}>
                Completed ({groupedTasks.completed.length})
              </Typography>
              {groupedTasks.completed.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                />
              ))}
            </Paper>
          )}
        </Stack>
      )}

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add task"
        onClick={() => setFormOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Task Form */}
      <TaskForm
        open={formOpen || !!editingTask}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={async (data) => {
          if (editingTask) {
            await handleEditTask(data as UpdateTaskData);
          } else {
            await handleCreateTask(data as CreateTaskData);
          }
        }}
        initialData={editingTask || undefined}
        isEdit={!!editingTask}
        projectId={projectId}
      />
    </Box>
  );
};

export default TaskList;