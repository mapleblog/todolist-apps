import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
  Snackbar,
  Stack,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  ProjectList,
  ProjectForm,
  Project,
  CreateProjectData,
  UpdateProjectData
} from '../components/project';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';

const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects
  } = useProjects();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  // Load projects on component mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleViewProject = (project: Project) => {
    // View functionality is handled within ProjectCard component
    console.log('Viewing project:', project.name);
  };

  const handleFormSubmit = async (projectData: CreateProjectData | UpdateProjectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData as UpdateProjectData);
        showSnackbar('Project updated successfully!', 'success');
      } else {
        await addProject(projectData as CreateProjectData);
        showSnackbar('Project created successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      showSnackbar('Failed to save project. Please try again.', 'error');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProject(null);
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

  const handleStatusChange = async (projectId: string, status: Project['status']) => {
    try {
      await updateProject(projectId, { status });
      showSnackbar(`Project status updated to ${status}!`, 'success');
    } catch (error) {
      console.error('Failed to update project status:', error);
      showSnackbar('Failed to update project status. Please try again.', 'error');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshProjects();
      showSnackbar('Projects refreshed!', 'success');
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      showSnackbar('Failed to refresh projects.', 'error');
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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Projects
          </Typography>
          
          {!isMobile && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Project Statistics */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Project Overview
          </Typography>
          <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
            <Box>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {projects.filter(p => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {projects.filter(p => p.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {projects.filter(p => p.status === 'on-hold').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Hold
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Project List */}
        <ProjectList
          projects={projects}
          loading={loading}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onView={handleViewProject}
          onStatusChange={handleStatusChange}
          onAddNew={handleAddProject}
        />
      </Stack>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add project"
        onClick={handleAddProject}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Project Form Dialog */}
      <ProjectForm
        open={isFormOpen}
        onClose={handleFormCancel}
        onSubmit={handleFormSubmit}
        project={editingProject}
        loading={loading}
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
    </Container>
  );
};

export default ProjectsPage;