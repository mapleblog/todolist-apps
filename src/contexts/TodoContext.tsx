import React, { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  batchDeleteTodos,
} from '@/services/todoService';
import {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoFilters,
  TodoSortOptions,
  AppState,
  NetworkStatus,
} from '@/types';
import { useAuth } from './AuthContext';
import { OfflineStorageService } from '@/services/offlineStorage';
import { useNetworkStatus } from '@/services/networkStatus';
import { SyncService } from '@/services/syncService';
import { OperationQueueService } from '@/services/operationQueue';
import { ConflictResolverService } from '@/services/conflictResolver';
import { ConflictResolution } from '@/types';

// Todo action types
type TodoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'DELETE_MULTIPLE_TODOS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: TodoFilters }
  | { type: 'SET_SORT_OPTIONS'; payload: TodoSortOptions }
  | { type: 'CLEAR_TODOS' };

// Initial todo state
const initialTodoState: AppState = {
  todos: [],
  filters: {},
  sortOptions: {
    sortBy: 'createdAt',
    order: 'desc',
  },
  loading: false,
  error: null,
};

// Todo reducer
const todoReducer = (state: AppState, action: TodoAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
        loading: false,
        error: null,
      };
    case 'ADD_TODO':
      return {
        ...state,
        todos: [action.payload, ...state.todos],
        loading: false,
        error: null,
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? action.payload : todo
        ),
        loading: false,
        error: null,
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'DELETE_MULTIPLE_TODOS':
      return {
        ...state,
        todos: state.todos.filter((todo) => !action.payload.includes(todo.id)),
        loading: false,
        error: null,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      };
    case 'SET_SORT_OPTIONS':
      return {
        ...state,
        sortOptions: action.payload,
      };
    case 'CLEAR_TODOS':
      return {
        ...state,
        todos: [],
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Todo context type
interface TodoContextType {
  // State
  todos: Todo[];
  filteredTodos: Todo[];
  filters: TodoFilters;
  sortOptions: TodoSortOptions;
  loading: boolean;
  error: string | null;
  
  // Offline support state
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperationsCount: number;
  conflictsCount: number;
  
  // Actions
  fetchTodos: () => Promise<void>;
  addTodo: (todoData: CreateTodoData) => Promise<void>;
  updateTodoItem: (id: string, updateData: UpdateTodoData) => Promise<void>;
  deleteTodoItem: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteMultipleTodos: (ids: string[]) => Promise<void>;
  setFilters: (filters: TodoFilters) => void;
  setSortOptions: (sortOptions: TodoSortOptions) => void;
  clearError: () => void;
  
  // Offline support actions
  syncNow: () => Promise<void>;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  resolveConflict: (todoId: string, resolution: ConflictResolution) => Promise<void>;
  getConflicts: () => Promise<any[]>;
  
  // Computed properties
  todosCount: {
    total: number;
    completed: number;
    pending: number;
  };
}

// Create todo context
const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Todo provider props
interface TodoProviderProps {
  children: ReactNode;
}

// Helper function to apply filters and sorting
const applyFiltersAndSort = (
  todos: Todo[],
  filters: TodoFilters,
  sortOptions: TodoSortOptions
): Todo[] => {
  let filtered = [...todos];

  // Apply filters
  if (filters.completed !== undefined) {
    filtered = filtered.filter((todo) => todo.completed === filters.completed);
  }
  
  if (filters.priority) {
    filtered = filtered.filter((todo) => todo.priority === filters.priority);
  }
  
  if (filters.category) {
    filtered = filtered.filter((todo) => todo.category === filters.category);
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (todo) =>
        todo.title.toLowerCase().includes(searchTerm) ||
        todo.description?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.dueDateRange) {
    const { start, end } = filters.dueDateRange;
    filtered = filtered.filter((todo) => {
      if (!todo.dueDate) return false;
      const dueDate = todo.dueDate;
      if (start && dueDate < start) return false;
      if (end && dueDate > end) return false;
      return true;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const { sortBy, order } = sortOptions;
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // Handle date values
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();

    // Handle string values
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    // Handle priority sorting
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      aValue = priorityOrder[a.priority];
      bValue = priorityOrder[b.priority];
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
};

// Todo provider component
export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const { user, isAuthenticated } = useAuth();
  const { status: networkStatus, isOnline } = useNetworkStatus();
  
  // Offline support services (using singleton instances)
  const [offlineStorageService] = React.useState(() => OfflineStorageService.getInstance());
  const [syncServiceInstance] = React.useState(() => SyncService.getInstance());
  const [queueServiceInstance] = React.useState(() => OperationQueueService.getInstance());
  const [conflictResolverInstance] = React.useState(() => ConflictResolverService.getInstance());
  
  // Offline support state
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [pendingOperationsCount, setPendingOperationsCount] = React.useState(0);
  const [conflictsCount, setConflictsCount] = React.useState(0);

  // Update offline status
  const updateOfflineStatus = async () => {
    try {
      const [queueStatus, conflicts] = await Promise.all([
        queueServiceInstance.getQueueStatus(),
        conflictResolverInstance.getAllConflicts()
      ]);
      
      setPendingOperationsCount(queueStatus.pendingCount);
      setConflictsCount(conflicts.length);
      setIsSyncing(syncServiceInstance.isSyncInProgress() || queueStatus.isProcessing);
    } catch (error) {
      console.error('Failed to update offline status:', error);
    }
  };

  // Fetch todos with offline support
  const fetchTodos = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      let todos: Todo[] = [];
      
      if (isOnline) {
        // Try to fetch from server first
        try {
          todos = await getTodos(user.uid);
          // Save to offline storage
          const offlineTodos = todos.map(todo => ({
            ...todo,
            syncStatus: 'synced' as const,
            lastModified: Date.now()
          }));
          await offlineStorageService.saveTodos(offlineTodos);
        } catch (error) {
          console.warn('Failed to fetch from server, loading from offline storage:', error);
          // Fallback to offline storage
          const offlineTodos = await offlineStorageService.getAllTodos(user.uid);
          todos = offlineTodos;
        }
      } else {
        // Load from offline storage when offline
        const offlineTodos = await offlineStorageService.getAllTodos(user.uid);
        todos = offlineTodos;
      }
      
      dispatch({ type: 'SET_TODOS', payload: todos });
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch todos';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [user, isOnline, offlineStorageService]);

  // Add todo with offline support
  const addTodo = async (todoData: CreateTodoData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isOnline) {
        // Online: create on server and save locally
        const newTodo = await createTodo(user.uid, todoData);
        await offlineStorageService.saveTodo({
          ...newTodo,
          syncStatus: 'synced',
          lastModified: Date.now()
        });
        dispatch({ type: 'ADD_TODO', payload: newTodo });
      } else {
        // Offline: queue operation and create local todo
        const localTodoId = await queueServiceInstance.queueCreateTodo(todoData);
        const localTodo = {
          ...todoData,
          id: localTodoId,
          userId: user.uid,
          completed: false,
          priority: todoData.priority || 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await offlineStorageService.saveTodo({
          ...localTodo,
          syncStatus: 'pending',
          lastModified: Date.now()
        });
        dispatch({ type: 'ADD_TODO', payload: localTodo });
      }
      
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Update todo with offline support
  const updateTodoItem = async (id: string, updateData: UpdateTodoData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isOnline) {
        // Online: update on server and save locally
        const updatedTodo = await updateTodo(id, user.uid, updateData);
        await offlineStorageService.saveTodo({
          ...updatedTodo,
          syncStatus: 'synced',
          lastModified: Date.now()
        });
        dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
      } else {
        // Offline: queue operation and update locally
        await queueServiceInstance.queueUpdateTodo(id, updateData);
        const currentTodo = state.todos.find(todo => todo.id === id);
        if (currentTodo) {
          const updatedTodo = {
            ...currentTodo,
            ...updateData,
            updatedAt: new Date()
          };
          await offlineStorageService.saveTodo({
            ...updatedTodo,
            syncStatus: 'pending',
            lastModified: Date.now()
          });
          dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
        }
      }
      
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Delete todo with offline support
  const deleteTodoItem = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isOnline) {
        // Online: delete from server and local storage
        await deleteTodo(id, user.uid);
        await offlineStorageService.deleteTodo(id);
        dispatch({ type: 'DELETE_TODO', payload: id });
      } else {
        // Offline: queue operation and mark as deleted locally
        await queueServiceInstance.queueDeleteTodo(id);
        await offlineStorageService.deleteTodo(id);
        dispatch({ type: 'DELETE_TODO', payload: id });
      }
      
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Toggle complete with offline support
  const toggleComplete = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isOnline) {
        // Online: toggle on server and save locally
        const updatedTodo = await toggleTodoComplete(id, user.uid);
        await offlineStorageService.saveTodo({
          ...updatedTodo,
          syncStatus: 'synced',
          lastModified: Date.now()
        });
        dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
      } else {
        // Offline: queue operation and toggle locally
        const currentTodo = state.todos.find(todo => todo.id === id);
        if (currentTodo) {
          const updatedTodo = {
            ...currentTodo,
            completed: !currentTodo.completed,
            updatedAt: new Date()
          };
          await queueServiceInstance.queueUpdateTodo(id, { completed: updatedTodo.completed });
          await offlineStorageService.saveTodo({
            ...updatedTodo,
            syncStatus: 'pending',
            lastModified: Date.now()
          });
          dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
        }
      }
      
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle todo';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Delete multiple todos with offline support
  const deleteMultipleTodos = async (ids: string[]): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (isOnline) {
        // Online: delete from server and local storage
        await batchDeleteTodos(ids, user.uid);
        await Promise.all(ids.map(id => offlineStorageService.deleteTodo(id)));
        dispatch({ type: 'DELETE_MULTIPLE_TODOS', payload: ids });
      } else {
        // Offline: queue operations and mark as deleted locally
        await Promise.all(ids.map(id => queueServiceInstance.queueDeleteTodo(id)));
        await Promise.all(ids.map(id => offlineStorageService.deleteTodo(id)));
        dispatch({ type: 'DELETE_MULTIPLE_TODOS', payload: ids });
      }
      
      await updateOfflineStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete todos';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Set filters
  const setFilters = (filters: TodoFilters): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Set sort options
  const setSortOptions = (sortOptions: TodoSortOptions): void => {
    dispatch({ type: 'SET_SORT_OPTIONS', payload: sortOptions });
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Fetch todos when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTodos();
    } else {
      dispatch({ type: 'CLEAR_TODOS' });
    }
  }, [isAuthenticated, user, fetchTodos]);

  // Computed properties
  const filteredTodos = applyFiltersAndSort(state.todos, state.filters, state.sortOptions);
  
  const todosCount = {
    total: state.todos.length,
    completed: state.todos.filter((todo) => todo.completed).length,
    pending: state.todos.filter((todo) => !todo.completed).length,
  };

  // Context value
  const contextValue: TodoContextType = {
    // State
    todos: state.todos,
    filteredTodos,
    filters: state.filters,
    sortOptions: state.sortOptions,
    loading: state.loading,
    error: state.error,
    
    // Offline support state
    networkStatus,
    isOnline,
    isSyncing,
    pendingOperationsCount,
    conflictsCount,
    
    // Actions
    fetchTodos,
    addTodo,
    updateTodoItem,
    deleteTodoItem,
    toggleComplete,
    deleteMultipleTodos,
    setFilters,
    setSortOptions,
    clearError,
    
    // Offline support actions
    syncNow: async () => {
      try {
        setIsSyncing(true);
        await syncServiceInstance.syncAll();
        await fetchTodos();
        await updateOfflineStatus();
      } catch (error) {
        console.error('Sync failed:', error);
        throw error;
      } finally {
        setIsSyncing(false);
      }
    },
    enableOfflineMode: () => {
      // Enable offline mode - this would be handled by the network status service
      console.log('Offline mode enabled');
    },
    disableOfflineMode: () => {
      // Disable offline mode - this would be handled by the network status service
      console.log('Offline mode disabled');
    },
    resolveConflict: async (todoId: string, resolution: ConflictResolution) => {
      try {
        const conflict = await conflictResolverInstance.getConflictById(todoId);
        if (conflict) {
          const strategy = resolution.resolution === 'local' ? 'local_wins' : 'remote_wins';
          await conflictResolverInstance.resolveConflict(conflict, strategy);
        }
        await fetchTodos();
        await updateOfflineStatus();
      } catch (error) {
        console.error('Failed to resolve conflict:', error);
        throw error;
      }
    },
    getConflicts: () => conflictResolverInstance.getAllConflicts(),
    
    // Computed properties
    todosCount,
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use todo context
// Export the context for use in custom hooks
export { TodoContext };

// Default export should be the provider for better Fast Refresh compatibility
export default TodoProvider;