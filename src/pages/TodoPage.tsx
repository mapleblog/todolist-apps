import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  Button,
  LinearProgress,
  Stack,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Today as TodayIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useTodos } from '../hooks/useTodos';
import { Todo, TodoPriority, CreateTodoData } from '@/types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import TodoForm from '../components/todo/TodoForm';



// 今日焦点组件
const TodayFocus: React.FC<{ todos: Todo[] }> = ({ todos }) => {
  const todayTodos = todos.filter(todo => 
    todo.dueDate && isToday(new Date(todo.dueDate)) && !todo.completed
  );
  
  const highPriorityTodos = todayTodos.filter(todo => todo.priority === 'high');
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <TodayIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Today's Focus
          </Typography>
        </Box>
        
        {todayTodos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No tasks for today. Great job! 🎉
          </Typography>
        ) : (
          <Stack spacing={1}>
            {highPriorityTodos.slice(0, 3).map(todo => (
              <Box 
                key={todo.id}
                sx={{ 
                  p: 1.5, 
                  borderRadius: 1, 
                  backgroundColor: alpha('#f44336', 0.05),
                  border: `1px solid ${alpha('#f44336', 0.2)}`
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {todo.title}
                </Typography>
                <Box display="flex" alignItems="center" mt={0.5}>
                  <FlagIcon sx={{ fontSize: 14, color: '#f44336', mr: 0.5 }} />
                  <Typography variant="caption" color="error">
                    High Priority
                  </Typography>
                </Box>
              </Box>
            ))}
            
            {todayTodos.length > 3 && (
              <Typography variant="caption" color="text.secondary" textAlign="center">
                +{todayTodos.length - 3} more tasks today
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

// 快速操作面板组件
const QuickActions: React.FC<{
  onAddNewTask: () => void;
  onViewDashboard: () => void;
  onScheduleReview: () => void;
}> = ({ onAddNewTask, onViewDashboard, onScheduleReview }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Quick Actions
        </Typography>
        
        <Stack spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            fullWidth
            onClick={onAddNewTask}
            sx={{ 
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Add New Task
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<AssignmentIcon />}
            fullWidth
            onClick={onViewDashboard}
            sx={{ 
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            View Dashboard
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ScheduleIcon />}
            fullWidth
            onClick={onScheduleReview}
            sx={{ 
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Schedule Review
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// 智能筛选栏组件
const SmartFilterBar: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'completed' | 'pending';
  onStatusFilterChange: (status: 'all' | 'completed' | 'pending') => void;
  priorityFilter: TodoPriority | 'all';
  onPriorityFilterChange: (priority: TodoPriority | 'all') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onNewTask: () => void;
}> = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  onNewTask
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'completed' | 'pending')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => onPriorityFilterChange(e.target.value as TodoPriority | 'all')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => onSortChange(e.target.value)}
            >
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewTask}
            fullWidth
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              },
              transition: 'all 0.2s ease',
              fontWeight: 'medium'
            }}
          >
            New Task
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

// 任务卡片组件
const TodoCard: React.FC<{
  todo: Todo;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}> = ({ todo, isSelected, onSelect, onToggleComplete, onEdit, onDelete }) => {
  const theme = useTheme();
  
  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  

  
  const isOverdue = todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed;
  
  return (
    <Card 
      sx={{ 
        mb: 1,
        transition: 'all 0.3s ease',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        },
        opacity: todo.completed ? 0.7 : 1
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(todo.id)}
            size="small"
          />
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography 
                variant="subtitle1" 
                fontWeight="medium"
                sx={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary'
                }}
              >
                {todo.title}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton size="small" onClick={() => onEdit(todo)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(todo.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {todo.description && (
              <Typography variant="body2" color="text.secondary" mb={1}>
                {todo.description}
              </Typography>
            )}
            
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Chip 
                label={todo.priority}
                size="small"
                sx={{ 
                  backgroundColor: alpha(getPriorityColor(todo.priority), 0.1),
                  color: getPriorityColor(todo.priority),
                  fontWeight: 'medium'
                }}
              />
              
              <Chip 
                label={todo.completed ? 'completed' : 'pending'}
                size="small"
                sx={{ 
                  backgroundColor: alpha(todo.completed ? '#4caf50' : '#ff9800', 0.1),
                  color: todo.completed ? '#4caf50' : '#ff9800',
                  fontWeight: 'medium'
                }}
              />
              
              {todo.category && (
                <Chip 
                  label={todo.category}
                  size="small"
                  variant="outlined"
                />
              )}
              
              {todo.dueDate && (
                <Chip 
                  label={isToday(new Date(todo.dueDate)) ? 'Today' : 
                         isTomorrow(new Date(todo.dueDate)) ? 'Tomorrow' :
                         format(new Date(todo.dueDate), 'MMM dd')}
                  size="small"
                  color={isOverdue ? 'error' : isToday(new Date(todo.dueDate)) ? 'warning' : 'default'}
                  variant={isOverdue || isToday(new Date(todo.dueDate)) ? 'filled' : 'outlined'}
                />
              )}
            </Box>
          </Box>
          
          <IconButton 
            size="small"
            onClick={() => onToggleComplete(todo.id)}
            sx={{ 
              color: todo.completed ? 'success.main' : 'action.disabled'
            }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// 主页面组件
const TodoPage: React.FC = () => {
  const {
    todos,
    loading,
    deleteTodoItem,
    toggleComplete,
    addTodo,
    updateTodoItem
  } = useTodos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for edit form
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: '',
    completed: false
  });
  const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showScheduleReview, setShowScheduleReview] = useState(false);
  
  // Dashboard统计数据
  const dashboardStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => 
      !todo.completed && todo.dueDate && isPast(new Date(todo.dueDate))
    ).length;
    const today = todos.filter(todo => 
      todo.dueDate && isToday(new Date(todo.dueDate))
    ).length;
    const highPriority = todos.filter(todo => 
      !todo.completed && todo.priority === 'high'
    ).length;
    
    return {
      total,
      completed,
      pending,
      overdue,
      today,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);
  
  // 处理函数
  const handleNewTask = () => {
    setShowTaskForm(true);
    console.log('Opening new task form');
  };
  
  const handleViewDashboard = () => {
    setShowDashboard(true);
    console.log('Opening dashboard view');
  };
  
  const handleScheduleReview = () => {
    setShowScheduleReview(true);
    console.log('Opening schedule review');
  };
  
  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedTodo) return;
    
    // Validate form
    const errors: { [key: string]: string } = {};
    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    try {
      setEditFormLoading(true);
      setEditFormErrors({});
      
      const updateData = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || undefined,
        priority: editFormData.priority,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate) : undefined,
        category: editFormData.category.trim() || undefined,
        completed: editFormData.completed
      };
      
      await updateTodoItem(selectedTodo.id, updateData);
      setSidebarOpen(false);
      setSelectedTodo(null);
    } catch (error) {
      console.error('Failed to update todo:', error);
      setEditFormErrors({ general: 'Failed to update task. Please try again.' });
    } finally {
      setEditFormLoading(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setSidebarOpen(false);
    setSelectedTodo(null);
    setEditFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: '',
      completed: false
    });
    setEditFormErrors({});
  };
  
  // 筛选和排序逻辑
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = todos.filter((todo: Todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'completed' && todo.completed) ||
        (statusFilter === 'pending' && !todo.completed);
      const matchesPriority = priorityFilter === 'all' || todo.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    // 排序
    filtered.sort((a: Todo, b: Todo) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as TodoPriority] - priorityOrder[a.priority as TodoPriority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [todos, searchTerm, statusFilter, priorityFilter, sortBy]);
  
  // 统计数据
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo: Todo) => todo.completed).length;
    const pending = todos.filter((todo: Todo) => !todo.completed).length;
    const inProgress = 0; // Todo类型没有in_progress状态
    const overdue = todos.filter((todo: Todo) => 
      todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed
    ).length;
    
    return { total, completed, pending, inProgress, overdue };
  }, [todos]);
  

  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '200px' }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                My Tasks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Stay organized and boost your productivity
              </Typography>
            </Box>
          </Box>
        
          {/* Statistics Cards */}
          <Box sx={{ flexShrink: 0 }}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3.5 }
                  }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <AssignmentIcon />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Tasks
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ 
                     p: { xs: 2, sm: 2.5, md: 3.5 }
                   }}>
                     <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                       <Box
                         sx={{
                           p: 2,
                           borderRadius: 2,
                           backgroundColor: 'success.main',
                           color: 'white',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}
                       >
                         <CheckCircleIcon />
                       </Box>
                       <Box sx={{ flex: 1, minWidth: 0 }}>
                         <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                           {stats.completed}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           Completed
                         </Typography>
                       </Box>
                     </Stack>
                   </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ 
                     p: { xs: 2, sm: 2.5, md: 3.5 }
                   }}>
                     <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                       <Box
                         sx={{
                           p: 2,
                           borderRadius: 2,
                           backgroundColor: 'warning.main',
                           color: 'white',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}
                       >
                         <ScheduleIcon />
                       </Box>
                       <Box sx={{ flex: 1, minWidth: 0 }}>
                         <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                           {stats.pending}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           Pending
                         </Typography>
                       </Box>
                     </Stack>
                   </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ 
                     p: { xs: 2, sm: 2.5, md: 3.5 }
                   }}>
                     <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                       <Box
                         sx={{
                           p: 2,
                           borderRadius: 2,
                           backgroundColor: 'error.main',
                           color: 'white',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}
                       >
                         <FlagIcon />
                       </Box>
                       <Box sx={{ flex: 1, minWidth: 0 }}>
                         <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                           {stats.overdue}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           Overdue
                         </Typography>
                       </Box>
                     </Stack>
                   </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        
        {/* Today Focus and Quick Actions */}
        <Box sx={{ flexShrink: 0, mb: 3 }}>
          <Grid 
            container 
            spacing={0}
            sx={{ 
              maxWidth: '100%',
              overflow: 'hidden',
              alignItems: 'stretch',
              '& .MuiGrid-item': {
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
          <Grid item xs={12} md={8} sx={{ pr: { xs: 0, md: 1.5 } }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <CardContent sx={{ 
                p: { xs: 2.5, sm: 3, md: 3.5 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                minHeight: '300px'
              }}>
                <TodayFocus todos={todos} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4} sx={{ pl: { xs: 0, md: 1.5 }, mt: { xs: 3, md: 0 } }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <CardContent sx={{ 
                p: { xs: 2.5, sm: 3, md: 3.5 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                minHeight: '300px'
              }}>
                <QuickActions 
              onAddNewTask={handleNewTask}
              onViewDashboard={handleViewDashboard}
              onScheduleReview={handleScheduleReview}
            />
              </CardContent>
            </Card>
          </Grid>
          </Grid>
        </Box>
        
        {/* Search and Filter Section */}
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          mb: 3
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
            <SmartFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onNewTask={handleNewTask}
          />
          </CardContent>
        </Card>
        
        {/* Task List Section */}
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ 
            p: { xs: 2.5, sm: 3, md: 3.5 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Tasks ({filteredAndSortedTodos.length})
              </Typography>
              
              {selectedTodos.length > 0 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTodos.length} selected
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="error"
                    onClick={() => {
                      selectedTodos.forEach(id => deleteTodoItem(id));
                      setSelectedTodos([]);
                    }}
                  >
                    Delete Selected
                  </Button>
                </Box>
              )}
            </Box>
            
            {filteredAndSortedTodos.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 6
                }}
              >
                <Box>
                  <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No tasks found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Create your first task to get started'
                    }
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {filteredAndSortedTodos.map((todo: Todo) => (
                    <Grid item xs={12} sm={6} lg={4} key={todo.id}>
                      <TodoCard
                        todo={todo}
                        onEdit={(todo) => {
                          setSelectedTodo(todo);
                          // Initialize edit form with selected todo data
                          setEditFormData({
                            title: todo.title,
                            description: todo.description || '',
                            priority: todo.priority,
                            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
                            category: todo.category || '',
                            completed: todo.completed
                          });
                          setEditFormErrors({});
                          setSidebarOpen(true);
                        }}
                        onDelete={(id) => deleteTodoItem(id)}
                        onToggleComplete={(id) => toggleComplete(id)}
                        isSelected={selectedTodos.includes(todo.id)}
                        onSelect={(id) => {
                          if (selectedTodos.includes(id)) {
                            setSelectedTodos(selectedTodos.filter(t => t !== id));
                          } else {
                            setSelectedTodos([...selectedTodos, id]);
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
        

        
        {/* Sidebar for Task Edit Form */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 400,
              padding: 2,
            },
          }}
        >
          {selectedTodo && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Edit Task
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  margin="normal"
                  required
                  error={!!editFormErrors.title}
                  helperText={editFormErrors.title}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editFormData.completed}
                      onChange={(e) => setEditFormData({ ...editFormData, completed: e.target.checked })}
                    />
                  }
                  label="Completed"
                  sx={{ mt: 2, mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveEdit}
                    disabled={editFormLoading || !editFormData.title.trim()}
                    fullWidth
                  >
                    {editFormLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Drawer>
        
        {/* TodoForm Dialog */}
        <TodoForm
          open={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onSubmit={async (todoData) => {
            try {
              await addTodo(todoData as CreateTodoData);
              setShowTaskForm(false);
              console.log('Task created successfully');
            } catch (error) {
              console.error('Error creating task:', error);
            }
          }}
        />
        
        {/* Dashboard Dialog */}
        <Dialog
          open={showDashboard}
          onClose={() => setShowDashboard(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Task Dashboard
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Overview Cards */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">
                    {dashboardStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {dashboardStats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    {dashboardStats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Card>
              </Grid>
              
              {/* Progress Section */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Completion Progress
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {dashboardStats.completionRate}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={dashboardStats.completionRate} 
                      sx={{ flex: 1, mx: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {dashboardStats.completed}/{dashboardStats.total}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              {/* Quick Stats */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Overdue Tasks
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {dashboardStats.overdue}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TodayIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Due Today
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {dashboardStats.today}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FlagIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      High Priority Tasks
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {dashboardStats.highPriority}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDashboard(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
         </Dialog>
         
         {/* Schedule Review Dialog */}
         <Dialog
           open={showScheduleReview}
           onClose={() => setShowScheduleReview(false)}
           maxWidth="md"
           fullWidth
         >
           <DialogTitle>
             <Box display="flex" alignItems="center">
               <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
               <Typography variant="h6" fontWeight="bold">
                 Schedule Review
               </Typography>
             </Box>
           </DialogTitle>
           <DialogContent>
             <Grid container spacing={3}>
               {/* Today's Tasks */}
               <Grid item xs={12}>
                 <Card sx={{ p: 2 }}>
                   <Typography variant="h6" fontWeight="bold" mb={2}>
                     Today's Tasks ({todos.filter(todo => todo.dueDate && isToday(new Date(todo.dueDate))).length})
                   </Typography>
                   {todos.filter(todo => todo.dueDate && isToday(new Date(todo.dueDate))).length === 0 ? (
                     <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                       No tasks scheduled for today. Enjoy your free time! 🎉
                     </Typography>
                   ) : (
                     <Stack spacing={1}>
                       {todos
                         .filter(todo => todo.dueDate && isToday(new Date(todo.dueDate)))
                         .map(todo => (
                           <Box 
                             key={todo.id}
                             sx={{ 
                               p: 2, 
                               borderRadius: 1, 
                               backgroundColor: todo.completed ? alpha('#4caf50', 0.1) : alpha('#2196f3', 0.1),
                               border: `1px solid ${todo.completed ? alpha('#4caf50', 0.3) : alpha('#2196f3', 0.3)}`,
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'space-between'
                             }}
                           >
                             <Box display="flex" alignItems="center">
                               {todo.completed ? (
                                 <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                               ) : (
                                 <Box sx={{ 
                                   width: 20, 
                                   height: 20, 
                                   borderRadius: '50%', 
                                   border: '2px solid', 
                                   borderColor: 'primary.main',
                                   mr: 1 
                                 }} />
                               )}
                               <Box>
                                 <Typography 
                                   variant="body1" 
                                   fontWeight="medium"
                                   sx={{ 
                                     textDecoration: todo.completed ? 'line-through' : 'none',
                                     color: todo.completed ? 'text.secondary' : 'text.primary'
                                   }}
                                 >
                                   {todo.title}
                                 </Typography>
                                 {todo.description && (
                                   <Typography variant="body2" color="text.secondary">
                                     {todo.description}
                                   </Typography>
                                 )}
                               </Box>
                             </Box>
                             <Box display="flex" alignItems="center">
                               {todo.priority === 'high' && (
                                 <Chip 
                                   label="High" 
                                   size="small" 
                                   color="error" 
                                   sx={{ mr: 1 }}
                                 />
                               )}
                               {todo.priority === 'medium' && (
                                 <Chip 
                                   label="Medium" 
                                   size="small" 
                                   color="warning" 
                                   sx={{ mr: 1 }}
                                 />
                               )}
                               {todo.priority === 'low' && (
                                 <Chip 
                                   label="Low" 
                                   size="small" 
                                   color="info" 
                                   sx={{ mr: 1 }}
                                 />
                               )}
                             </Box>
                           </Box>
                         ))
                       }
                     </Stack>
                   )}
                 </Card>
               </Grid>
               
               {/* Upcoming Tasks */}
               <Grid item xs={12} md={6}>
                 <Card sx={{ p: 2 }}>
                   <Typography variant="h6" fontWeight="bold" mb={2}>
                     Tomorrow's Tasks
                   </Typography>
                   {todos.filter(todo => todo.dueDate && isTomorrow(new Date(todo.dueDate))).length === 0 ? (
                     <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                       No tasks for tomorrow
                     </Typography>
                   ) : (
                     <Stack spacing={1}>
                       {todos
                         .filter(todo => todo.dueDate && isTomorrow(new Date(todo.dueDate)))
                         .slice(0, 3)
                         .map(todo => (
                           <Box key={todo.id} sx={{ p: 1, borderRadius: 1, backgroundColor: 'grey.50' }}>
                             <Typography variant="body2" fontWeight="medium">
                               {todo.title}
                             </Typography>
                           </Box>
                         ))
                       }
                       {todos.filter(todo => todo.dueDate && isTomorrow(new Date(todo.dueDate))).length > 3 && (
                         <Typography variant="caption" color="text.secondary">
                           +{todos.filter(todo => todo.dueDate && isTomorrow(new Date(todo.dueDate))).length - 3} more
                         </Typography>
                       )}
                     </Stack>
                   )}
                 </Card>
               </Grid>
               
               {/* Overdue Tasks */}
               <Grid item xs={12} md={6}>
                 <Card sx={{ p: 2 }}>
                   <Typography variant="h6" fontWeight="bold" mb={2} color="error.main">
                     Overdue Tasks
                   </Typography>
                   {todos.filter(todo => todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed).length === 0 ? (
                     <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
                       No overdue tasks! 🎉
                     </Typography>
                   ) : (
                     <Stack spacing={1}>
                       {todos
                         .filter(todo => todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed)
                         .slice(0, 3)
                         .map(todo => (
                           <Box 
                             key={todo.id} 
                             sx={{ 
                               p: 1, 
                               borderRadius: 1, 
                               backgroundColor: alpha('#f44336', 0.1),
                               border: `1px solid ${alpha('#f44336', 0.3)}`
                             }}
                           >
                             <Typography variant="body2" fontWeight="medium" color="error.main">
                               {todo.title}
                             </Typography>
                             <Typography variant="caption" color="error.main">
                               Due: {format(new Date(todo.dueDate!), 'MMM dd')}
                             </Typography>
                           </Box>
                         ))
                       }
                       {todos.filter(todo => todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed).length > 3 && (
                         <Typography variant="caption" color="error.main">
                           +{todos.filter(todo => todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed).length - 3} more overdue
                         </Typography>
                       )}
                     </Stack>
                   )}
                 </Card>
               </Grid>
             </Grid>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setShowScheduleReview(false)} variant="contained">
               Close
             </Button>
           </DialogActions>
         </Dialog>
         </Stack>
       </Container>
    </Box>
  );
};

export default TodoPage;