import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const { user, authState } = useAuth();

  // Show loading state while checking authentication
  if (authState === 'loading') {
    return (
      fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && (!user || authState !== 'authenticated')) {
    return <LoginPage />;
  }

  // If authentication is not required or user is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;