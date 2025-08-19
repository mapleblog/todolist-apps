import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Fade,
  Button,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

import {
  ProjectList,
  ProjectForm,
  Project,
  CreateProjectData
} from '../components/project';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { createProject } from '../services/projectService';

const ProjectsPage: React.FC = () => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const {
    projects,
    loading,
    error,
    fetchProjects,
    deleteProject
  } = useProjects();

  // Local state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // State for search, filter, and sort (TODO: Implement when components are ready)
  // const [searchQuery, setSearchQuery] = useState('');
  // const [filter, setFilter] = useState<any>({
  //   status: 'all',
  //   priority: 'all'
  // });
  // const [sort, setSort] = useState<any>({
  //   field: 'createdAt',
  //   direction: 'desc'
  // });

  // Load projects on component mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);





  const handleViewProject = (project: Project) => {
    // View functionality is handled within ProjectCard component
    console.log('Viewing project:', project.name);
  };



  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      showSnackbar('Project deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete project:', error);
      showSnackbar('Failed to delete project. Please try again.', 'error');
    }
  };

  const handleAddNew = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateProject = async (projectData: CreateProjectData) => {
    if (!user) {
      showSnackbar('Please log in to create a project.', 'error');
      return;
    }

    try {
      await createProject(user.uid, projectData);
      showSnackbar('Project created successfully!', 'success');
      setCreateDialogOpen(false);
      // Refresh projects list
      await fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      showSnackbar('Failed to create project. Please try again.', 'error');
    }
  };





  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to access your projects.
        </Alert>
      </Container>
    );
  }

  // Calculate project statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;

  return (
    <>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={4}>
            {/* Header */}
            <Fade in timeout={600}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  fontWeight="800"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  My Projects
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontWeight: 500, maxWidth: 600, mx: 'auto' }}
                >
                  Manage and organize your projects efficiently with our modern dashboard
                </Typography>
              </Box>
            </Fade>

            {/* Error Display */}
            {error && (
              <Fade in timeout={800}>
                <Alert 
                  severity="error" 
                  onClose={() => {}}
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(211, 47, 47, 0.2)',
                    border: '1px solid rgba(211, 47, 47, 0.3)'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Project Statistics Cards */}
            {!loading && (
              <Fade in timeout={1000}>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={8}
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <AssignmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                          {totalProjects}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Total Projects
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={8}
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(76, 175, 80, 0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                          {activeProjects}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Active
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={8}
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(33, 150, 243, 0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                          {completedProjects}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      elevation={8}
                      sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(255, 152, 0, 0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <PauseIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
                          {onHoldProjects}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          On Hold
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Fade>
            )}

            {/* Quick Actions Card */}
            {!loading && (
              <Fade in timeout={1200}>
                <Card
                  elevation={12}
                  sx={{
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                      border: '2px solid rgba(102, 126, 234, 0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <Box>
                        <Typography 
                          variant="h5" 
                          fontWeight="700"
                          sx={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                          }}
                        >
                          Projects Overview
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {totalProjects > 0 
                            ? `You have ${totalProjects} project${totalProjects !== 1 ? 's' : ''} in your workspace`
                            : 'Start by creating your first project'
                          }
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                        size="large"
                        sx={{
                          borderRadius: 4,
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                      >
                        New Project
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            )}

          {/* Dashboard - TODO: Implement ProjectDashboard component */}
          {/* <ProjectDashboard projects={projects} loading={loading} /> */}

          {/* Filters - TODO: Implement ProjectFilters component */}
          {/* <ProjectFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
          /> */}

          {/* Content */}
          {loading ? (
            <Fade in timeout={400}>
              <Stack spacing={4}>
                {/* Statistics Cards Skeleton */}
                <Grid container spacing={3}>
                  {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item}>
                      <Card elevation={8} sx={{ borderRadius: 4 }}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 2 }} />
                          <Skeleton variant="text" width={60} height={40} sx={{ mx: 'auto', mb: 1 }} />
                          <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Overview Card Skeleton */}
                <Card elevation={12} sx={{ borderRadius: 5 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width={300} height={24} />
                      </Box>
                      <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: 4 }} />
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Project List Skeleton */}
                <Card elevation={8} sx={{ borderRadius: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
                  </CardContent>
                </Card>
              </Stack>
            </Fade>
          ) : projects.length === 0 ? (
            <Fade in timeout={1400}>
              <Card 
                elevation={16}
                sx={{ 
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 28px 80px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(102, 126, 234, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 8, textAlign: 'center' }}>
                  <AssignmentIcon 
                    sx={{ 
                      fontSize: 80, 
                      color: 'primary.main', 
                      mb: 3,
                      opacity: 0.7
                    }} 
                  />
                  <Typography 
                    variant="h4" 
                    fontWeight="700"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    No projects yet
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    Create your first project to get started with organizing your work and tracking progress.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                    sx={{
                      borderRadius: 4,
                      fontWeight: 600,
                      px: 6,
                      py: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          ) : (
            <Fade in timeout={1400}>
              <Card
                elevation={12}
                sx={{
                  borderRadius: 5,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                    border: '2px solid rgba(102, 126, 234, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <ProjectList
                    projects={projects}
                    loading={loading}
                    onDelete={handleDeleteProject}
                    onView={handleViewProject}
                    onAddNew={handleAddNew}
                  />
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Results Summary */}
          {!loading && projects.length > 0 && (
            <Fade in timeout={1600}>
              <Card 
                elevation={6}
                sx={{ 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Chip
                    label={`${projects.length} project${projects.length !== 1 ? 's' : ''} in workspace`}
                    variant="outlined"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1,
                      borderRadius: 3
                    }}
                  />
                </CardContent>
              </Card>
            </Fade>
          )}
        </Stack>

        {/* Floating Add Button - TODO: Implement FloatingAddButton component */}
        {/* <FloatingAddButton onClick={() => setCreateDialogOpen(true)} /> */}
      </Container>
      </Box>

      {/* Project Creation Dialog */}
      <ProjectForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProjectsPage;