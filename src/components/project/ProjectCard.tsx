import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
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
import { format, formatDistanceToNow, isBefore } from 'date-fns';


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
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          onClick={() => handleView()}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                <Fade in timeout={500}>
                  <div>
                    <Avatar sx={{ bgcolor: project.color }}>
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
                      fontSize: '1rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {project.name}
                  </Typography>
                </Box>
              </Box>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Description */}
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {project.description}
            </Typography>
          )}

            {/* Status and Due Date */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Chip
                icon={getStatusIcon(project.status) ?? undefined}
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            {dueDateStatus && (
              <Chip
                icon={<ScheduleIcon />}
                label={dueDateStatus.text}
                color={dueDateStatus.color as any}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {project.progress}%
              </Typography>
            </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{ borderRadius: 1 }}
              />
          </Box>

          {/* Tasks Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TaskIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {project.completedTasks}/{project.tasksCount} tasks
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertIcon />
            </IconButton>
          </CardActions>
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