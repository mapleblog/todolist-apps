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
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  TaskSortOptions,
  TaskStatus,
  FirebaseError
} from '@/types';

const TASKS_COLLECTION = 'tasks';

/**
 * Convert Firestore document to Task object
 */
const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    projectId: data.projectId,
    userId: data.userId,
    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
    estimatedHours: data.estimatedHours || 0,
    actualHours: data.actualHours || 0,
    tags: data.tags || [],
    assignedTo: data.assignedTo,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
  };
};

/**
 * Create a new task
 */
export const createTask = async (
  userId: string,
  projectId: string,
  taskData: CreateTaskData
): Promise<Task> => {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const now = serverTimestamp();
    
    const newTaskData = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      status: 'todo' as TaskStatus,
      priority: taskData.priority || 'medium',
      projectId,
      userId,
      dueDate: taskData.dueDate || null,
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: 0,
      tags: taskData.tags || [],
      assignedTo: taskData.assignedTo || '',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    const docRef = await addDoc(tasksRef, newTaskData);
    
    // Get the created document to return complete data
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error('Failed to retrieve created task');
    }
    
    return convertFirestoreDoc(createdDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error creating task:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to create task');
  }
};

/**
 * Get all tasks for a project
 */
export const getTasksByProject = async (
  projectId: string,
  userId: string,
  filters?: TaskFilters,
  sortOptions?: TaskSortOptions
): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    let q = query(
      tasksRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );

    // Apply filters
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }
    if (filters?.assignedTo) {
      q = query(q, where('assignedTo', '==', filters.assignedTo));
    }

    // Apply sorting
    const sortBy = sortOptions?.sortBy || 'createdAt';
    const order = sortOptions?.order || 'desc';
    q = query(q, orderBy(sortBy, order));

    const querySnapshot = await getDocs(q);
    let tasks = querySnapshot.docs.map(convertFirestoreDoc);

    // Apply client-side filters that can't be done in Firestore
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      tasks = tasks.filter(task => 
        filters.tags!.some(tag => task.tags?.includes(tag))
      );
    }

    if (filters?.dueDateRange) {
      const { start, end } = filters.dueDateRange;
      tasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        if (start && task.dueDate < start) return false;
        if (end && task.dueDate > end) return false;
        return true;
      });
    }

    return tasks;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching tasks:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch tasks');
  }
};

/**
 * Get a task by ID
 */
export const getTaskById = async (taskId: string, userId: string): Promise<Task | null> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) {
      return null;
    }
    
    const task = convertFirestoreDoc(taskDoc as QueryDocumentSnapshot<DocumentData>);
    
    // Verify the task belongs to the user
    if (task.userId !== userId) {
      throw new Error('Unauthorized access to task');
    }
    
    return task;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching task:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch task');
  }
};

/**
 * Update a task
 */
export const updateTask = async (
  taskId: string,
  userId: string,
  updateData: UpdateTaskData
): Promise<Task> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    
    // First verify the task exists and belongs to the user
    const existingTask = await getTaskById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }
    
    const updatePayload: any = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // Set completedAt when status changes to completed
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      updatePayload.completedAt = serverTimestamp();
    } else if (updateData.status !== 'completed' && existingTask.status === 'completed') {
      updatePayload.completedAt = null;
    }
    
    // Clean up undefined values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });
    
    await updateDoc(taskRef, updatePayload);
    
    // Return updated task
    const updatedTask = await getTaskById(taskId, userId);
    if (!updatedTask) {
      throw new Error('Failed to retrieve updated task');
    }
    
    return updatedTask;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error updating task:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to update task');
  }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (
  taskId: string,
  userId: string,
  status: TaskStatus
): Promise<Task> => {
  return updateTask(taskId, userId, { status });
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string, userId: string): Promise<void> => {
  try {
    // First verify the task exists and belongs to the user
    const existingTask = await getTaskById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }
    
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error deleting task:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to delete task');
  }
};

/**
 * Get task statistics for a project
 */
export const getTaskStats = async (
  projectId: string,
  userId: string
): Promise<{
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}> => {
  try {
    const tasks = await getTasksByProject(projectId, userId);
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      totalActualHours: tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
    };
    
    return stats;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error getting task stats:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to get task statistics');
  }
};

/**
 * Get all unique tags from tasks in a project
 */
export const getProjectTags = async (
  projectId: string,
  userId: string
): Promise<string[]> => {
  try {
    const tasks = await getTasksByProject(projectId, userId);
    const allTags = tasks.flatMap(task => task.tags || []);
    return [...new Set(allTags)].sort();
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error getting project tags:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to get project tags');
  }
};

const taskService = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getProjectTags,
};

export default taskService;
export { taskService };