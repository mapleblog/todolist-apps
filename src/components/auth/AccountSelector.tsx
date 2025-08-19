import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Container,
  alpha,
  useTheme,
  Fade,
  Slide
} from '@mui/material';
import {
  Google as GoogleIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Mock account data interface
export interface MockAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Component props interface
interface AccountSelectorProps {
  onAccountSelect?: (account: MockAccount) => void;
  onUseAnotherAccount?: () => void;
  onCancel?: () => void;
}

// Mock account data for demonstration
const mockAccounts: MockAccount[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20man%20with%20short%20brown%20hair%20wearing%20a%20blue%20shirt%20smiling%20confidently&image_size=square',
    isActive: true
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20woman%20with%20blonde%20hair%20wearing%20a%20white%20blouse%20smiling%20warmly&image_size=square'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@gmail.com',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20an%20asian%20man%20with%20black%20hair%20wearing%20a%20gray%20sweater%20smiling%20professionally&image_size=square'
  }
];

const AccountSelector: React.FC<AccountSelectorProps> = ({
  onAccountSelect,
  onUseAnotherAccount,
  onCancel
}) => {
  const theme = useTheme();
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);

  const handleAccountClick = (account: MockAccount) => {
    if (onAccountSelect) {
      onAccountSelect(account);
    }
  };

  const handleUseAnotherAccount = () => {
    if (onUseAnotherAccount) {
      onUseAnotherAccount();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              width: '100%',
              maxWidth: 450,
              margin: '0 auto',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}, 
                         0 2px 16px ${alpha(theme.palette.common.black, 0.04)}`,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Slide direction="down" in timeout={800}>
              <Box
                sx={{
                  p: 3,
                  pb: 2,
                  textAlign: 'center',
                  borderBottom: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.08)
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <GoogleIcon
                    sx={{
                      fontSize: 32,
                      color: '#4285f4',
                      mr: 1
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      color: '#5f6368',
                      fontSize: '22px',
                      fontFamily: 'Google Sans, Roboto, sans-serif'
                    }}
                  >
                    Google
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    color: '#202124',
                    fontSize: '24px',
                    fontFamily: 'Google Sans, Roboto, sans-serif',
                    mb: 1
                  }}
                >
                  Choose an account
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#5f6368',
                    fontSize: '14px',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                >
                  to continue to TodoList
                </Typography>
              </Box>
            </Slide>

            {/* Account List */}
            <Slide direction="up" in timeout={1000}>
              <Box>
                <List sx={{ p: 0 }}>
                  {mockAccounts.map((account, index) => (
                    <React.Fragment key={account.id}>
                      <ListItem
                        disablePadding
                        sx={{
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: alpha('#4285f4', 0.04)
                          }
                        }}
                        onMouseEnter={() => setHoveredAccount(account.id)}
                        onMouseLeave={() => setHoveredAccount(null)}
                      >
                        <ListItemButton
                          onClick={() => handleAccountClick(account)}
                          sx={{
                            py: 2,
                            px: 3,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={account.avatar}
                              alt={account.name}
                              sx={{
                                width: 40,
                                height: 40,
                                border: account.isActive ? '2px solid #4285f4' : '2px solid transparent',
                                transition: 'all 0.2s ease-in-out',
                                transform: hoveredAccount === account.id ? 'scale(1.05)' : 'scale(1)'
                              }}
                            >
                              {account.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 400,
                                  color: '#202124',
                                  fontSize: '16px',
                                  fontFamily: 'Roboto, sans-serif'
                                }}
                              >
                                {account.name}
                                {account.isActive && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 1,
                                      py: 0.25,
                                      backgroundColor: alpha('#4285f4', 0.1),
                                      color: '#4285f4',
                                      borderRadius: 1,
                                      fontSize: '12px',
                                      fontWeight: 500
                                    }}
                                  >
                                    Active
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
                                  fontFamily: 'Roboto, sans-serif'
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
                        </ListItemButton>
                      </ListItem>
                      {index < mockAccounts.length - 1 && (
                        <Divider sx={{ mx: 3, borderColor: alpha(theme.palette.divider, 0.06) }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>

                {/* Use Another Account */}
                <Box sx={{ p: 3, pt: 2 }}>
                  <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.divider, 0.06) }} />
                  <Button
                    variant="text"
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    onClick={handleUseAnotherAccount}
                    sx={{
                      py: 1.5,
                      px: 2,
                      color: '#1a73e8',
                      fontWeight: 500,
                      fontSize: '14px',
                      fontFamily: 'Google Sans, Roboto, sans-serif',
                      textTransform: 'none',
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                      '&:hover': {
                        backgroundColor: alpha('#1a73e8', 0.04)
                      }
                    }}
                  >
                    Use another account
                  </Button>
                </Box>
              </Box>
            </Slide>

            {/* Footer */}
            <Slide direction="up" in timeout={1200}>
              <Box
                sx={{
                  p: 3,
                  pt: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.06)
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#5f6368',
                    fontSize: '12px',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                >
                  Privacy Policy • Terms of Service
                </Typography>
                {onCancel && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={onCancel}
                    sx={{
                      color: '#5f6368',
                      fontSize: '12px',
                      fontFamily: 'Roboto, sans-serif',
                      textTransform: 'none',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: alpha('#5f6368', 0.04)
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Slide>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AccountSelector;
export type { AccountSelectorProps };