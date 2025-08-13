import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, authState, error, clearError } = useAuth();

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}
        >
          <Stack spacing={3}>
            {/* Logo and Title */}
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 1
                }}
              >
                TodoList
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Organize your tasks efficiently
              </Typography>
            </Box>

            <Divider />

            {/* Error Display */}
            {error && (
              <Alert 
                severity="error" 
                onClose={clearError}
                sx={{ textAlign: 'left' }}
              >
                {error}
              </Alert>
            )}

            {/* Login Section */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Sign in to continue
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={
                  authState === 'loading' ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <GoogleIcon />
                  )
                }
                onClick={handleGoogleLogin}
                disabled={authState === 'loading'}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  backgroundColor: '#4285f4',
                  '&:hover': {
                    backgroundColor: '#3367d6'
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc'
                  }
                }}
              >
                {authState === 'loading' ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </Box>

            {/* Features */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Features:
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  ✓ Secure Google Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Real-time Data Sync
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Cross-device Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Priority & Category Management
                </Typography>
              </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;