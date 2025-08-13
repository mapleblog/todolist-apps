import { CreateTodoData, UpdateTodoData } from '../types';
import { OfflineStorageService, PendingOperation } from './offlineStorage';
import { NetworkStatusService } from './networkStatus';
import todoService from './todoService';
import { auth } from '../config/firebase';

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

export class OperationQueueService {
  private static instance: OperationQueueService;
  private offlineStorage: OfflineStorageService;
  private networkService: NetworkStatusService;
  private isProcessing = false;
  private processingQueue: Map<string, QueuedOperation> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
    this.networkService = NetworkStatusService.getInstance();
    this.initialize();
  }

  public static getInstance(): OperationQueueService {
    if (!OperationQueueService.instance) {
      OperationQueueService.instance = new OperationQueueService();
    }
    return OperationQueueService.instance;
  }

  private initialize(): void {
    // Listen for network status changes
    this.networkService.addListener((status) => {
      if (status === 'online') {
        this.processQueue();
      }
    });

    // Process queue on startup if online
    if (this.networkService.isOnline()) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  // Queue operations for offline execution
  public async queueCreateTodo(data: CreateTodoData): Promise<string> {
    const operationId = this.generateOperationId();
    const localTodoId = `local_${operationId}`;
    
    try {
      // Get current user for the operation
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create local todo immediately
      const localTodo = {
        id: localTodoId,
        ...data,
        userId: user.uid,
        completed: false,
        priority: data.priority || 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending' as const,
        lastModified: Date.now(),
        localId: localTodoId
      };
      
      await this.offlineStorage.saveTodo(localTodo);
      
      // Queue the operation
      await this.addToQueue({
        id: operationId,
        type: 'create',
        todoId: localTodoId,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending'
      });
      
      // Try to process immediately if online
      if (this.networkService.isOnline()) {
        this.processQueue();
      }
      
      return localTodoId;
    } catch (error) {
      console.error('Failed to queue create todo operation:', error);
      throw error;
    }
  }

  public async queueUpdateTodo(todoId: string, data: UpdateTodoData): Promise<void> {
    const operationId = this.generateOperationId();
    
    try {
      // Update local todo immediately
      const localTodo = await this.offlineStorage.getTodoById(todoId);
      if (localTodo) {
        const updatedTodo = {
          ...localTodo,
          ...data,
          updatedAt: new Date(),
          syncStatus: 'pending' as const,
          lastModified: Date.now()
        };
        
        await this.offlineStorage.saveTodo(updatedTodo);
      }
      
      // Queue the operation
      await this.addToQueue({
        id: operationId,
        type: 'update',
        todoId,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending'
      });
      
      // Try to process immediately if online
      if (this.networkService.isOnline()) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Failed to queue update todo operation:', error);
      throw error;
    }
  }

  public async queueDeleteTodo(todoId: string): Promise<void> {
    const operationId = this.generateOperationId();
    
    try {
      // Mark as deleted locally (soft delete)
      const localTodo = await this.offlineStorage.getTodoById(todoId);
      if (localTodo) {
        // Instead of deleting, we could mark it as deleted
        // For now, we'll delete it locally and queue the remote deletion
        await this.offlineStorage.deleteTodo(todoId);
      }
      
      // Queue the operation
      await this.addToQueue({
        id: operationId,
        type: 'delete',
        todoId,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending'
      });
      
      // Try to process immediately if online
      if (this.networkService.isOnline()) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Failed to queue delete todo operation:', error);
      throw error;
    }
  }

  public async queueToggleTodo(todoId: string, completed: boolean): Promise<void> {
    const operationId = this.generateOperationId();
    
    try {
      // Update local todo immediately
      const localTodo = await this.offlineStorage.getTodoById(todoId);
      if (localTodo) {
        const updatedTodo = {
          ...localTodo,
          completed,
          updatedAt: new Date(),
          syncStatus: 'pending' as const,
          lastModified: Date.now()
        };
        
        await this.offlineStorage.saveTodo(updatedTodo);
      }
      
      // Queue the operation
      await this.addToQueue({
        id: operationId,
        type: 'toggle',
        todoId,
        data: { completed },
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending'
      });
      
      // Try to process immediately if online
      if (this.networkService.isOnline()) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Failed to queue toggle todo operation:', error);
      throw error;
    }
  }

  private async addToQueue(operation: QueuedOperation): Promise<void> {
    const pendingOp: Omit<PendingOperation, 'id'> = {
      type: operation.type,
      todoId: operation.todoId || '',
      data: operation.data,
      timestamp: operation.timestamp,
      retryCount: operation.retryCount
    };
    
    await this.offlineStorage.addPendingOperation(pendingOp);
    this.processingQueue.set(operation.id, operation);
  }

  // Process the queue when online
  public async processQueue(): Promise<OperationResult[]> {
    if (this.isProcessing || !this.networkService.isOnline()) {
      return [];
    }

    this.isProcessing = true;
    const results: OperationResult[] = [];

    try {
      const pendingOperations = await this.offlineStorage.getPendingOperations();
      
      console.log(`Processing ${pendingOperations.length} pending operations`);
      
      for (const operation of pendingOperations) {
        const result = await this.processOperation(operation);
        results.push(result);
        
        if (result.success) {
          await this.offlineStorage.removePendingOperation(operation.id!);
        } else {
          // Update retry count
          const newRetryCount = operation.retryCount + 1;
          if (newRetryCount >= this.maxRetries) {
            console.error(`Max retries reached for operation ${operation.id}, removing from queue`);
            await this.offlineStorage.removePendingOperation(operation.id!);
          } else {
            await this.offlineStorage.updatePendingOperationRetryCount(operation.id!, newRetryCount);
            // Schedule retry with exponential backoff
            setTimeout(() => {
              if (this.networkService.isOnline()) {
                this.processQueue();
              }
            }, this.retryDelay * Math.pow(2, newRetryCount));
          }
        }
      }
    } catch (error) {
      console.error('Error processing operation queue:', error);
    } finally {
      this.isProcessing = false;
    }

    return results;
  }

  private async processOperation(operation: PendingOperation): Promise<OperationResult> {
    const operationId = operation.id?.toString() || 'unknown';
    
    try {
      switch (operation.type) {
        case 'create':
          return await this.processCreateOperation(operation, operationId);
        case 'update':
          return await this.processUpdateOperation(operation, operationId);
        case 'delete':
          return await this.processDeleteOperation(operation, operationId);
        case 'toggle':
          return await this.processToggleOperation(operation, operationId);
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process operation ${operationId}:`, error);
      return {
        success: false,
        operationId,
        error: errorMessage
      };
    }
  }

  private async processCreateOperation(operation: PendingOperation, operationId: string): Promise<OperationResult> {
    if (!operation.data || !operation.todoId) {
      throw new Error('Invalid create operation data');
    }

    const createData = operation.data as CreateTodoData;
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    const newTodo = await todoService.createTodo(user.uid, createData);
    
    // Update local storage with server ID
    await this.offlineStorage.deleteTodo(operation.todoId);
    await this.offlineStorage.saveTodo({
      ...newTodo,
      syncStatus: 'synced',
      lastModified: Date.now()
    });
    
    return {
      success: true,
      operationId
    };
  }

  private async processUpdateOperation(operation: PendingOperation, operationId: string): Promise<OperationResult> {
    if (!operation.data || !operation.todoId) {
      throw new Error('Invalid update operation data');
    }

    const updateData = operation.data as UpdateTodoData;
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    await todoService.updateTodo(operation.todoId, user.uid, updateData);
    
    // Update sync status
    await this.offlineStorage.updateTodoSyncStatus(operation.todoId, 'synced');
    
    return {
      success: true,
      operationId
    };
  }

  private async processDeleteOperation(operation: PendingOperation, operationId: string): Promise<OperationResult> {
    if (!operation.todoId) {
      throw new Error('Invalid delete operation data');
    }

    // Get current user for the operation
            const user = await this.getCurrentUser();
            if (!user) {
              throw new Error('User not authenticated');
            }
            await todoService.deleteTodo(operation.todoId, user.uid);
    
    return {
      success: true,
      operationId
    };
  }

  private async processToggleOperation(operation: PendingOperation, operationId: string): Promise<OperationResult> {
    if (!operation.data || !operation.todoId) {
      throw new Error('Invalid toggle operation data');
    }

    const toggleData = operation.data as { completed: boolean };
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    await todoService.updateTodo(operation.todoId, user.uid, { completed: toggleData.completed });
    
    // Update sync status
    await this.offlineStorage.updateTodoSyncStatus(operation.todoId, 'synced');
    
    return {
      success: true,
      operationId
    };
  }

  // Utility methods
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async getQueueStatus(): Promise<{
    pendingCount: number;
    isProcessing: boolean;
    lastProcessed?: number;
  }> {
    const pendingOperations = await this.offlineStorage.getPendingOperations();
    return {
      pendingCount: pendingOperations.length,
      isProcessing: this.isProcessing,
      lastProcessed: pendingOperations.length > 0 ? 
        Math.max(...pendingOperations.map(op => op.timestamp)) : undefined
    };
  }

  public async clearQueue(): Promise<void> {
    const pendingOperations = await this.offlineStorage.getPendingOperations();
    for (const operation of pendingOperations) {
      if (operation.id) {
        await this.offlineStorage.removePendingOperation(operation.id);
      }
    }
    this.processingQueue.clear();
  }

  public isQueueProcessing(): boolean {
    return this.isProcessing;
  }

  private async getCurrentUser(): Promise<{ uid: string } | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user ? { uid: user.uid } : null);
      });
    });
  }

  public destroy(): void {
    this.processingQueue.clear();
  }
}

export default OperationQueueService.getInstance();