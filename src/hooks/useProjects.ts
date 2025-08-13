import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Project,
  CreateProjectData,
  UpdateProjectData,
  projectService
} from '../services/projectService';

export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (projectData: CreateProjectData) => Promise<Project>;
  updateProject: (projectId: string, updateData: UpdateProjectData) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectById: (projectId: string) => Promise<Project | null>;
  refreshProjects: () => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedProjects = await projectService.getProjects(user.uid);
      setProjects(fetchedProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addProject = useCallback(async (projectData: CreateProjectData): Promise<Project> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      const newProject = await projectService.createProject(user.uid, projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const updateProject = useCallback(async (
    projectId: string,
    updateData: UpdateProjectData
  ): Promise<Project> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      const updatedProject = await projectService.updateProject(projectId, user.uid, updateData);
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? updatedProject : project
        )
      );
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      await projectService.deleteProject(projectId, user.uid);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const getProjectById = useCallback(async (projectId: string): Promise<Project | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await projectService.getProjectById(projectId, user.uid);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  // Auto-fetch projects when user changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects
  };
};

export default useProjects;