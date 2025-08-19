import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
  Snackbar,
  Stack,
  Paper,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';

import {
  TodoList,
  TodoForm,
  TodoFilters,
  TodoDashboard,
  FloatingAddButton,
  Todo,
  TodoFilter,
  TodoSort
} from '../components/todo';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../contexts/AuthContext';

const TodoPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { 
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodoItem
  } = useTodos();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TodoFilter>({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [sort, setSort] = useState<TodoSort>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  // Load todos on component mount
  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, fetchTodos]);

  // Filter todos based on search query and filters
  const filteredTodos = todos.filter((todo: Todo) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description?.toLowerCase().includes(query);
      const matchesCategory = todo.category?.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }

    // Status filter
    if (filter.status !== 'all') {
      if (filter.status === 'completed' && !todo.completed) return false;
      if (filter.status === 'pending' && todo.completed) return false;
      if (filter.status === 'overdue') {
        if (todo.completed || !todo.dueDate) return false;
        const now = new Date();
        const dueDate = new Date(todo.dueDate);
        if (dueDate >= now) return false;
      }
    }

    // Priority filter
    if (filter.priority !== 'all' && todo.priority !== filter.priority) {
      return false;
    }

    // Category filter
    if (filter.category !== 'all' && todo.category !== filter.category) {
      return false;
    }

    return true;
  });

  // Sort filtered todos
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    const { field, direction } = sort;
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });



  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (todoData: any) => {
    try {
      if (editingTodo) {
        await updateTodoItem(editingTodo.id, todoData);
        showSnackbar('Todo updated successfully!', 'success');
      } else {
        await addTodo(todoData);
        showSnackbar('Todo added successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditingTodo(null);
    } catch (error) {
      console.error('Failed to save todo:', error);
      showSnackbar('Failed to save todo. Please try again.', 'error');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };



  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to access your todos.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                My Todos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Organize your tasks efficiently and boost productivity
              </Typography>
            </Box>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => {}}
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Dashboard */}
          <TodoDashboard todos={todos} loading={loading} />

          {/* Filters */}
          <TodoFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            sort={sort}
            onSortChange={setSort}
          />

          {/* Content */}
          {loading ? (
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Stack spacing={3}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index}>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="40%" height={28} />
                    <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2, borderRadius: 2 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          ) : sortedTodos.length === 0 ? (
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
              {todos.length === 0 ? (
                <Stack spacing={3} alignItems="center">
                  <Box sx={{ fontSize: 64, opacity: 0.3 }}>📝</Box>
                  <Typography variant="h5" fontWeight="600" color="text.primary">
                    No todos yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Start organizing your tasks by creating your first todo. Click the + button to get started!
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={3} alignItems="center">
                  <Box sx={{ fontSize: 64, opacity: 0.3 }}>🔍</Box>
                  <Typography variant="h5" fontWeight="600" color="text.primary">
                    No todos match your filters
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter({ status: 'all', priority: 'all', category: 'all' });
                    }}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Stack>
              )}
            </Paper>
          ) : (
            <TodoList
              onEditTodo={handleEditTodo}
              filter={filter}
              searchQuery={searchQuery}
            />
          )}

          {/* Results Summary */}
          {!loading && todos.length > 0 && (
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
            }}>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                textAlign="center"
                fontWeight="500"
              >
                Showing {sortedTodos.length} of {todos.length} todos
                {searchQuery && (
                  <Box component="span" sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    ml: 1
                  }}>
                    matching "{searchQuery}"
                  </Box>
                )}
              </Typography>
            </Paper>
          )}
        </Stack>

        {/* Floating Add Button */}
        <FloatingAddButton onClick={() => setIsFormOpen(true)} />
      </Container>
      </Box>

      {/* Todo Form Dialog */}
    <Dialog
      open={isFormOpen}
      onClose={handleFormCancel}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          ...(isMobile && {
            m: 0,
            borderRadius: 0
          })
        }
      }}
    >
      <DialogTitle>
        {editingTodo ? 'Edit Todo' : 'Add New Todo'}
      </DialogTitle>
      <DialogContent dividers>
        <TodoForm
          open={isFormOpen}
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
          todo={editingTodo}
        />
      </DialogContent>
    </Dialog>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default TodoPage;