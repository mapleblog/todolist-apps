import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Collapse,
  Alert,
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useTodos } from '../../contexts/TodoContext';
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
        
        return (
          <Paper key={category} sx={{ mb: 2, overflow: 'hidden' }}>
            {/* Category Header */}
            <ListItemButton
              onClick={() => toggleCategoryExpansion(category)}
              sx={{
                backgroundColor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemIcon>
                <FolderIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {category}
                    </Typography>
                    <Chip
                      label={`${completedCount}/${categoryTodos.length}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: 20 }}
                    />
                  </Stack>
                }
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* Category Todos */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {categoryTodos.map((todo, index) => {
                  const dueDateInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;
                  
                  return (
                    <React.Fragment key={todo.id}>
                      <ListItem
                        disablePadding
                        sx={{
                          opacity: todo.completed ? 0.6 : 1,
                          backgroundColor: todo.completed ? 'action.hover' : 'transparent'
                        }}
                      >
                        <ListItemButton
                          onClick={() => handleToggleComplete(todo)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Checkbox
                              edge="start"
                              checked={todo.completed}
                              tabIndex={-1}
                              disableRipple
                              icon={<RadioButtonUncheckedIcon />}
                              checkedIcon={<CheckCircleIcon />}
                              sx={{
                                color: todo.completed ? 'success.main' : 'action.active',
                                '&.Mui-checked': {
                                  color: 'success.main'
                                }
                              }}
                            />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  fontWeight: todo.completed ? 'normal' : 'medium'
                                }}
                              >
                                {todo.title}
                              </Typography>
                            }
                            secondary={
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                {todo.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: 200
                                    }}
                                  >
                                    {todo.description}
                                  </Typography>
                                )}
                                
                                {todo.priority && todo.priority !== 'low' && (
                                  <Chip
                                    icon={<FlagIcon />}
                                    label={getPriorityLabel(todo.priority)}
                                    size="small"
                                    sx={{
                                      backgroundColor: getPriorityColor(todo.priority),
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: 20
                                    }}
                                  />
                                )}
                                
                                {dueDateInfo && (
                                  <Chip
                                    icon={<ScheduleIcon />}
                                    label={dueDateInfo.text}
                                    size="small"
                                    variant={dueDateInfo.urgent ? 'filled' : 'outlined'}
                                    sx={{
                                      color: dueDateInfo.color,
                                      borderColor: dueDateInfo.color,
                                      backgroundColor: dueDateInfo.urgent ? dueDateInfo.color : 'transparent',
                                      '& .MuiChip-label': {
                                        color: dueDateInfo.urgent ? 'white' : dueDateInfo.color
                                      },
                                      fontSize: '0.7rem',
                                      height: 20
                                    }}
                                  />
                                )}
                              </Stack>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => handleMenuOpen(e, todo)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      </ListItem>
                      
                      {index < categoryTodos.length - 1 && (
                        <Divider variant="inset" component="li" sx={{ ml: 4 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            </Collapse>
          </Paper>
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