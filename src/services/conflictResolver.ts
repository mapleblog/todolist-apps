import { Todo, TodoPriority } from '../types';
import { OfflineTodo, OfflineStorageService } from './offlineStorage';
import todoService from './todoService';
import { auth } from '../config/firebase';

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

export class ConflictResolverService {
  private static instance: ConflictResolverService;
  private offlineStorage: OfflineStorageService;
  private defaultStrategy: ConflictResolutionStrategy = 'smart_merge';
  private conflictQueue: Map<string, ConflictData> = new Map();

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
  }

  public static getInstance(): ConflictResolverService {
    if (!ConflictResolverService.instance) {
      ConflictResolverService.instance = new ConflictResolverService();
    }
    return ConflictResolverService.instance;
  }

  // Detect conflicts between local and remote versions
  public detectConflict(localTodo: OfflineTodo, remoteTodo: Todo): ConflictData | null {
    const conflictFields: string[] = [];
    
    // Check if there's actually a conflict
    const localModified = localTodo.lastModified;
    const remoteModified = new Date(remoteTodo.updatedAt).getTime();
    
    // If local is not pending, no conflict
    if (localTodo.syncStatus !== 'pending') {
      return null;
    }
    
    // If remote is not newer, no conflict
    if (remoteModified <= localModified) {
      return null;
    }
    
    // Compare fields to identify specific conflicts
    if (localTodo.title !== remoteTodo.title) {
      conflictFields.push('title');
    }
    
    if (localTodo.description !== remoteTodo.description) {
      conflictFields.push('description');
    }
    
    if (localTodo.completed !== remoteTodo.completed) {
      conflictFields.push('completed');
    }
    
    if (localTodo.priority !== remoteTodo.priority) {
      conflictFields.push('priority');
    }
    
    if (localTodo.category !== remoteTodo.category) {
      conflictFields.push('category');
    }
    
    if (localTodo.dueDate !== remoteTodo.dueDate) {
      conflictFields.push('dueDate');
    }
    
    // If no fields are different, no conflict
    if (conflictFields.length === 0) {
      return null;
    }
    
    const conflictData: ConflictData = {
      todoId: localTodo.id,
      localVersion: localTodo,
      remoteVersion: remoteTodo,
      conflictFields,
      conflictType: 'update',
      timestamp: Date.now()
    };
    
    // Add to conflict queue
    this.conflictQueue.set(localTodo.id, conflictData);
    
    return conflictData;
  }

  // Resolve a conflict using the specified strategy
  public async resolveConflict(
    conflictData: ConflictData,
    strategy?: ConflictResolutionStrategy,
    manualResolution?: Partial<Todo>
  ): Promise<ConflictResolutionResult> {
    const resolveStrategy = strategy || this.defaultStrategy;
    
    try {
      let finalVersion: Todo;
      
      switch (resolveStrategy) {
        case 'local_wins':
          finalVersion = await this.resolveWithLocalWins(conflictData);
          break;
          
        case 'remote_wins':
          finalVersion = await this.resolveWithRemoteWins(conflictData);
          break;
          
        case 'last_write_wins':
          finalVersion = await this.resolveWithLastWriteWins(conflictData);
          break;
          
        case 'smart_merge':
          finalVersion = await this.resolveWithSmartMerge(conflictData);
          break;
          
        case 'manual':
          if (!manualResolution) {
            throw new Error('Manual resolution data required for manual strategy');
          }
          finalVersion = await this.resolveWithManualData(conflictData, manualResolution);
          break;
          
        default:
          throw new Error(`Unknown resolution strategy: ${resolveStrategy}`);
      }
      
      // Update local storage with resolved version
      await this.offlineStorage.saveTodo({
        ...finalVersion,
        syncStatus: 'synced',
        lastModified: Date.now()
      });
      
      // Remove from conflict queue
      this.conflictQueue.delete(conflictData.todoId);
      
      return {
        success: true,
        todoId: conflictData.todoId,
        finalVersion
      };
      
    } catch (error) {
      console.error(`Failed to resolve conflict for todo ${conflictData.todoId}:`, error);
      return {
        success: false,
        todoId: conflictData.todoId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async resolveWithLocalWins(conflictData: ConflictData): Promise<Todo> {
    // Use local version and sync to remote
    const localTodo = conflictData.localVersion;
    const updateData = {
      title: localTodo.title,
      description: localTodo.description,
      completed: localTodo.completed,
      priority: localTodo.priority,
      category: localTodo.category,
      dueDate: localTodo.dueDate
    };
    
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    await todoService.updateTodo(localTodo.id, user.uid, updateData);
    
    return {
      ...localTodo,
      updatedAt: new Date()
    };
  }

  private async resolveWithRemoteWins(conflictData: ConflictData): Promise<Todo> {
    // Use remote version
    return conflictData.remoteVersion;
  }

  private async resolveWithLastWriteWins(conflictData: ConflictData): Promise<Todo> {
    const localModified = conflictData.localVersion.lastModified;
    const remoteModified = new Date(conflictData.remoteVersion.updatedAt).getTime();
    
    if (localModified > remoteModified) {
      return await this.resolveWithLocalWins(conflictData);
    } else {
      return await this.resolveWithRemoteWins(conflictData);
    }
  }

  private async resolveWithSmartMerge(conflictData: ConflictData): Promise<Todo> {
    const local = conflictData.localVersion;
    const remote = conflictData.remoteVersion;
    
    // Smart merge logic: prefer non-empty values and more recent changes for specific fields
    const merged: Todo = {
      ...remote, // Start with remote as base
      
      // For title and description, prefer non-empty values
      title: this.preferNonEmpty(local.title, remote.title) || remote.title,
      description: this.preferNonEmpty(local.description, remote.description) || remote.description,
      
      // For completion status, prefer the more recent change
      completed: this.resolveCompletionStatus(local, remote),
      
      // For priority, prefer higher priority if different
      priority: this.resolvePriority(local.priority, remote.priority) as TodoPriority,
      
      // For category, prefer non-empty
      category: this.preferNonEmpty(local.category, remote.category) || remote.category,
      
      // For due date, prefer the later date if both exist
      dueDate: this.resolveDueDate(local.dueDate, remote.dueDate)
    };
    
    // Update remote with merged data
    const updateData = {
      title: merged.title,
      description: merged.description,
      completed: merged.completed,
      priority: merged.priority,
      category: merged.category,
      dueDate: merged.dueDate
    };
    
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    await todoService.updateTodo(merged.id, user.uid, updateData);
    
    return {
      ...merged,
      updatedAt: new Date()
    };
  }

  private async resolveWithManualData(
    conflictData: ConflictData,
    manualData: Partial<Todo>
  ): Promise<Todo> {
    const merged: Todo = {
      ...conflictData.remoteVersion,
      ...manualData
    };
    
    // Update remote with manual resolution
    const updateData = {
      title: merged.title,
      description: merged.description,
      completed: merged.completed,
      priority: merged.priority,
      category: merged.category,
      dueDate: merged.dueDate
    };
    
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    await todoService.updateTodo(merged.id, user.uid, updateData);
    
    return {
      ...merged,
      updatedAt: new Date()
    };
  }

  // Helper methods for smart merge
  private preferNonEmpty(local: string | undefined, remote: string | undefined): string | undefined {
    if (local && local.trim() && (!remote || !remote.trim())) {
      return local;
    }
    if (remote && remote.trim() && (!local || !local.trim())) {
      return remote;
    }
    return local || remote;
  }

  private resolveCompletionStatus(local: OfflineTodo, _remote: Todo): boolean {
    // If completion status is different, prefer the local change
    // as it's more likely to be intentional
    return local.completed;
  }

  private resolvePriority(localPriority: string, remotePriority: string): string {
    const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
    const localOrder = priorityOrder[localPriority as keyof typeof priorityOrder] || 0;
    const remoteOrder = priorityOrder[remotePriority as keyof typeof priorityOrder] || 0;
    
    // Prefer higher priority
    return localOrder >= remoteOrder ? localPriority : remotePriority;
  }

  private resolveDueDate(localDate: Date | undefined, remoteDate: Date | undefined): Date | undefined {
    if (!localDate && !remoteDate) return undefined;
    if (!localDate) return remoteDate;
    if (!remoteDate) return localDate;
    
    // Prefer the later due date (gives more time)
    const localTime = new Date(localDate).getTime();
    const remoteTime = new Date(remoteDate).getTime();
    
    return localTime > remoteTime ? localDate : remoteDate;
  }

  // Public utility methods
  public async getAllConflicts(): Promise<ConflictData[]> {
    return Array.from(this.conflictQueue.values());
  }

  public async getConflictById(todoId: string): Promise<ConflictData | undefined> {
    return this.conflictQueue.get(todoId);
  }

  public async hasConflicts(): Promise<boolean> {
    return this.conflictQueue.size > 0;
  }

  public async getConflictCount(): Promise<number> {
    return this.conflictQueue.size;
  }

  public setDefaultStrategy(strategy: ConflictResolutionStrategy): void {
    this.defaultStrategy = strategy;
  }

  public getDefaultStrategy(): ConflictResolutionStrategy {
    return this.defaultStrategy;
  }

  public async clearConflictQueue(): Promise<void> {
    this.conflictQueue.clear();
  }

  // Batch resolve all conflicts with the same strategy
  public async resolveAllConflicts(
    strategy: ConflictResolutionStrategy = this.defaultStrategy
  ): Promise<ConflictResolutionResult[]> {
    const conflicts = Array.from(this.conflictQueue.values());
    const results: ConflictResolutionResult[] = [];
    
    for (const conflict of conflicts) {
      const result = await this.resolveConflict(conflict, strategy);
      results.push(result);
    }
    
    return results;
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
    this.conflictQueue.clear();
  }
}

export default ConflictResolverService.getInstance();