import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import TodoProvider from './contexts/TodoContext';
import { ProtectedRoute, AppLayout } from './components';
import OfflineIndicator from './components/common/OfflineIndicator';

// Lazy load components for better performance
const TodoPage = React.lazy(() => import('./pages/TodoPage'));

// Loading component
const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

const AppContent: React.FC = () => {
  return (
    <AppLayout title="TodoList" showUserProfile={true}>
      <ProtectedRoute>
        <Box sx={{ position: 'relative' }}>
          <OfflineIndicator />
          <Suspense fallback={<LoadingFallback />}>
            <TodoPage />
          </Suspense>
        </Box>
      </ProtectedRoute>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;