import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { UserProfile } from '../auth';
import { useAuth } from '../../contexts/AuthContext';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isAuthenticated = !!user;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 }
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                minHeight: 'calc(100vh - 120px)'
              }}
            >
              {children}
            </Paper>
          </Container>
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
  );
};

export default AppLayout;