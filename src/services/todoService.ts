import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoFilters,
  TodoSortOptions,
  FirebaseError,
} from '@/types';

const TODOS_COLLECTION = 'todos';

/**
 * Convert Firestore document to Todo object
 */
const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): Todo => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description || '',
    completed: data.completed || false,
    priority: data.priority || 'medium',
    category: data.category || '',
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    userId: data.userId,
  };
};

/**
 * Create a new todo item
 */
export const createTodo = async (
  userId: string,
  todoData: CreateTodoData
): Promise<Todo> => {
  try {
    const todosRef = collection(db, TODOS_COLLECTION);
    const now = serverTimestamp();
    
    const newTodoData = {
      title: todoData.title.trim(),
      description: todoData.description?.trim() || '',
      completed: false,
      priority: todoData.priority || 'medium',
      category: todoData.category?.trim() || '',
      dueDate: todoData.dueDate || null,
      createdAt: now,
      updatedAt: now,
      userId,
    };

    const docRef = await addDoc(todosRef, newTodoData);
    
    // Get the created document to return complete data
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error('Failed to retrieve created todo');
    }
    
    return convertFirestoreDoc(createdDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error creating todo:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to create todo');
  }
};

/**
 * Get all todos for a user with optional filters and sorting
 */
export const getTodos = async (
  userId: string,
  filters?: TodoFilters,
  sortOptions?: TodoSortOptions,
  limitCount?: number
): Promise<Todo[]> => {
  try {
    const todosRef = collection(db, TODOS_COLLECTION);
    let q = query(todosRef, where('userId', '==', userId));

    // Apply filters
    if (filters) {
      if (filters.completed !== undefined) {
        q = query(q, where('completed', '==', filters.completed));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
    }

    // Apply sorting
    if (sortOptions) {
      const { sortBy, order } = sortOptions;
      q = query(q, orderBy(sortBy, order));
    } else {
      // Default sorting by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));
    }

    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    let todos = querySnapshot.docs.map(convertFirestoreDoc);

    // Apply client-side filters that can't be done in Firestore
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      todos = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm) ||
          todo.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.dueDateRange) {
      const { start, end } = filters.dueDateRange;
      todos = todos.filter((todo) => {
        if (!todo.dueDate) return false;
        const dueDate = todo.dueDate;
        if (start && dueDate < start) return false;
        if (end && dueDate > end) return false;
        return true;
      });
    }

    return todos;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching todos:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch todos');
  }
};

/**
 * Get a single todo by ID
 */
export const getTodoById = async (todoId: string, userId: string): Promise<Todo | null> => {
  try {
    const todoRef = doc(db, TODOS_COLLECTION, todoId);
    const todoDoc = await getDoc(todoRef);
    
    if (!todoDoc.exists()) {
      return null;
    }
    
    const todo = convertFirestoreDoc(todoDoc as QueryDocumentSnapshot<DocumentData>);
    
    // Verify the todo belongs to the user
    if (todo.userId !== userId) {
      throw new Error('Unauthorized access to todo');
    }
    
    return todo;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching todo:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch todo');
  }
};

/**
 * Update a todo item
 */
export const updateTodo = async (
  todoId: string,
  userId: string,
  updateData: UpdateTodoData
): Promise<Todo> => {
  try {
    const todoRef = doc(db, TODOS_COLLECTION, todoId);
    
    // First verify the todo exists and belongs to the user
    const existingTodo = await getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found or access denied');
    }
    
    const updatedData: Partial<Todo> = {
      ...updateData,
      updatedAt: serverTimestamp() as any,
    };
    
    // Clean up undefined values and trim strings
    Object.keys(updatedData).forEach((key) => {
      const value = updatedData[key as keyof UpdateTodoData];
      if (value === undefined) {
        delete updatedData[key as keyof UpdateTodoData];
      } else if (typeof value === 'string') {
        updatedData[key as keyof UpdateTodoData] = value.trim() as any;
      }
    });
    
    await updateDoc(todoRef, updatedData);
    
    // Return updated todo
    const updatedTodo = await getTodoById(todoId, userId);
    if (!updatedTodo) {
      throw new Error('Failed to retrieve updated todo');
    }
    
    return updatedTodo;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error updating todo:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to update todo');
  }
};

/**
 * Delete a todo item
 */
export const deleteTodo = async (todoId: string, userId: string): Promise<void> => {
  try {
    // First verify the todo exists and belongs to the user
    const existingTodo = await getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found or access denied');
    }
    
    const todoRef = doc(db, TODOS_COLLECTION, todoId);
    await deleteDoc(todoRef);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error deleting todo:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to delete todo');
  }
};

/**
 * Toggle todo completion status
 */
export const toggleTodoComplete = async (
  todoId: string,
  userId: string
): Promise<Todo> => {
  try {
    const existingTodo = await getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found or access denied');
    }
    
    return await updateTodo(todoId, userId, {
      completed: !existingTodo.completed,
    });
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error toggling todo completion:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to toggle todo completion');
  }
};

/**
 * Batch delete multiple todos
 */
export const batchDeleteTodos = async (
  todoIds: string[],
  userId: string
): Promise<void> => {
  try {
    const deletePromises = todoIds.map((todoId) => deleteTodo(todoId, userId));
    await Promise.all(deletePromises);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error batch deleting todos:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to delete todos');
  }
};

/**
 * Get todos count by status
 */
export const getTodosCount = async (
  userId: string
): Promise<{ total: number; completed: number; pending: number }> => {
  try {
    const todos = await getTodos(userId);
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error getting todos count:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to get todos count');
  }
};

// Default export for compatibility with other services
const todoService = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  batchDeleteTodos,
  getTodosCount
};

export default todoService;
export { todoService };