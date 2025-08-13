import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FolderOpen as ProjectsIcon,
  Assignment as TasksIcon,
  School as StudyIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  selectedItem: string;
  onItemSelect: (item: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <ProjectsIcon />
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <TasksIcon />
  },
  {
    id: 'study',
    label: 'Study',
    icon: <StudyIcon />
  }
];

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  selectedItem,
  onItemSelect
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const drawerWidth = collapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          minHeight: 64,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Menu
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedItem === item.id}
              onClick={() => onItemSelect(item.id)}
              sx={{
                mx: 1,
                borderRadius: 1,
                minHeight: 48,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText'
                  }
                },
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  justifyContent: 'center',
                  color: selectedItem === item.id ? 'inherit' : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: selectedItem === item.id ? 600 : 400
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Section */}
      {isAuthenticated && user && (
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {(!collapsed || isMobile) && (
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1.5
                }}
              >
                <Avatar
                  src={user.photoURL || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main'
                  }}
                >
                  {!user.photoURL && (
                    <PersonIcon sx={{ fontSize: 20 }} />
                  )}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.displayName || 'User'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  py: 0.75,
                  '&:hover': {
                     borderColor: 'primary.main',
                     backgroundColor: 'primary.main',
                     color: 'primary.contrastText'
                   }
                }}
              >
                Sign Out
              </Button>
            </Box>
          )}
          {(collapsed && !isMobile) && (
            <Box
              sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Avatar
                src={user.photoURL || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main'
                }}
              >
                {!user.photoURL && (
                  <PersonIcon sx={{ fontSize: 16 }} />
                )}
              </Avatar>
              <IconButton
                size="small"
                onClick={handleSignOut}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                     backgroundColor: 'primary.main',
                     color: 'primary.contrastText'
                   }
                }}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          p: 1,
          borderTop: isAuthenticated && user ? 'none' : '1px solid',
          borderColor: 'divider'
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              fontSize: '0.7rem'
            }}
          >
            TodoList v1.0
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
export type { SidebarProps };