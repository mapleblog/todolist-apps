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
  Divider,
  Fade,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import { Google as GoogleIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn, error, clearError, loading } = useAuth();
  const theme = useTheme();

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await signIn();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };



  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                maxWidth: 420,
                textAlign: 'center',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}, 
                           0 2px 16px ${alpha(theme.palette.common.black, 0.05)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}, 
                             0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`
                }
              }}
            >
              <Stack spacing={3}>
                {/* Logo and Title */}
                <Slide direction="down" in timeout={1000}>
                  <Box>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h3"
                      component="h1"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      TodoList
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontWeight: 400,
                        fontSize: '1.1rem'
                      }}
                    >
                      Organize your tasks efficiently
                    </Typography>
                  </Box>
                </Slide>

                <Divider />

                {/* Error Display */}
                {error && (
                  <Fade in timeout={300}>
                    <Alert 
                      severity="error" 
                      onClose={clearError}
                      sx={{ 
                        textAlign: 'left',
                        mb: 3,
                        borderRadius: 2,
                        background: alpha('#f44336', 0.1),
                        border: '1px solid',
                        borderColor: alpha('#f44336', 0.2),
                        '& .MuiAlert-icon': {
                          color: '#f44336'
                        },
                        '& .MuiAlert-message': {
                          fontWeight: 400
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {/* Login Section */}
                <Slide direction="up" in timeout={1200}>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ 
                        mb: 3,
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      Sign in to continue
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <GoogleIcon />
                        )
                      }
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                        boxShadow: `0 4px 15px ${alpha('#4285f4', 0.3)}`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3367d6 0%, #2d8f47 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${alpha('#4285f4', 0.4)}`
                        },
                        '&:disabled': {
                          background: alpha(theme.palette.action.disabled, 0.12),
                          transform: 'none',
                          boxShadow: 'none'
                        },
                        '&:active': {
                          transform: 'translateY(0px)'
                        }
                      }}
                    >
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Button>
                  </Box>
                </Slide>



                {/* Footer */}
                <Slide direction="up" in timeout={1600}>
                  <Box>
                    <Divider 
                      sx={{ 
                        my: 3,
                        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`
                      }} 
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: '0.9rem',
                        letterSpacing: '0.5px',
                        mb: 2
                      }}
                    >
                      🔒 Secure • ⚡ Fast • 🛡️ Reliable
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </Typography>
                  </Box>
                </Slide>
              </Stack>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;