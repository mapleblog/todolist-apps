import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
  Container,
  Paper,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Project } from '@/types';
import { projectService } from '@/services/projectService';
import { TaskList } from '@/components/task';
import { ProjectForm } from '@/components/project';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const projectData = await projectService.getProjectById(projectId, user?.uid || '');
      setProject(projectData);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCountChange = (total: number, completed: number) => {
    setTaskStats({ total, completed });
    
    // Update project progress
    if (project && total > 0) {
      const newProgress = Math.round((completed / total) * 100);
      if (newProgress !== project.progress) {
        updateProjectProgress(newProgress, total, completed);
      }
    }
  };

  const updateProjectProgress = async (progress: number, tasksCount: number, completedTasks: number) => {
    if (!projectId) return;
    
    try {
      await projectService.updateProject(projectId, user?.uid || '', {
        progress,
        tasksCount,
        completedTasks,
      });
      
      // Update local state
      setProject(prev => prev ? {
        ...prev,
        progress,
        tasksCount,
        completedTasks,
      } : null);
    } catch (err) {
      console.error('Error updating project progress:', err);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    setEditFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!projectId || !project) return;
    
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await projectService.deleteProject(projectId, user?.uid || '');
        onBack();
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project. Please try again.');
      }
    }
    handleMenuClose();
  };

  const handleUpdateProject = async (data: any) => {
    if (!projectId) return;
    
    try {
      await projectService.updateProject(projectId, user?.uid || '', data);
      await loadProject();
      setEditFormOpen(false);
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return '#ff9800';
      case 'planning': return '#2196f3';
      case 'on-hold': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ borderRadius: 2 }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  const isOverdue = project.dueDate && new Date() > project.dueDate && project.status !== 'completed';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={4}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={onBack}
              sx={{ textDecoration: 'none' }}
            >
              Projects
            </Link>
            <Typography variant="body2" color="text.primary">
              {project.name}
            </Typography>
          </Breadcrumbs>

          {/* Project Header */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
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
                {project.name}
              </Typography>
              {project.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>
              )}
            </Box>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            {/* Status and Progress */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    label={project.status.replace('-', ' ')}
                    sx={{
                      backgroundColor: getStatusColor(project.status),
                      color: 'white',
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getProgressColor(project.progress),
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Project Details */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {project.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon
                      fontSize="small"
                      sx={{ color: isOverdue ? '#f44336' : 'text.secondary' }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: isOverdue ? '#f44336' : 'text.secondary' }}
                    >
                      Due: {format(project.dueDate, 'MMM dd, yyyy')}
                      {isOverdue && ' (Overdue)'}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Tasks: {taskStats.completed} / {taskStats.total} completed
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Created: {format(project.createdAt, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
          </Paper>

          {/* Task Management */}
          <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <TaskList
                projectId={project.id}
                onTaskCountChange={handleTaskCountChange}
              />
            </CardContent>
          </Paper>
        </Stack>

        {/* Project Menu */}
        <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
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
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Project
        </MenuItem>
        </Menu>

        {/* Edit Project Form */}
        <ProjectForm
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={{
          name: project.name,
          description: project.description || '',
          dueDate: project.dueDate,
          color: project.color || '#1976d2'
        }}
        isEdit={true}
        />
      </Container>
    </Box>
  );
};

export default ProjectDetailPage;