import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Fab,
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
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  TodoList,
  TodoForm,
  TodoFilters,
  TodoStats,
  Todo,
  TodoFilter,
  TodoSort
} from '../components/todo';
import { useTodos } from '../contexts/TodoContext';
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
  const filteredTodos = todos.filter(todo => {
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
        const priorityOrder = { high: 3, medium: 2, low: 1 };
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

  const handleAddTodo = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

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

  const handleRefresh = async () => {
    try {
      await fetchTodos();
      showSnackbar('Todos refreshed!', 'success');
    } catch (error) {
      console.error('Failed to refresh todos:', error);
      showSnackbar('Failed to refresh todos.', 'error');
    }
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            My Todos
          </Typography>
          
          {!isMobile && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        <TodoStats compact={isMobile} />

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
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              {[...Array(3)].map((_, index) => (
                <Box key={index}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : sortedTodos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            {todos.length === 0 ? (
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  No todos yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first todo to get started!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddTodo}
                  size="large"
                >
                  Add Your First Todo
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  No todos match your filters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter({ status: 'all', priority: 'all', category: 'all' });
                  }}
                >
                  Clear Filters
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
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Showing {sortedTodos.length} of {todos.length} todos
              {searchQuery && ` matching "${searchQuery}"`}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add todo"
        onClick={handleAddTodo}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

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
    </Container>
  );
};

export default TodoPage;