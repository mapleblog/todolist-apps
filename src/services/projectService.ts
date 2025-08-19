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
import { FirebaseError } from '@/types';
import { getTasksByProject } from './taskService';

const PROJECTS_COLLECTION = 'projects';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  tasksCount: number;
  completedTasks: number;
  dueDate?: Date;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description: string;
  dueDate?: Date;
  color?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'on-hold';
  progress?: number;
  tasksCount?: number;
  completedTasks?: number;
  dueDate?: Date;
  color?: string;
}

/**
 * Convert Firestore document to Project object
 */
const convertFirestoreDoc = (doc: QueryDocumentSnapshot<DocumentData>): Project => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description || '',
    status: data.status || 'active',
    progress: data.progress || 0,
    tasksCount: data.tasksCount || 0,
    completedTasks: data.completedTasks || 0,
    dueDate: data.dueDate && data.dueDate.toDate ? (data.dueDate as Timestamp).toDate() : undefined,
    color: data.color || '#1976d2',
    userId: data.userId,
    createdAt: data.createdAt && data.createdAt.toDate ? (data.createdAt as Timestamp).toDate() : new Date(),
    updatedAt: data.updatedAt && data.updatedAt.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(),
  };
};

/**
 * Create a new project
 */
export const createProject = async (
  userId: string,
  projectData: CreateProjectData
): Promise<Project> => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const now = serverTimestamp();
    
    const newProjectData = {
      name: projectData.name.trim(),
      description: projectData.description?.trim() || '',
      status: 'active' as const,
      progress: 0,
      tasksCount: 0,
      completedTasks: 0,
      dueDate: projectData.dueDate || null,
      color: projectData.color || '#1976d2',
      createdAt: now,
      updatedAt: now,
      userId,
    };

    const docRef = await addDoc(projectsRef, newProjectData);
    
    // Get the created document to return complete data
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error('Failed to retrieve created project');
    }
    
    return convertFirestoreDoc(createdDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error creating project:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to create project');
  }
};

/**
 * Get all projects for a user
 */
export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDoc);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching projects:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch projects');
  }
};

/**
 * Get a project by ID
 */
export const getProjectById = async (projectId: string, userId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      return null;
    }
    
    const project = convertFirestoreDoc(projectDoc as QueryDocumentSnapshot<DocumentData>);
    
    // Verify the project belongs to the user
    if (project.userId !== userId) {
      throw new Error('Unauthorized access to project');
    }
    
    return project;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error fetching project:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to fetch project');
  }
};

/**
 * Update a project
 */
export const updateProject = async (
  projectId: string,
  userId: string,
  updateData: UpdateProjectData
): Promise<Project> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    
    // First verify the project exists and belongs to the user
    const existingProject = await getProjectById(projectId, userId);
    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }
    
    const updatePayload: any = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };
    
    // Clean up undefined values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });
    
    await updateDoc(projectRef, updatePayload);
    
    // Return updated project
    const updatedProject = await getProjectById(projectId, userId);
    if (!updatedProject) {
      throw new Error('Failed to retrieve updated project');
    }
    
    return updatedProject;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error updating project:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to update project');
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string, userId: string): Promise<void> => {
  try {
    // First verify the project exists and belongs to the user
    const existingProject = await getProjectById(projectId, userId);
    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }
    
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error deleting project:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to delete project');
  }
};

/**
 * Get projects count for a user
 */
export const getProjectsCount = async (
  userId: string
): Promise<{ total: number; active: number; completed: number; onHold: number }> => {
  try {
    const projects = await getProjects(userId);
    
    const counts = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
    };
    
    return counts;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error getting projects count:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to get projects count');
  }
};

/**
 * Calculate and update project progress based on tasks
 */
export const updateProjectProgress = async (
  projectId: string,
  userId: string
): Promise<void> => {
  try {
    // Get all tasks for this project
    const tasks = await getTasksByProject(projectId, userId);
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Update project with new progress data
    await updateProject(projectId, userId, {
      tasksCount: totalTasks,
      completedTasks,
      progress,
    });
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error updating project progress:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to update project progress');
  }
};

/**
 * Get project statistics including task breakdown
 */
export const getProjectStatistics = async (
  projectId: string,
  userId: string
): Promise<{
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progress: number;
  overdueTasks: number;
}> => {
  try {
    const tasks = await getTasksByProject(projectId, userId);
    const now = new Date();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== 'completed'
    ).length;
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      progress,
      overdueTasks,
    };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error getting project statistics:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to get project statistics');
  }
};

/**
 * Auto-update project status based on progress
 */
export const autoUpdateProjectStatus = async (
  projectId: string,
  userId: string
): Promise<void> => {
  try {
    const project = await getProjectById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    let newStatus = project.status;
    
    // Auto-complete project if all tasks are completed
    if (project.progress === 100 && project.status !== 'completed') {
      newStatus = 'completed';
    }
    // Reactivate project if it was completed but now has incomplete tasks
    else if (project.progress < 100 && project.status === 'completed') {
      newStatus = 'active';
    }
    
    if (newStatus !== project.status) {
      await updateProject(projectId, userId, { status: newStatus });
    }
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error auto-updating project status:', firebaseError);
    throw new Error(firebaseError.message || 'Failed to auto-update project status');
  }
};

const projectService = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsCount,
  updateProjectProgress,
  getProjectStatistics,
  autoUpdateProjectStatus,
};

export default projectService;
export { projectService };