import Dexie, { Table } from 'dexie';
import { Todo, CreateTodoData, UpdateTodoData } from '../types';

// Define the database schema
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

class TodoDatabase extends Dexie {
  todos!: Table<OfflineTodo>;
  pendingOperations!: Table<PendingOperation>;

  constructor() {
    super('TodoDatabase');
    this.version(1).stores({
      todos: '++id, userId, title, completed, priority, category, createdAt, updatedAt, dueDate, syncStatus, lastModified',
      pendingOperations: '++id, type, todoId, timestamp'
    });
  }
}

const db = new TodoDatabase();

export class OfflineStorageService {
  private static instance: OfflineStorageService;

  private constructor() {}

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Todo CRUD operations
  async getAllTodos(userId: string): Promise<OfflineTodo[]> {
    try {
      return await db.todos.where('userId').equals(userId).toArray();
    } catch (error) {
      console.error('Error getting todos from offline storage:', error);
      return [];
    }
  }

  async getTodoById(id: string): Promise<OfflineTodo | undefined> {
    try {
      return await db.todos.where('id').equals(id).first();
    } catch (error) {
      console.error('Error getting todo by id from offline storage:', error);
      return undefined;
    }
  }

  async saveTodo(todo: OfflineTodo): Promise<void> {
    try {
      await db.todos.put({
        ...todo,
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Error saving todo to offline storage:', error);
      throw error;
    }
  }

  async saveTodos(todos: OfflineTodo[]): Promise<void> {
    try {
      const todosWithTimestamp = todos.map(todo => ({
        ...todo,
        lastModified: Date.now()
      }));
      await db.todos.bulkPut(todosWithTimestamp);
    } catch (error) {
      console.error('Error saving todos to offline storage:', error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await db.todos.where('id').equals(id).delete();
    } catch (error) {
      console.error('Error deleting todo from offline storage:', error);
      throw error;
    }
  }

  async updateTodoSyncStatus(id: string, syncStatus: 'synced' | 'pending' | 'conflict'): Promise<void> {
    try {
      await db.todos.where('id').equals(id).modify({ syncStatus });
    } catch (error) {
      console.error('Error updating todo sync status:', error);
      throw error;
    }
  }

  // Pending operations management
  async addPendingOperation(operation: Omit<PendingOperation, 'id'>): Promise<void> {
    try {
      await db.pendingOperations.add(operation);
    } catch (error) {
      console.error('Error adding pending operation:', error);
      throw error;
    }
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      return await db.pendingOperations.orderBy('timestamp').toArray();
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  async removePendingOperation(id: number): Promise<void> {
    try {
      await db.pendingOperations.delete(id);
    } catch (error) {
      console.error('Error removing pending operation:', error);
      throw error;
    }
  }

  async updatePendingOperationRetryCount(id: number, retryCount: number): Promise<void> {
    try {
      await db.pendingOperations.where('id').equals(id).modify({ retryCount });
    } catch (error) {
      console.error('Error updating pending operation retry count:', error);
      throw error;
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await db.todos.clear();
      await db.pendingOperations.clear();
    } catch (error) {
      console.error('Error clearing offline storage:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{ todoCount: number; pendingOperationsCount: number }> {
    try {
      const [todoCount, pendingOperationsCount] = await Promise.all([
        db.todos.count(),
        db.pendingOperations.count()
      ]);
      return { todoCount, pendingOperationsCount };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { todoCount: 0, pendingOperationsCount: 0 };
    }
  }

  // Get todos that need syncing
  async getTodosNeedingSync(): Promise<OfflineTodo[]> {
    try {
      return await db.todos.where('syncStatus').anyOf(['pending', 'conflict']).toArray();
    } catch (error) {
      console.error('Error getting todos needing sync:', error);
      return [];
    }
  }

  // Check if database is ready
  async isReady(): Promise<boolean> {
    try {
      await db.open();
      return true;
    } catch (error) {
      console.error('Database not ready:', error);
      return false;
    }
  }
}

export default OfflineStorageService.getInstance();