import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Skeleton,
  Fade,
  Container,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';

import ProjectCard from './ProjectCard';
import { Project } from '../../services/projectService';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onStatusChange?: (projectId: string, status: Project['status']) => void;
  onAddNew?: () => void;
}



const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading = false,
  onDelete,
  onView,
  onEdit,
  onStatusChange,
  onAddNew
}) => {


  








  if (loading) {
    return (
      <Box>
        {/* Loading skeleton for filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={200} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </Stack>
        </Paper>
        
        {/* Loading skeleton for project cards */}
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="rectangular" width="100%" height={8} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">






      {/* Empty State */}
      {projects.length === 0 ? (
        <Fade in timeout={800}>
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 20%, rgba(25,118,210,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(66,165,245,0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box 
                sx={{ 
                  mb: 4,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      right: -10,
                      bottom: -10,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      opacity: 0.1,
                      animation: 'pulse 2s ease-in-out infinite'
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.2 }
                    }
                  }}
                >
                  <Typography sx={{ fontSize: 60 }}>📁</Typography>
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                🚀 Ready to Start?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                No Projects Yet
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 5, 
                  color: 'text.secondary', 
                  maxWidth: 500, 
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                Transform your ideas into reality! Create your first project to organize tasks, track progress, and achieve your goals with style.
              </Typography>
              {onAddNew && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={onAddNew}
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(25,118,210,0.4)'
                    }
                  }}
                >
                  ✨ Create Your First Project
                </Button>
              )}
            </Box>
          </Paper>
        </Fade>
      ) : projects.length === 0 ? (
        <Fade in timeout={800}>
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box 
                sx={{ 
                  mb: 4,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,183,77,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Typography sx={{ fontSize: 50 }}>🔍</Typography>
                </Box>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                🔍 No Projects Found
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: 'text.secondary', 
                  maxWidth: 450, 
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                No projects match the current filters. Try changing your criteria to see more results.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                sx={{ mt: 3 }}
              >

              </Stack>
            </Box>
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={project.id}>
              <Zoom in timeout={400 + index * 100} style={{ transitionDelay: `${index * 50}ms` }}>
                <div>
                  <ProjectCard 
                    project={project} 
                    onDelete={onDelete} 
                    onView={onView} 
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                  />
                </div>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectList;