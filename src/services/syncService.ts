import { Todo, CreateTodoData, UpdateTodoData } from '../types';
import { OfflineTodo, OfflineStorageService } from './offlineStorage';
import { NetworkStatusService } from './networkStatus';
import todoService from './todoService';

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

export class SyncService {
  private static instance: SyncService;
  private offlineStorage: OfflineStorageService;
  private networkService: NetworkStatusService;
  private isSyncing = false;
  private syncQueue: Set<string> = new Set();
  private autoSyncEnabled = true;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
    this.networkService = NetworkStatusService.getInstance();
    this.initialize();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initialize(): void {
    // Listen for network status changes
    this.networkService.addListener((status) => {
      if (status === 'online' && this.autoSyncEnabled) {
        this.scheduleSyncCheck();
      }
    });

    // Start periodic sync check
    this.startPeriodicSync();
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.networkService.isOnline() && this.autoSyncEnabled && !this.isSyncing) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  private scheduleSyncCheck(): void {
    // Delay sync check to avoid immediate sync on network reconnection
    setTimeout(() => {
      if (this.networkService.isOnline() && !this.isSyncing) {
        this.syncAll();
      }
    }, 2000);
  }

  // Main sync method
  public async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: ['Sync already in progress']
      };
    }

    if (!this.networkService.isOnline() && !options.forceSync) {
      console.log('Cannot sync: offline');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: ['Device is offline']
      };
    }

    this.isSyncing = true;
    console.log('Starting sync...');

    try {
      const result = await this.performSync(options);
      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error']
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private async performSync(options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Step 1: Get current user
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Step 2: Fetch remote todos
      const remoteTodos = await todoService.getTodos();
      
      // Step 3: Get local todos
      const localTodos = await this.offlineStorage.getAllTodos(currentUser.uid);

      // Step 4: Sync remote changes to local
      await this.syncRemoteToLocal(remoteTodos, localTodos, result);

      // Step 5: Sync local changes to remote
      await this.syncLocalToRemote(localTodos, options, result);

      // Step 6: Process pending operations
      await this.processPendingOperations(result);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  private async getCurrentUser(): Promise<{ uid: string } | null> {
    // This should be implemented based on your auth system
    // For now, we'll assume there's a way to get current user
    try {
      // You might need to import and use your auth context here
      return { uid: 'current-user-id' }; // Placeholder
    } catch (error) {
      return null;
    }
  }

  private async syncRemoteToLocal(
    remoteTodos: Todo[],
    localTodos: OfflineTodo[],
    result: SyncResult
  ): Promise<void> {
    const localTodoMap = new Map(localTodos.map(todo => [todo.id, todo]));

    for (const remoteTodo of remoteTodos) {
      const localTodo = localTodoMap.get(remoteTodo.id);

      if (!localTodo) {
        // New remote todo, add to local
        await this.offlineStorage.saveTodo({
          ...remoteTodo,
          syncStatus: 'synced',
          lastModified: Date.now()
        });
        result.syncedCount++;
      } else {
        // Check for conflicts
        const remoteUpdated = new Date(remoteTodo.updatedAt).getTime();
        const localUpdated = localTodo.lastModified;

        if (remoteUpdated > localUpdated && localTodo.syncStatus === 'pending') {
          // Conflict detected
          result.conflicts.push(localTodo);
          await this.offlineStorage.updateTodoSyncStatus(localTodo.id, 'conflict');
        } else if (remoteUpdated > localUpdated) {
          // Remote is newer, update local
          await this.offlineStorage.saveTodo({
            ...remoteTodo,
            syncStatus: 'synced',
            lastModified: Date.now()
          });
          result.syncedCount++;
        }
      }
    }
  }

  private async syncLocalToRemote(
    localTodos: OfflineTodo[],
    options: SyncOptions,
    result: SyncResult
  ): Promise<void> {
    const pendingTodos = localTodos.filter(todo => 
      todo.syncStatus === 'pending' || 
      (todo.syncStatus === 'conflict' && options.resolveConflicts === 'local')
    );

    for (const localTodo of pendingTodos) {
      try {
        if (localTodo.localId) {
          // This is a new todo created offline
          const createData: CreateTodoData = {
            title: localTodo.title,
            description: localTodo.description,
            priority: localTodo.priority,
            category: localTodo.category,
            dueDate: localTodo.dueDate
          };
          
          const newTodo = await todoService.createTodo(createData);
          
          // Update local todo with server ID
          await this.offlineStorage.deleteTodo(localTodo.id);
          await this.offlineStorage.saveTodo({
            ...newTodo,
            syncStatus: 'synced',
            lastModified: Date.now()
          });
        } else {
          // Update existing todo
          const updateData: UpdateTodoData = {
            title: localTodo.title,
            description: localTodo.description,
            completed: localTodo.completed,
            priority: localTodo.priority,
            category: localTodo.category,
            dueDate: localTodo.dueDate
          };
          
          await todoService.updateTodo(localTodo.id, updateData);
          await this.offlineStorage.updateTodoSyncStatus(localTodo.id, 'synced');
        }
        
        result.syncedCount++;
      } catch (error) {
        console.error(`Failed to sync todo ${localTodo.id}:`, error);
        result.failedCount++;
        result.errors.push(`Failed to sync todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async processPendingOperations(result: SyncResult): Promise<void> {
    const pendingOps = await this.offlineStorage.getPendingOperations();
    
    for (const operation of pendingOps) {
      try {
        switch (operation.type) {
          case 'delete':
            await todoService.deleteTodo(operation.todoId);
            await this.offlineStorage.removePendingOperation(operation.id!);
            result.syncedCount++;
            break;
          // Other operation types can be handled here
        }
      } catch (error) {
        console.error(`Failed to process pending operation ${operation.id}:`, error);
        result.failedCount++;
        
        // Increment retry count
        if (operation.retryCount < 3) {
          await this.offlineStorage.updatePendingOperationRetryCount(
            operation.id!,
            operation.retryCount + 1
          );
        } else {
          // Max retries reached, remove operation
          await this.offlineStorage.removePendingOperation(operation.id!);
          result.errors.push(`Max retries reached for operation ${operation.id}`);
        }
      }
    }
  }

  // Public methods
  public async syncTodo(todoId: string): Promise<boolean> {
    if (!this.networkService.isOnline()) {
      this.syncQueue.add(todoId);
      return false;
    }

    try {
      const localTodo = await this.offlineStorage.getTodoById(todoId);
      if (!localTodo || localTodo.syncStatus === 'synced') {
        return true;
      }

      // Sync this specific todo
      const result = await this.syncAll();
      return result.success;
    } catch (error) {
      console.error(`Failed to sync todo ${todoId}:`, error);
      return false;
    }
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  public enableAutoSync(): void {
    this.autoSyncEnabled = true;
    this.startPeriodicSync();
  }

  public disableAutoSync(): void {
    this.autoSyncEnabled = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public async getConflicts(): Promise<OfflineTodo[]> {
    const todos = await this.offlineStorage.getTodosNeedingSync();
    return todos.filter(todo => todo.syncStatus === 'conflict');
  }

  public async resolveConflict(
    todoId: string,
    resolution: 'local' | 'remote'
  ): Promise<boolean> {
    try {
      if (resolution === 'local') {
        await this.offlineStorage.updateTodoSyncStatus(todoId, 'pending');
        return await this.syncTodo(todoId);
      } else {
        // Fetch remote version and overwrite local
        const remoteTodo = await todoService.getTodoById(todoId);
        if (remoteTodo) {
          await this.offlineStorage.saveTodo({
            ...remoteTodo,
            syncStatus: 'synced',
            lastModified: Date.now()
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(`Failed to resolve conflict for todo ${todoId}:`, error);
      return false;
    }
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncQueue.clear();
  }
}

export default SyncService.getInstance();