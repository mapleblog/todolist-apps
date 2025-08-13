import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,

  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';


interface UserProfileProps {
  variant?: 'compact' | 'full';
  showMenu?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  variant = 'full', 
  showMenu = true 
}) => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={user.displayName || user.email}>
          <Avatar
            src={user.photoURL || undefined}
            alt={user.displayName || user.email || 'User'}
            sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
          >
            {!user.photoURL && (user.displayName ? getInitials(user.displayName) : <PersonIcon />)}
          </Avatar>
        </Tooltip>
        {showMenu && (
          <>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ p: 0.5 }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign Out</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Avatar
        src={user.photoURL || undefined}
        alt={user.displayName || user.email || 'User'}
        sx={{ width: 56, height: 56 }}
      >
        {!user.photoURL && (user.displayName ? getInitials(user.displayName) : <PersonIcon />)}
      </Avatar>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 'medium',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {user.displayName || 'User'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {user.email}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Google Account"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem', height: 20 }}
          />
          {user.emailVerified && (
            <Chip
              label="Verified"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
          )}
        </Box>
      </Box>

      {showMenu && (
        <Box>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { minWidth: 180 }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;