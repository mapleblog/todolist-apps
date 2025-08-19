import React from 'react';
import {
  Fab,
  Zoom,
  useTheme,
  alpha,
  keyframes
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface FloatingAddButtonProps {
  onClick: () => void;
  show?: boolean;
}

// Pulse animation keyframes
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ 
  onClick, 
  show = true 
}) => {
  const theme = useTheme();

  return (
    <Zoom in={show} timeout={300}>
      <Fab
        color="primary"
        aria-label="add todo"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: theme.zIndex.speedDial,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.shadows[8],
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: `${pulseAnimation} 2s infinite`,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: theme.shadows[12],
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            animation: 'none',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          },
          // Mobile specific styles
          [theme.breakpoints.down('sm')]: {
            '&:hover': {
              transform: 'none',
              boxShadow: theme.shadows[8],
            }
          }
        }}
      >
        <Add 
          sx={{ 
            fontSize: { xs: 24, sm: 28 },
            transition: 'transform 0.2s ease-in-out',
            '.MuiFab-root:hover &': {
              transform: 'rotate(90deg)'
            }
          }} 
        />
      </Fab>
    </Zoom>
  );
};

export default FloatingAddButton;