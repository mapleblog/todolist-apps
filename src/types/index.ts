// User related types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

// Todo item types
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  category?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type TodoPriority = 'low' | 'medium' | 'high';

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: TodoPriority;
  category?: string;
  dueDate?: Date;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TodoPriority;
  category?: string;
  dueDate?: Date;
}

// Filter and sort types
export interface TodoFilters {
  completed?: boolean;
  priority?: TodoPriority;
  category?: string;
  search?: string;
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
}

export type TodoSortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TodoSortOptions {
  sortBy: TodoSortBy;
  order: SortOrder;
}

// Additional filter and sort types for components
export interface TodoFilter {
  status: 'all' | 'completed' | 'pending' | 'overdue';
  priority: 'all' | TodoPriority;
  category: 'all' | string;
}

export interface TodoSort {
  field: TodoSortBy;
  direction: SortOrder;
}

// Authentication types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Firebase error types
export interface FirebaseError {
  code: string;
  message: string;
  name: string;
}

// App state types
export interface AppState {
  todos: Todo[];
  filters: TodoFilters;
  sortOptions: TodoSortOptions;
  loading: boolean;
  error: string | null;
}

// Component prop types
export interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, data: UpdateTodoData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string) => Promise<void>;
}

export interface TodoFormProps {
  onSubmit: (data: CreateTodoData) => Promise<void>;
  loading?: boolean;
}

export interface TodoFiltersProps {
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
  sortOptions: TodoSortOptions;
  onSortChange: (sortOptions: TodoSortOptions) => void;
}

// Timestamp types for Firestore compatibility
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface FirestoreTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

// Offline support types
export interface OfflineTodo extends Todo {
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
  localId?: string;
}

export interface PendingOperation {
  id?: number;
  type: 'create' | 'update' | 'delete' | 'toggle';
  todoId: string;
  data?: CreateTodoData | UpdateTodoData | { completed: boolean };
  timestamp: number;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: OfflineTodo[];
  errors: string[];
}

export interface SyncOptions {
  forceSync?: boolean;
  resolveConflicts?: 'local' | 'remote' | 'manual';
  maxRetries?: number;
}

export interface ConflictData {
  todoId: string;
  localVersion: OfflineTodo;
  remoteVersion: Todo;
  conflictFields: string[];
  conflictType: 'update' | 'delete' | 'create';
  timestamp: number;
}

export interface ConflictResolution {
  todoId: string;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  mergedData?: Partial<Todo>;
  timestamp: number;
}

export interface ConflictResolutionResult {
  success: boolean;
  todoId: string;
  finalVersion?: Todo;
  error?: string;
}

export type ConflictResolutionStrategy = 
  | 'last_write_wins'
  | 'local_wins'
  | 'remote_wins'
  | 'manual'
  | 'smart_merge';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface NetworkStatusListener {
  (status: NetworkStatus): void;
}

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'toggle';
  todoId?: string;
  data?: CreateTodoData | UpdateTodoData | { completed: boolean };
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

export interface OperationResult {
  success: boolean;
  operationId: string;
  error?: string;
}

export interface StorageInfo {
  todoCount: number;
  pendingOperationsCount: number;
}

export interface QueueStatus {
  pendingCount: number;
  isProcessing: boolean;
  lastProcessed?: number;
}