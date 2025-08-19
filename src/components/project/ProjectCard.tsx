import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  Grow
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Assignment as TaskIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { format, formatDistanceToNow, isBefore, isToday, isYesterday } from 'date-fns';

// Custom time formatting function for better UX
const formatUpdateTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  } else {
    const diffInDays = Math.floor(diffInMinutes / (60 * 24));
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  }
};


interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
  onStatusChange?: (projectId: string, status: Project['status']) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onView,
  onStatusChange
}) => {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };



  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleView = () => {
    handleMenuClose();
    onView(project);
    setViewDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(project.id);
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = (newStatus: Project['status']) => {
    if (onStatusChange) {
      onStatusChange(project.id, newStatus);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on-hold':
        return 'warning';
      default:
        return 'default';
    }
  };



  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <PlayArrowIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'on-hold':
        return <PauseIcon />;
      default:
        return null;
    }
  };

  const getDueDateStatus = () => {
    if (!project.dueDate) return null;
    
    const now = new Date();
    const dueDate = new Date(project.dueDate);
    
    if (project.status === 'completed') {
      return { color: 'success', text: 'Completed' };
    }
    
    if (isBefore(dueDate, now)) {
      return { color: 'error', text: 'Overdue' };
    }
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return { color: 'warning', text: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}` };
    }
    
    return { color: 'info', text: `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}` };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <>
      <Grow in timeout={300}>
        <Card
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 50%, rgba(240,245,251,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            },
            '&:hover': {
              transform: 'translateY(-6px) scale(1.015)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.1)',
              '&::before': {
                opacity: 1
              },
              '& .project-card-overlay': {
                opacity: 1
              },
              '& .project-card-actions': {
                transform: 'translateY(0)',
                opacity: 1
              },
              '& .project-progress': {
                transform: 'scaleX(1.02)'
              }
            }
          }}
          onClick={() => handleView()}
        >
          <CardContent 
            className="project-card-content"
            sx={{ 
              flexGrow: 1, 
              p: { xs: 2.5, sm: 3 },
              pb: 1,
              transition: 'background 0.3s ease',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${project.color} 0%, ${project.color}60 100%)`,
                borderRadius: '0 0 12px 12px',
                boxShadow: `0 2px 8px ${project.color}30`,
              },
            }}>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              mb: { xs: 1.5, sm: 2 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 1.5 }, 
                flexGrow: 1,
                minWidth: 0,
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Fade in timeout={500}>
                  <div>
                    <Avatar 
                      className="project-avatar"
                      sx={{ 
                        bgcolor: project.color,
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        fontWeight: 600,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '2px solid rgba(255,255,255,0.8)'
                      }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </div>
                </Fade>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2
                    }}
                  >
                    {project.name}
                  </Typography>
                </Box>
              </Box>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                ml: { xs: 0, sm: 1 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <MoreVertIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>

          {/* Description */}
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: { xs: 1, sm: 2 },
                WebkitBoxOrient: 'vertical',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                lineHeight: { xs: 1.3, sm: 1.4 }
              }}
            >
              {project.description}
            </Typography>
          )}

            {/* Status and Due Date */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={project.status}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  borderRadius: 2,
                  textTransform: 'capitalize',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover::before': {
                    left: '100%'
                  },
                  ...(project.status === 'active' && {
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(76,175,80,0.4)'
                    }
                  }),
                  ...(project.status === 'completed' && {
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(25,118,210,0.4)'
                    }
                  }),
                  ...(project.status === 'on-hold' && {
                    background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255,152,0,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(255,152,0,0.4)'
                    }
                  })
                }}
              />
            {dueDateStatus && (
              <Chip
                icon={<ScheduleIcon />}
                label={dueDateStatus.text}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover::before': {
                    left: '100%'
                  },
                  ...(dueDateStatus.color === 'error' ? {
                    background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
                    animation: 'pulse 2s infinite',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(244,67,54,0.4)'
                    }
                  } : {
                    background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(33,150,243,0.4)'
                    }
                  }),
                  '& .MuiChip-icon': {
                    fontSize: '1rem',
                    marginLeft: '8px',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                  },
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 }
                  }
                }}
              />
            )}
          </Stack>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Progress
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  fontSize: '0.9rem',
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {project.progress}%
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress 
                variant="determinate" 
                value={project.progress} 
                className="project-progress"
                sx={{ 
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: `linear-gradient(90deg, 
                      ${project.progress < 30 ? '#f44336, #ff5722' : 
                        project.progress < 70 ? '#ff9800, #ffc107' : '#4caf50, #8bc34a'})`,
                    boxShadow: `0 2px 8px ${project.progress < 30 ? 'rgba(244,67,54,0.3)' : 
                      project.progress < 70 ? 'rgba(255,152,0,0.3)' : 'rgba(76,175,80,0.3)'}`,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite'
                    }
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }}
              />
              {project.progress >= 100 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 8,
                    transform: 'translateY(-50%)',
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
          </Box>

          {/* Project Info Footer */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1.5,
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Tasks Summary */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              px: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TaskIcon 
                  fontSize="small" 
                  sx={{ 
                    color: 'primary.main',
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: 'primary.50'
                  }} 
                />
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.2
                    }}
                  >
                    {project.completedTasks}/{project.tasksCount} Tasks
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  >
                    {project.tasksCount > 0 
                      ? `${Math.round((project.completedTasks / project.tasksCount) * 100)}% complete`
                      : 'No tasks yet'
                    }
                  </Typography>
                </Box>
              </Box>
              
              {/* Action Button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e);
                }}
                sx={{ 
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'primary.50',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            {/* Last Updated */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'grey.50'
            }}>
              <TrendingUpIcon sx={{ 
                fontSize: 16, 
                color: 'success.main',
                opacity: 0.8
              }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                Last updated {formatUpdateTime(new Date(project.updatedAt))}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        </Card>
      </Grow>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <Divider />
        {project.status !== 'active' && (
          <MenuItem onClick={() => handleStatusChange('active')}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Active</ListItemText>
          </MenuItem>
        )}
        {project.status !== 'on-hold' && (
          <MenuItem onClick={() => handleStatusChange('on-hold')}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Put on Hold</ListItemText>
          </MenuItem>
        )}
        {project.status !== 'completed' && (
          <MenuItem onClick={() => handleStatusChange('completed')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Completed</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Project</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{project.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: project.color }}>
            {project.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{project.name}</Typography>
            <Chip
              icon={getStatusIcon(project.status) ?? undefined}
              label={project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              color={getStatusColor(project.status) as any}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Description */}
            {project.description && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
              </Box>
            )}

            {/* Progress */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {project.progress}%
                </Typography>
              </Box>
            </Box>

            {/* Tasks */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.completedTasks} of {project.tasksCount} tasks completed
              </Typography>
            </Box>

            {/* Dates */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Timeline
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Created: {format(new Date(project.createdAt), 'PPP')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {format(new Date(project.updatedAt), 'PPP')}
                  </Typography>
                </Box>
                {project.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Due date: {format(new Date(project.dueDate), 'PPP')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectCard;