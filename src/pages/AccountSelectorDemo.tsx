import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AccountSelector, type MockAccount } from '../components/auth';

const AccountSelectorDemo: React.FC = () => {
  const theme = useTheme();

  const handleAccountSelect = (account: MockAccount) => {
    alert(`Selected account: ${account.name} (${account.email})`);
    console.log('Account selected:', account);
  };

  const handleUseAnotherAccount = () => {
    alert('Use another account clicked');
    console.log('Use another account clicked');
  };

  const handleCancel = () => {
    alert('Cancel clicked');
    console.log('Cancel clicked');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {/* Back to App Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: alpha(theme.palette.primary.main, 0.3)
            }
          }}
        >
          Back to App
        </Button>
      </Box>

      {/* Demo Info Panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          maxWidth: 300
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.2),
            borderRadius: 2
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          >
            Demo Information
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            This is a demonstration of the Google OAuth 2.0 account selection interface.
            Click on any account to see the selection behavior.
          </Typography>
          <Alert
            severity="info"
            sx={{
              mt: 2,
              fontSize: '0.75rem',
              '& .MuiAlert-message': {
                fontSize: '0.75rem'
              }
            }}
          >
            Check the browser console for detailed logs when interacting with the component.
          </Alert>
        </Paper>
      </Box>

      {/* AccountSelector Component */}
      <AccountSelector
        onAccountSelect={handleAccountSelect}
        onUseAnotherAccount={handleUseAnotherAccount}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default AccountSelectorDemo;