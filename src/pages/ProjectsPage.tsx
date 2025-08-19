import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Fab,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  PauseCircleFilled as PauseCircleFilledIcon
} from '@mui/icons-material';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { ProjectList, ProjectForm } from '../components/project';
import { Project, CreateProjectData } from '../services/projectService';

const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { } = useAuth();
  const {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects
  } = useProjects();

  // Local state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Project['status']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'dueDate'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0
  });

  // Calculate statistics when projects change
  useEffect(() => {
    const newStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length
    };
    setStats(newStats);
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, sortBy, sortDirection]);

  // Event handlers
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCreateProject = async (projectData: CreateProjectData) => {
    try {
      await addProject(projectData);
      setCreateDialogOpen(false);
      showSnackbar('Project created successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to create project. Please try again.', 'error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      showSnackbar('Project deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to delete project. Please try again.', 'error');
    }
  };

  const handleViewProject = (project: Project) => {
    // Navigate to project detail page or show project details
    showSnackbar(`Viewing project: ${project.name}`, 'info');
    // TODO: Add navigation to project detail page
    console.log('View project:', project);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditDialogOpen(true);
  };

  const handleUpdateProject = async (projectData: CreateProjectData) => {
    if (!editingProject) return;
    
    try {
      await updateProject(editingProject.id, projectData);
      setEditDialogOpen(false);
      setEditingProject(null);
      showSnackbar('Project updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating project:', error);
      showSnackbar('Failed to update project. Please try again.', 'error');
    }
  };

  const handleStatusChange = async (projectId: string, status: Project['status']) => {
    try {
      await updateProject(projectId, { status });
      showSnackbar(`Project status updated to ${status}!`, 'success');
    } catch (error) {
      showSnackbar('Failed to update project status. Please try again.', 'error');
    }
  };

  const handleRefresh = () => {
    refreshProjects();
    showSnackbar('Projects refreshed!', 'info');
  };





  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        zIndex: 0
      }
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          maxHeight: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Page Header */}
        <Stack 
          spacing={{ xs: 3, sm: 4, md: 5 }}
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto'
          }}
        >
          <Box sx={{ 
            flexShrink: 0, 
            mb: { xs: 3, sm: 4, md: 5 },
            textAlign: 'center',
            py: { xs: 2, sm: 3 }
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                mb: 2,
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                fontWeight: 700,
                background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em'
              }}
            >
              Projects Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="rgba(255, 255, 255, 0.8)"
              sx={{ 
                display: { xs: 'block', sm: 'block' },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Manage your projects and track their progress with modern tools
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ flexShrink: 0 }}>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  transition: 'left 0.6s ease-in-out'
                },
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
                  background: 'rgba(255, 255, 255, 1)',
                  '&::before': {
                    left: '100%'
                  }
                }
              }}>
                <CardContent sx={{ 
                  p: { xs: 2, sm: 2.5, md: 3.5 }
                }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                        minWidth: { xs: 48, sm: 56 },
                        minHeight: { xs: 48, sm: 56 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h4" component="div" sx={{ 
                        fontWeight: 700, 
                        color: '#2d3748',
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                        lineHeight: 1.2
                      }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                        letterSpacing: '0.02em'
                      }}>
                        Total Projects
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 1)'
                }
              }}>
                <CardContent sx={{ 
                   p: { xs: 2, sm: 2.5, md: 3.5 }
                 }}>
                   <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                     <Box
                       sx={{
                         p: { xs: 1.5, sm: 2 },
                         borderRadius: 2.5,
                         background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #ea580c 100%)',
                         color: 'white',
                         boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                         minWidth: { xs: 48, sm: 56 },
                         minHeight: { xs: 48, sm: 56 },
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         transition: 'all 0.3s ease',
                         '&::before': {
                           content: '""',
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #d97706 100%)',
                           opacity: 0,
                           transition: 'opacity 0.3s ease'
                         },
                         '&:hover::before': {
                           opacity: 1
                         }
                       }}
                     >
                       <PlayCircleFilledIcon sx={{ 
                          fontSize: { xs: 26, sm: 30 },
                          position: 'relative',
                          zIndex: 1,
                          transition: 'transform 0.3s ease'
                        }} />
                     </Box>
                     <Box sx={{ flex: 1, minWidth: 0 }}>
                       <Typography variant="h4" component="div" sx={{ 
                         fontWeight: 700, 
                         color: '#2d3748',
                         fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                         lineHeight: 1.2
                       }}>
                         {stats.active}
                       </Typography>
                       <Typography variant="body1" color="text.secondary" sx={{ 
                         fontWeight: 500,
                         fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                         letterSpacing: '0.02em'
                       }}>
                         Active
                       </Typography>
                     </Box>
                   </Stack>
                 </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 1)'
                }
              }}>
                <CardContent sx={{ 
                   p: { xs: 2, sm: 2.5, md: 3.5 }
                 }}>
                   <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                     <Box
                       sx={{
                         p: { xs: 1.5, sm: 2 },
                         borderRadius: 2.5,
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                         color: 'white',
                         boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                         minWidth: { xs: 48, sm: 56 },
                         minHeight: { xs: 48, sm: 56 },
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         transition: 'all 0.3s ease',
                         '&::before': {
                           content: '""',
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #059669 100%)',
                           opacity: 0,
                           transition: 'opacity 0.3s ease'
                         },
                         '&:hover::before': {
                           opacity: 1
                         }
                       }}
                     >
                       <CheckCircleIcon sx={{ 
                          fontSize: { xs: 26, sm: 30 },
                          position: 'relative',
                          zIndex: 1,
                          transition: 'transform 0.3s ease'
                        }} />
                     </Box>
                     <Box sx={{ flex: 1, minWidth: 0 }}>
                       <Typography variant="h4" component="div" sx={{ 
                         fontWeight: 700, 
                         color: '#2d3748',
                         fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                         lineHeight: 1.2
                       }}>
                         {stats.completed}
                       </Typography>
                       <Typography variant="body1" color="text.secondary" sx={{ 
                         fontWeight: 500,
                         fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                         letterSpacing: '0.02em'
                       }}>
                         Completed
                       </Typography>
                     </Box>
                   </Stack>
                 </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                  background: 'rgba(255, 255, 255, 1)'
                }
              }}>
                <CardContent sx={{ 
                   p: { xs: 2, sm: 2.5, md: 3.5 }
                 }}>
                   <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                     <Box
                       sx={{
                         p: { xs: 1.5, sm: 2 },
                         borderRadius: 2.5,
                         background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                         color: 'white',
                         boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                         minWidth: { xs: 48, sm: 56 },
                         minHeight: { xs: 48, sm: 56 },
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         transition: 'all 0.3s ease',
                         '&::before': {
                           content: '""',
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #dc2626 100%)',
                           opacity: 0,
                           transition: 'opacity 0.3s ease'
                         },
                         '&:hover::before': {
                           opacity: 1
                         }
                       }}
                     >
                       <PauseCircleFilledIcon sx={{ 
                          fontSize: { xs: 26, sm: 30 },
                          position: 'relative',
                          zIndex: 1,
                          transition: 'transform 0.3s ease'
                        }} />
                     </Box>
                     <Box sx={{ flex: 1, minWidth: 0 }}>
                       <Typography variant="h4" component="div" sx={{ 
                         fontWeight: 700, 
                         color: '#2d3748',
                         fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                         lineHeight: 1.2
                       }}>
                         {stats.onHold}
                       </Typography>
                       <Typography variant="body1" color="text.secondary" sx={{ 
                         fontWeight: 500,
                         fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                         letterSpacing: '0.02em'
                       }}>
                         On Hold
                       </Typography>
                     </Box>
                   </Stack>
                 </CardContent>
              </Card>
            </Grid>
            </Grid>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ flexShrink: 0 }}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                transition: 'left 0.8s ease-in-out'
              },
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: '100%'
                }
              }
            }}>
              <CardContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="center">
                <Grid item xs={12} sm={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#667eea', fontWeight: 500 }}>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="on-hold">On Hold</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={8} md={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#667eea', fontWeight: 500 }}>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value as any)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      <MenuItem value="createdAt">Created Date</MenuItem>
                      <MenuItem value="updatedAt">Updated Date</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="dueDate">Due Date</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                   <Stack direction="row" spacing={1}>
                     <IconButton
                       onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                       title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                       sx={{
                         backgroundColor: sortDirection === 'desc' ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                         color: sortDirection === 'desc' ? '#667eea' : '#64748b',
                         borderRadius: 2,
                         border: '1px solid',
                         borderColor: sortDirection === 'desc' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(203, 213, 225, 0.5)',
                         boxShadow: sortDirection === 'desc' ? '0 2px 8px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                         '&:hover': {
                           backgroundColor: sortDirection === 'desc' ? 'rgba(102, 126, 234, 0.25)' : 'rgba(102, 126, 234, 0.15)',
                           borderColor: 'rgba(102, 126, 234, 0.4)',
                           transform: 'translateY(-2px) scale(1.05)',
                           boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                         }
                       }}
                     >
                       {sortDirection === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                     </IconButton>
                     <IconButton 
                       onClick={handleRefresh} 
                       title="Refresh"
                       sx={{
                         backgroundColor: 'rgba(255, 255, 255, 0.9)',
                         color: '#667eea',
                         borderRadius: 2,
                         border: '1px solid rgba(203, 213, 225, 0.5)',
                         boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                         '&:hover': {
                           backgroundColor: 'rgba(102, 126, 234, 0.15)',
                           borderColor: 'rgba(102, 126, 234, 0.4)',
                           transform: 'translateY(-2px) scale(1.05)',
                           boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                         }
                       }}
                     >
                       <RefreshIcon />
                     </IconButton>
                   </Stack>
                 </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #8b5cf6 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
                        '&::before': {
                          opacity: 1
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1
                      },
                      '& span': {
                        position: 'relative',
                        zIndex: 1
                      }
                    }}
                  >
                    New Project
                  </Button>
                </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Projects List */}
          <Box sx={{ 
            flex: 1, 
            minHeight: 0,
            overflow: 'auto'
          }}>
            {loading ? (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {[...Array(6)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ 
                      height: 'fit-content',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                        animation: 'shimmer 2s infinite'
                      },
                      '@keyframes shimmer': {
                        '0%': { left: '-100%' },
                        '100%': { left: '100%' }
                      }
                    }}>
                      <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
                        <Skeleton 
                          variant="text" 
                          width="60%" 
                          height={32} 
                          sx={{ 
                            borderRadius: 2,
                            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.12) 50%, rgba(102, 126, 234, 0.08) 100%)',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }} 
                        />
                        <Skeleton 
                          variant="text" 
                          width="100%" 
                          height={20} 
                          sx={{ 
                            borderRadius: 2,
                            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.08) 50%, rgba(102, 126, 234, 0.04) 100%)',
                            animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                          }} 
                        />
                        <Skeleton 
                          variant="text" 
                          width="80%" 
                          height={20} 
                          sx={{ 
                            borderRadius: 2,
                            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.08) 50%, rgba(102, 126, 234, 0.04) 100%)',
                            animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                          }} 
                        />
                        <Box sx={{ mt: 2 }}>
                          <Skeleton 
                            variant="rectangular" 
                            width="100%" 
                            height={36} 
                            sx={{ 
                              borderRadius: 2,
                              background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.06) 100%)',
                              animation: 'pulse 1.5s ease-in-out infinite 0.6s'
                            }} 
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <Card sx={{ 
                height: 'fit-content',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent>
                  <Stack alignItems="center" spacing={2} sx={{ py: { xs: 3, sm: 4 } }}>
                    <Typography variant="h6" color="error">
                      Error loading projects
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ maxWidth: '400px' }}
                    >
                      {error}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={handleRefresh}
                      sx={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        borderRadius: 2,
                        py: 1.5,
                        px: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: '#5a67d8',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : filteredAndSortedProjects.length === 0 ? (
              <Card sx={{ 
                height: 'fit-content',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent>
                  <Stack alignItems="center" spacing={2} sx={{ py: { xs: 3, sm: 4 } }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}>
                      <AssignmentIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" sx={{
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      textAlign: 'center'
                    }}>
                      {searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      align="center"
                      sx={{ maxWidth: '400px', mb: 4 }}
                    >
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                        : 'Create your first project to get started and bring your ideas to life'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateDialogOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      Create Project
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <ProjectList
                projects={filteredAndSortedProjects}
                loading={loading}
                onDelete={handleDeleteProject}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onStatusChange={handleStatusChange}
                onAddNew={() => setCreateDialogOpen(true)}
              />
            )}
          </Box>
        </Stack>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            aria-label="add project"
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              width: 64,
              height: 64,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        )}

        {/* Create Project Dialog */}
         <Dialog
           open={createDialogOpen}
           onClose={() => setCreateDialogOpen(false)}
           maxWidth="md"
           fullWidth
           fullScreen={isMobile}
           PaperProps={{
             sx: {
               borderRadius: isMobile ? 0 : 3,
               background: 'rgba(255, 255, 255, 0.98)',
               backdropFilter: 'blur(20px)',
               boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               maxHeight: '90vh',
               margin: { xs: 1, sm: 2 },
               width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
             }
           }}
         >
           <DialogTitle sx={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             backgroundClip: 'text',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
             fontWeight: 600,
             fontSize: '1.5rem',
             pb: 2
           }}>
             Create New Project
             <IconButton
               aria-label="close"
               onClick={() => setCreateDialogOpen(false)}
               sx={{
                 position: 'absolute',
                 right: 8,
                 top: 8,
               }}
             >
               <CloseIcon />
             </IconButton>
           </DialogTitle>
           <DialogContent sx={{ 
             overflow: 'auto',
             px: { xs: 2, sm: 3 },
             py: { xs: 1, sm: 2 }
           }}>
             <ProjectForm
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateProject}
              />
           </DialogContent>
         </Dialog>

        {/* Edit Project Dialog */}
         <Dialog
           open={editDialogOpen}
           onClose={() => {
             setEditDialogOpen(false);
             setEditingProject(null);
           }}
           maxWidth="md"
           fullWidth
           fullScreen={isMobile}
           PaperProps={{
             sx: {
               borderRadius: isMobile ? 0 : 3,
               background: 'rgba(255, 255, 255, 0.98)',
               backdropFilter: 'blur(20px)',
               boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               maxHeight: '90vh',
               margin: { xs: 1, sm: 2 },
               width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
             }
           }}
         >
           <DialogTitle sx={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             backgroundClip: 'text',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
             fontWeight: 600,
             fontSize: '1.5rem',
             pb: 2
           }}>
             Edit Project
             <IconButton
               aria-label="close"
               onClick={() => {
                 setEditDialogOpen(false);
                 setEditingProject(null);
               }}
               sx={{
                 position: 'absolute',
                 right: 8,
                 top: 8,
               }}
             >
               <CloseIcon />
             </IconButton>
           </DialogTitle>
           <DialogContent sx={{ 
             overflow: 'auto',
             px: { xs: 2, sm: 3 },
             py: { xs: 1, sm: 2 }
           }}>
             {editingProject && (
               <ProjectForm
                 open={editDialogOpen}
                 onClose={() => {
                   setEditDialogOpen(false);
                   setEditingProject(null);
                 }}
                 onSubmit={handleUpdateProject}
                 initialData={{
                   name: editingProject.name,
                   description: editingProject.description || '',
                   dueDate: editingProject.dueDate,
                   color: editingProject.color || '#1976d2'
                 }}
                 isEdit={true}
               />
             )}
           </DialogContent>
         </Dialog>
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              backdropFilter: 'blur(20px)',
              background: snackbarSeverity === 'success' 
                ? 'rgba(76, 175, 80, 0.95)' 
                : snackbarSeverity === 'error'
                ? 'rgba(244, 67, 54, 0.95)'
                : 'rgba(33, 150, 243, 0.95)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              '& .MuiAlert-icon': {
                color: 'white'
              },
              '& .MuiAlert-action': {
                color: 'white'
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProjectsPage;