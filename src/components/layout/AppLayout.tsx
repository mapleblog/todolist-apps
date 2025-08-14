import React, { useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { DashboardPage, ProjectsPage, StudyPage, TodoPage } from '../../pages';
import AccountSelectorDemo from '../../pages/AccountSelectorDemo';
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

  const isAuthenticated = !!user;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuItemSelect = (item: string) => {
    setSelectedMenuItem(item);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderPageContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'tasks':
        return <TodoPage />;
      case 'study':
        return <StudyPage />;
      case 'account-selector-demo':
        return <AccountSelectorDemo />;
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