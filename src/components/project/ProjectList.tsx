import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  IconButton,

  Fade,
  Grow,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';

import ProjectCard from './ProjectCard';
import { Project } from '../../services/projectService';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
  onStatusChange?: (projectId: string, status: Project['status']) => void;
  onAddNew?: () => void;
}

type ProjectFilter = 'all' | 'active' | 'completed' | 'on-hold';
type ProjectSort = 'name' | 'created' | 'updated' | 'dueDate' | 'progress';
type SortDirection = 'asc' | 'desc';

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading = false,
  onDelete,
  onView,
  onStatusChange,
  onAddNew
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [sort, setSort] = useState<ProjectSort>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  


  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = project.name.toLowerCase().includes(query);
      const matchesDescription = project.description?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesDescription) {
        return false;
      }
    }

    // Status filter
    if (filter !== 'all' && project.status !== filter) {
      return false;
    }

    return true;
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sort) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updated':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'progress':
        aValue = a.progress;
        bValue = b.progress;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (newSort: ProjectSort) => {
    if (sort === newSort) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(newSort);
      setSortDirection('desc');
    }
  };

  const getFilterCount = (filterType: ProjectFilter) => {
    if (filterType === 'all') return projects.length;
    return projects.filter(p => p.status === filterType).length;
  };

  if (loading) {
    return (
      <Box>
        {/* Loading skeleton for filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={200} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </Stack>
        </Paper>
        
        {/* Loading skeleton for project cards */}
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2, height: 280 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="rectangular" width="100%" height={8} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Filters and Search */}
      <Fade in timeout={300}>
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            {/* Search */}
            <TextField
            fullWidth
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Filters and Sort */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            {/* Status Filter */}
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Filter:
              </Typography>
              {(['all', 'active', 'completed', 'on-hold'] as ProjectFilter[]).map((filterType) => (
                <Chip
                  key={filterType}
                  label={`${filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')} (${getFilterCount(filterType)})`}
                  onClick={() => setFilter(filterType)}
                  color={filter === filterType ? 'primary' : 'default'}
                  variant={filter === filterType ? 'filled' : 'outlined'}
                  size="small"
                  clickable
                />
              ))}
            </Stack>

            {/* Sort */}
            <Stack direction="row" spacing={1} alignItems="center">
              <SortIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as ProjectSort)}
                >
                  <MenuItem value="updated">Last Updated</MenuItem>
                  <MenuItem value="created">Created Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="progress">Progress</MenuItem>
                </Select>
              </FormControl>
              <Chip
                label={sortDirection === 'asc' ? '↑' : '↓'}
                size="small"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                clickable
              />
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      </Fade>

      {/* Stats and Add Button */}
      <Fade in timeout={500}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5">
              Projects ({sortedProjects.length})
            </Typography>
            {sortedProjects.length !== projects.length && (
              <Typography variant="body2" color="text.secondary">
                Showing {sortedProjects.length} of {projects.length} projects
                {searchQuery && ` matching "${searchQuery}"`}
              </Typography>
            )}
          </Box>
          {onAddNew && projects.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{ borderRadius: 1.5, fontWeight: 600 }}
            >
              New Project
            </Button>
          )}
        </Box>
      </Fade>

      {/* Project Grid */}
      {sortedProjects.length === 0 ? (
        <Fade in timeout={500}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            {projects.length === 0 ? (
              <Stack spacing={2} alignItems="center">
                <Typography variant="h5">
                  No projects yet
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Create your first project to get started!
                </Typography>
                {onAddNew && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={onAddNew}
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                  >
                    New Project
                  </Button>
                )}
              </Stack>
            ) : (
              <Stack spacing={2} alignItems="center">
                <Typography variant="h5">
                  No projects match your filters
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Try adjusting your search or filter criteria.
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  sx={{ borderRadius: 1.5, fontWeight: 600 }}
                >
                  Clear Filters
                </Button>
              </Stack>
            )}
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {sortedProjects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={project.id}>
              <Grow in timeout={300 + index * 50}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <ProjectCard
                    project={project}
                    onDelete={onDelete}
                    onView={onView}
                    onStatusChange={onStatusChange}
                  />
                </Box>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectList;