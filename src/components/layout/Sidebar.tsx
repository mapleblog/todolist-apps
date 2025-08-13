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
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FolderOpen as ProjectsIcon,
  Assignment as TasksIcon,
  School as StudyIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

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

  const handleToggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
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

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
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
              fontSize: '0.75rem'
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