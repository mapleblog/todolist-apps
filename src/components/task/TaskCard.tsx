import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, UpdateTaskData } from '@/types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, data: UpdateTaskData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onEdit?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,

  onDelete,
  onStatusChange,
  onEdit,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status: TaskStatus) => {
    await onStatusChange(task.id, status);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    handleMenuClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'todo': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'in-progress': return <PauseIcon />;
      case 'todo': return <PlayIcon />;
      default: return <PlayIcon />;
    }
  };

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed';

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderColor: 'primary.main',
          },
          opacity: task.status === 'completed' ? 0.8 : 1,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    lineHeight: 1.5,
                  }}
                >
                  {task.description}
                </Typography>
              )}
              </Box>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'primary.main',
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={getStatusIcon(task.status)}
              label={task.status.replace('-', ' ')}
              size="small"
              sx={{
                backgroundColor: getStatusColor(task.status),
                color: 'white',
                textTransform: 'capitalize',
                borderRadius: 2,
              }}
            />
            <Chip
              icon={<FlagIcon />}
              label={task.priority}
              size="small"
              sx={{
                backgroundColor: getPriorityColor(task.priority),
                color: 'white',
                textTransform: 'capitalize',
                borderRadius: 2,
              }}
            />
            {task.tags && task.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {task.dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon
                  fontSize="small"
                  sx={{ color: isOverdue ? '#f44336' : 'text.secondary' }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: isOverdue ? '#f44336' : 'text.secondary' }}
                >
                  {format(task.dueDate, 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}
            
            {task.assignedTo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {task.assignedTo}
                </Typography>
              </Box>
            )}
            
            {(task.estimatedHours || task.actualHours) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {task.actualHours || 0}h / {task.estimatedHours || 0}h
                </Typography>
                {task.estimatedHours && task.estimatedHours > 0 && (
                  <Box sx={{ width: 60, ml: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((task.actualHours || 0) / task.estimatedHours * 100, 100)}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: task.actualHours && task.actualHours > task.estimatedHours
                            ? '#f44336'
                            : '#4caf50',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
        </Box>
        </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {task.status !== 'todo' && (
          <MenuItem onClick={() => handleStatusChange('todo')}>
            <PlayIcon sx={{ mr: 1 }} fontSize="small" />
            Mark as To Do
          </MenuItem>
        )}
        {task.status !== 'in-progress' && (
          <MenuItem onClick={() => handleStatusChange('in-progress')}>
            <PauseIcon sx={{ mr: 1 }} fontSize="small" />
            Mark as In Progress
          </MenuItem>
        )}
        {task.status !== 'completed' && (
          <MenuItem onClick={() => handleStatusChange('completed')}>
            <CheckIcon sx={{ mr: 1 }} fontSize="small" />
            Mark as Completed
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Task
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Task
        </MenuItem>
      </Menu>
      </Card>
    </Fade>
  );
};

export default TaskCard;