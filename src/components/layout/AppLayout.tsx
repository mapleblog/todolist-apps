import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { DashboardPage, ProjectsPage, TodoPage } from '../../pages';
import ProjectDetailPage from '../../pages/ProjectDetailPage';
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuItemSelect = (item: string) => {
    setSelectedMenuItem(item);
    setSelectedProjectId(null); // Clear project selection when changing menu
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedMenuItem('project-detail');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedMenuItem('projects');
  };

  const renderPageContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return selectedProjectId ? (
          <ProjectDetailPage 
            projectId={selectedProjectId} 
            onBack={handleBackToProjects}
          />
        ) : (
          <ProjectsPage onProjectSelect={handleProjectSelect} />
        );
      case 'project-detail':
        return selectedProjectId ? (
          <ProjectDetailPage 
            projectId={selectedProjectId} 
            onBack={handleBackToProjects}
          />
        ) : (
          <ProjectsPage onProjectSelect={handleProjectSelect} />
        );
      case 'tasks':
        return <TodoPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar
          open={sidebarOpen}
          onToggle={handleSidebarToggle}
          selectedItem={selectedMenuItem}
          onItemSelect={handleMenuItemSelect}
        />
      )}

      {/* Main Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>


      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {isAuthenticated ? (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {renderPageContent()}
          </Box>
        ) : (
          children
        )}
      </Box>

        {/* Footer */}
        {isAuthenticated && (
          <Box
            component="footer"
            sx={{
              py: 2,
              px: 3,
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              © 2024 TodoList. Built with React, TypeScript & Firebase.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AppLayout;