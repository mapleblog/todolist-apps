import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { UserProfile } from '../auth';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { DashboardPage, ProjectsPage, StudyPage, TodoPage } from '../../pages';
interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showUserProfile?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = 'TodoList',
  showUserProfile = true
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
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 }
          }}
        >
          {/* Menu Button and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{
                  display: { md: 'none' },
                  color: 'text.primary'
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              {title}
            </Typography>
            {!isMobile && isAuthenticated && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  ml: 1,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  fontSize: '0.75rem'
                }}
              >
                Personal Workspace
              </Typography>
            )}
          </Box>

          {/* User Profile */}
          {showUserProfile && isAuthenticated && (
            <UserProfile variant="compact" showMenu={true} />
          )}
        </Toolbar>
      </AppBar>

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