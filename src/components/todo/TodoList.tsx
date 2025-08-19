import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Stack,
  LinearProgress,
  Collapse,
  Avatar,
  Tooltip,
  Paper
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useTodos } from '../../hooks/useTodos';
import { Todo, TodoPriority, TodoFilter } from '../../types';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TodoListProps {
  onEditTodo?: (todo: Todo) => void;
  onDeleteTodo?: (todoId: string) => void;
  filter?: TodoFilter;
  searchQuery?: string;
}

const TodoList: React.FC<TodoListProps> = ({
  onEditTodo,
  onDeleteTodo,
  filter,
  searchQuery = ''
}) => {
  const { todos, loading, error, toggleComplete, deleteTodoItem } = useTodos();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, todo: Todo) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTodo(todo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTodo(null);
  };

  const handleEdit = () => {
    if (selectedTodo && onEditTodo) {
      onEditTodo(selectedTodo);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedTodo) {
      try {
        await deleteTodoItem(selectedTodo.id);
        if (onDeleteTodo) {
          onDeleteTodo(selectedTodo.id);
        }
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
    handleMenuClose();
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      await toggleComplete(todo.id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getPriorityColor = (priority: TodoPriority): string => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority: TodoPriority): string => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'None';
    }
  };

  const formatDueDate = (dueDate: Date): { text: string; color: string; urgent: boolean } => {
    if (isToday(dueDate)) {
      return { text: 'Today', color: '#ff9800', urgent: true };
    } else if (isTomorrow(dueDate)) {
      return { text: 'Tomorrow', color: '#2196f3', urgent: false };
    } else if (isPast(dueDate)) {
      return { text: 'Overdue', color: '#f44336', urgent: true };
    } else {
      return { text: format(dueDate, 'MMM dd'), color: '#9e9e9e', urgent: false };
    }
  };

  const filterTodos = (todos: Todo[]): Todo[] => {
    let filtered = todos;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query) ||
        todo.category?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filter) {
      switch (filter.status) {
        case 'completed':
          filtered = filtered.filter(todo => todo.completed);
          break;
        case 'pending':
          filtered = filtered.filter(todo => !todo.completed);
          break;
        case 'overdue':
          filtered = filtered.filter(todo => 
            !todo.completed && todo.dueDate && isPast(todo.dueDate)
          );
          break;
      }

      // Apply priority filter
      if (filter.priority && filter.priority !== 'all') {
        filtered = filtered.filter(todo => todo.priority === filter.priority);
      }

      // Apply category filter
      if (filter.category && filter.category !== 'all') {
        filtered = filtered.filter(todo => todo.category === filter.category);
      }
    }

    return filtered;
  };

  const groupTodosByCategory = (todos: Todo[]): Record<string, Todo[]> => {
    const grouped: Record<string, Todo[]> = {};
    
    todos.forEach(todo => {
      const category = todo.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(todo);
    });

    return grouped;
  };

  const filteredTodos = filterTodos(todos);
  const groupedTodos = groupTodosByCategory(filteredTodos);
  const categories = Object.keys(groupedTodos).sort();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {searchQuery ? 'No todos found' : 'No todos yet'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchQuery 
            ? 'Try adjusting your search or filters'
            : 'Create your first todo to get started'
          }
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {categories.map(category => {
        const categoryTodos = groupedTodos[category];
        const isExpanded = expandedCategories.has(category);
        const completedCount = categoryTodos.filter(todo => todo.completed).length;
        const completionRate = (completedCount / categoryTodos.length) * 100;
        
        return (
          <Box key={category} sx={{ mb: 4 }}>
            {/* Category Header */}
            <Card 
              sx={{ 
                mb: 2, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => toggleCategoryExpansion(category)}
            >
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <FolderIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {category}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {categoryTodos.length} task{categoryTodos.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack alignItems="flex-end" spacing={1}>
                    <Chip
                      label={`${completedCount}/${categoryTodos.length}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {Math.round(completionRate)}%
                      </Typography>
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </Stack>
                </Stack>
                
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Category Todos Grid */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Grid container spacing={2}>
                {categoryTodos.map((todo) => {
                  const dueDateInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={todo.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'all 0.3s ease-in-out',
                          opacity: todo.completed ? 0.7 : 1,
                          transform: todo.completed ? 'scale(0.98)' : 'scale(1)',
                          '&:hover': {
                            transform: todo.completed ? 'scale(0.98)' : 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: getPriorityColor(todo.priority || 'low'),
                            borderRadius: '4px 4px 0 0'
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                          {/* Task Header */}
                          <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
                            <Checkbox
                              checked={todo.completed}
                              onChange={() => handleToggleComplete(todo)}
                              icon={<RadioButtonUncheckedIcon />}
                              checkedIcon={<CheckCircleIcon />}
                              sx={{
                                color: 'action.active',
                                '&.Mui-checked': {
                                  color: 'success.main'
                                },
                                mt: -0.5
                              }}
                            />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  lineHeight: 1.3,
                                  color: todo.completed ? 'text.secondary' : 'text.primary'
                                }}
                              >
                                {todo.title}
                              </Typography>
                              
                              {todo.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 1,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {todo.description}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          
                          {/* Task Metadata */}
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {todo.priority && (
                              <Chip
                                icon={<FlagIcon />}
                                label={getPriorityLabel(todo.priority)}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(todo.priority),
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              />
                            )}
                            
                            {dueDateInfo && (
                              <Chip
                                icon={<CalendarTodayIcon />}
                                label={dueDateInfo.text}
                                size="small"
                                variant={dueDateInfo.urgent ? 'filled' : 'outlined'}
                                sx={{
                                  color: dueDateInfo.color,
                                  borderColor: dueDateInfo.color,
                                  backgroundColor: dueDateInfo.urgent ? dueDateInfo.color : 'transparent',
                                  '& .MuiChip-label': {
                                    color: dueDateInfo.urgent ? 'white' : dueDateInfo.color,
                                    fontWeight: 500
                                  },
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Stack>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            <AssignmentIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            Task #{todo.id.slice(-6)}
                          </Typography>
                          
                          <Tooltip title="More options">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, todo)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Collapse>
          </Box>
        );
      })}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TodoList;