import React, { useState } from 'react';
import {
  Card,
  CardContent,

  Typography,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,

} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { Todo, TodoPriority } from '../../types';
import { useTodos } from '../../contexts/TodoContext';
import { formatDistanceToNow, format, isAfter, isBefore, startOfDay } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  compact?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit, compact = false }) => {
  const { toggleComplete, deleteTodoItem } = useTodos();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMenuOpen = Boolean(menuAnchor);
  const isOverdue = todo.dueDate && !todo.completed && isBefore(new Date(todo.dueDate), startOfDay(new Date()));
  const isDueToday = todo.dueDate && !todo.completed && 
    format(new Date(todo.dueDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isDueSoon = todo.dueDate && !todo.completed && 
    isAfter(new Date(todo.dueDate), new Date()) && 
    isBefore(new Date(todo.dueDate), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      await toggleComplete(todo.id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setMenuAnchor(null);
    setLoading(true);
    try {
      await deleteTodoItem(todo.id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setMenuAnchor(null);
    onEdit(todo);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityLabel = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  };

  const getStatusColor = () => {
    if (todo.completed) return '#4caf50';
    if (isOverdue) return '#f44336';
    if (isDueToday) return '#ff9800';
    if (isDueSoon) return '#2196f3';
    return '#9e9e9e';
  };

  const getStatusLabel = () => {
    if (todo.completed) return 'Completed';
    if (isOverdue) return 'Overdue';
    if (isDueToday) return 'Due Today';
    if (isDueSoon) return 'Due Soon';
    return 'Pending';
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return `Today at ${format(date, 'HH:mm')}`;
    }
    
    if (format(date, 'yyyy') === format(now, 'yyyy')) {
      return format(date, 'MMM dd, HH:mm');
    }
    
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const cardSx = {
    mb: 1,
    transition: 'all 0.2s ease-in-out',
    opacity: todo.completed ? 0.7 : 1,
    borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 2
    },
    ...(isOverdue && !todo.completed && {
      backgroundColor: '#ffebee'
    }),
    ...(isDueToday && !todo.completed && {
      backgroundColor: '#fff3e0'
    })
  };

  return (
    <>
      <Card sx={cardSx}>
        <CardContent sx={{ pb: compact ? 1 : 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* Checkbox */}
            <Tooltip title={todo.completed ? 'Mark as pending' : 'Mark as completed'}>
              <Checkbox
                checked={todo.completed}
                onChange={handleToggleComplete}
                disabled={loading}
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
                sx={{
                  color: getStatusColor(),
                  '&.Mui-checked': {
                    color: getStatusColor()
                  },
                  mt: -0.5
                }}
              />
            </Tooltip>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title and Status */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                  variant={compact ? 'body2' : 'h6'}
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    wordBreak: 'break-word',
                    flex: 1
                  }}
                >
                  {todo.title}
                </Typography>
                
                <Chip
                  label={getStatusLabel()}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                />
              </Stack>

              {/* Description (if expanded or compact mode) */}
              {(expanded || compact) && todo.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    display: '-webkit-box',
                    WebkitLineClamp: compact ? 2 : undefined,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {todo.description}
                </Typography>
              )}

              {/* Meta Information */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                {/* Priority */}
                <Chip
                  icon={<FlagIcon />}
                  label={getPriorityLabel(todo.priority)}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: getPriorityColor(todo.priority),
                    color: getPriorityColor(todo.priority),
                    fontSize: '0.7rem'
                  }}
                />

                {/* Category */}
                {todo.category && (
                  <Chip
                    icon={<FolderIcon />}
                    label={todo.category}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}

                {/* Due Date */}
                {todo.dueDate && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={todo.dueDate ? formatDueDate(todo.dueDate.toString()) : ''}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      ...(isOverdue && !todo.completed && {
                        borderColor: '#f44336',
                        color: '#f44336',
                        backgroundColor: '#ffebee'
                      }),
                      ...(isDueToday && !todo.completed && {
                        borderColor: '#ff9800',
                        color: '#ff9800',
                        backgroundColor: '#fff3e0'
                      })
                    }}
                  />
                )}
              </Stack>

              {/* Timestamps */}
              {!compact && (
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 12 }} />
                    Created {formatDistanceToNow(new Date(todo.createdAt), { addSuffix: true })}
                  </Typography>
                  
                  {todo.updatedAt !== todo.createdAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 12 }} />
                      Updated {formatDistanceToNow(new Date(todo.updatedAt), { addSuffix: true })}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>

            {/* Actions */}
            <Stack direction="row" alignItems="center">
              {/* Expand/Collapse (only if description exists and not compact) */}
              {!compact && todo.description && (
                <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
              )}

              {/* Menu */}
              <Tooltip title="More actions">
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  disabled={loading}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Expanded Description */}
          {!compact && todo.description && (
            <Collapse in={expanded}>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {todo.description}
                </Typography>
              </Box>
            </Collapse>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 160
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleToggleComplete}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {todo.completed ? 'Mark as Pending' : 'Mark as Completed'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TodoItem;