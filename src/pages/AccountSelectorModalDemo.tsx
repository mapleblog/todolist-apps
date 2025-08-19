import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Chip
} from '@mui/material';
import { Google as GoogleIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AccountSelectorModal, MockAccount } from '../components/auth';

const AccountSelectorModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MockAccount | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setLastAction('Modal opened');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLastAction('Modal closed');
  };

  const handleAccountSelect = (account: MockAccount) => {
    setSelectedAccount(account);
    setLastAction(`Account selected: ${account.name} (${account.email})`);
    console.log('Account selected in demo:', account);
  };

  const handleUseAnotherAccount = () => {
    setLastAction('"Use another account" clicked');
    console.log('Use another account clicked in demo');
  };

  const resetDemo = () => {
    setSelectedAccount(null);
    setLastAction('');
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.history.back()}
          sx={{ mb: 2 }}
        >
          Back to Previous Page
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Google OAuth Account Selector Modal Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This demo showcases the AccountSelectorModal component that mimics Google's OAuth 2.0 account selection interface in a modal popup format.
        </Typography>
      </Box>

      {/* Demo Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Demo Controls
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleOpenModal}
            sx={{
              backgroundColor: '#4285f4',
              '&:hover': {
                backgroundColor: '#3367d6'
              }
            }}
          >
            Sign in with Google
          </Button>
          <Button
            variant="outlined"
            onClick={resetDemo}
            disabled={!selectedAccount && !lastAction}
          >
            Reset Demo
          </Button>
        </Stack>
      </Paper>

      {/* Status Display */}
      {lastAction && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Last Action:</strong> {lastAction}
          </Typography>
        </Alert>
      )}

      {/* Selected Account Display */}
      {selectedAccount && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Selected Account
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={selectedAccount.avatar}
              alt={selectedAccount.name}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #1976d2'
              }}
            />
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {selectedAccount.name}
                {selectedAccount.isDefault && (
                  <Chip
                    label="Default"
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAccount.email}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Features List */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Modal Features
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Modal Overlay:</strong> Backdrop with blur effect and click-to-close
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Keyboard Support:</strong> Press Escape key to close the modal
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Smooth Animations:</strong> Fade in/out transitions with Material-UI
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Google Design:</strong> Authentic Google OAuth interface styling
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Responsive Design:</strong> Works on both desktop and mobile devices
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Focus Management:</strong> Proper focus handling for accessibility
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Event Callbacks:</strong> Account selection and "use another account" handlers
          </Typography>
        </Box>
      </Paper>

      {/* Account Selector Modal */}
      <AccountSelectorModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onAccountSelect={handleAccountSelect}
        onUseAnotherAccount={handleUseAnotherAccount}
      />
    </Container>
  );
};

export default AccountSelectorModalDemo;