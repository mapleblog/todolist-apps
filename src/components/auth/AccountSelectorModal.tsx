import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Modal,
  Backdrop,
  Fade,
  Link
} from '@mui/material';
import {
  Google as GoogleIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Mock account interface
export interface MockAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isDefault?: boolean;
}

// Component props interface
export interface AccountSelectorModalProps {
  open: boolean;
  onClose: () => void;
  accounts?: MockAccount[];
  onAccountSelect?: (account: MockAccount) => void;
  onUseAnotherAccount?: () => void;
}

// Mock account data
const defaultAccounts: MockAccount[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20man%20with%20short%20brown%20hair%20and%20friendly%20smile&image_size=square',
    isDefault: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20woman%20with%20blonde%20hair%20and%20confident%20expression&image_size=square'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle-aged%20man%20with%20glasses%20and%20beard&image_size=square'
  }
];

const AccountSelectorModal: React.FC<AccountSelectorModalProps> = ({
  open,
  onClose,
  accounts = defaultAccounts,
  onAccountSelect,
  onUseAnotherAccount
}) => {
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);

  // Handle escape key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);

  const handleAccountClick = (account: MockAccount) => {
    console.log('Account selected:', account);
    if (onAccountSelect) {
      onAccountSelect(account);
    }
    onClose();
  };

  const handleUseAnotherAccount = () => {
    console.log('Use another account clicked');
    if (onUseAnotherAccount) {
      onUseAnotherAccount();
    }
    onClose();
  };



  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Fade in={open}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 450,
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 3,
            position: 'relative',
            outline: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GoogleIcon sx={{ fontSize: 24, color: '#4285f4' }} />
              <Typography variant="h6" sx={{ fontWeight: 400, color: '#202124' }}>
                Choose an account
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: '#5f6368',
                '&:hover': {
                  backgroundColor: '#f1f3f4'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography
            variant="body2"
            sx={{
              px: 3,
              pb: 2,
              color: '#5f6368',
              fontSize: '14px'
            }}
          >
            to continue to TodoList App
          </Typography>

          {/* Account List */}
          <List sx={{ p: 0 }}>
            {accounts.map((account, index) => (
              <ListItem
                key={account.id}
                button
                onClick={() => handleAccountClick(account)}
                onMouseEnter={() => setHoveredAccount(account.id)}
                onMouseLeave={() => setHoveredAccount(null)}
                sx={{
                  px: 3,
                  py: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: hoveredAccount === account.id ? '#f8f9fa' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f8f9fa'
                  },
                  borderTop: index === 0 ? '1px solid #e8eaed' : 'none',
                  borderBottom: '1px solid #e8eaed'
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={account.avatar}
                    alt={account.name}
                    sx={{
                      width: 40,
                      height: 40,
                      border: account.isDefault ? '2px solid #1976d2' : '1px solid #dadce0'
                    }}
                  >
                    {account.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 400,
                        color: '#202124',
                        fontSize: '16px'
                      }}
                    >
                      {account.name}
                      {account.isDefault && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            fontSize: '12px',
                            color: '#1976d2',
                            fontWeight: 500
                          }}
                        >
                          (Default)
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#5f6368',
                        fontSize: '14px',
                        mt: 0.5
                      }}
                    >
                      {account.email}
                    </Typography>
                  }
                />
                {hoveredAccount === account.id && (
                  <ArrowForwardIcon
                    sx={{
                      color: '#5f6368',
                      fontSize: 20,
                      opacity: 0.7
                    }}
                  />
                )}
              </ListItem>
            ))}

            {/* Use another account option */}
            <ListItem
              button
              onClick={handleUseAnotherAccount}
              sx={{
                px: 3,
                py: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f8f9fa'
                },
                borderBottom: '1px solid #e8eaed'
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dadce0',
                    width: 40,
                    height: 40
                  }}
                >
                  <PersonAddIcon sx={{ color: '#5f6368', fontSize: 20 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      color: '#1976d2',
                      fontSize: '16px'
                    }}
                  >
                    Use another account
                  </Typography>
                }
              />
            </ListItem>
          </List>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              pt: 2,
              display: 'flex',
              justifyContent: 'center',
              gap: 3
            }}
          >
            <Link
              href="#"
              underline="none"
              sx={{
                color: '#5f6368',
                fontSize: '12px',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{
                color: '#5f6368',
                fontSize: '12px',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default AccountSelectorModal;