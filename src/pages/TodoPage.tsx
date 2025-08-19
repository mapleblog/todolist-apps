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
  Fab,
  Drawer,
  Button,
  LinearProgress,
  Divider,
  Stack,
  Checkbox,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Today as TodayIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,

  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,

} from '@mui/icons-material';
import { useTodos } from '../hooks/useTodos';
import { Todo, TodoPriority } from '../types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';



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
const QuickActions: React.FC = () => {
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
            sx={{ justifyContent: 'flex-start' }}
          >
            Add New Task
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<AssignmentIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            View Dashboard
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ScheduleIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
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
}> = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange 
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
          <Box display="flex" gap={1}>
            <Tooltip title="Filter">
              <IconButton size="small">
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton size="small">
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
    toggleComplete
  } = useTodos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
                Task Management Dashboard
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
                <QuickActions />
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
        
        {/* Add Task Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Fab
            color="primary"
            aria-label="add task"
            sx={{
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => console.log('Add new task')}
          >
            <AddIcon />
          </Fab>
        </Box>
        
        {/* 任务详情侧边栏 */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 400,
              p: 3
            }
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Task Details
            </Typography>
            <IconButton onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedTodo && (
            <Box>
              <Typography variant="h6" mb={2}>
                {selectedTodo.title}
              </Typography>
              
              {selectedTodo.description && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedTodo.description}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Status
                </Typography>
                <Chip label={selectedTodo.completed ? 'completed' : 'pending'} size="small" />
              </Box>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Priority
                </Typography>
                <Chip label={selectedTodo.priority} size="small" />
              </Box>
              
              {selectedTodo.dueDate && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Due Date
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(selectedTodo.dueDate), 'PPP')}
                  </Typography>
                </Box>
              )}
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {format(new Date(selectedTodo.createdAt), 'PPP')}
                </Typography>
              </Box>
            </Box>
          )}
        </Drawer>
        </Stack>
      </Container>
    </Box>
  );
};

export default TodoPage;