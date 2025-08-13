import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
  Stack,
  Paper
} from '@mui/material';

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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Projects
          </Typography>
          

        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Project Statistics */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.01) 100%)',
          border: '1px solid rgba(25, 118, 210, 0.08)'
        }}>
          <Typography variant="h6" gutterBottom>
            Project Overview
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={4} 
            flexWrap="wrap" 
            useFlexGap
            sx={{
              '& > *': {
                minWidth: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'left' }
              }
            }}
          >
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
                {projects.filter((p: Project) => p.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {projects.filter((p: Project) => p.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {projects.filter((p: Project) => p.status === 'on-hold').length}
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
          onDelete={handleDeleteProject}
          onView={handleViewProject}
          onAddNew={handleAddNew}
        />
      </Stack>

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
    </Container>
  );
};

export default ProjectsPage;