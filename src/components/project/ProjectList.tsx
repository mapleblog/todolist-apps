import React, { useState } from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Grid,
  Skeleton,
  Chip,
  Fade,
  IconButton,
  Container,
  Zoom
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
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
      {/* Stats and Add Button */}
      <Fade in timeout={400}>
        <Card 
          elevation={8}
          sx={{ 
            mb: 4, 
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(25,118,210,0.1)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.01)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 2px rgba(25,118,210,0.2)',
              border: '2px solid rgba(25,118,210,0.2)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6, #90caf9)',
              backgroundSize: '300% 100%',
              animation: 'shimmer 4s ease-in-out infinite',
            },
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-300% 0' },
              '100%': { backgroundPosition: '300% 0' }
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Projects Overview
              </Typography>
              {sortedProjects.length !== projects.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {sortedProjects.length} of {projects.length} projects
                  {searchQuery && ` matching "${searchQuery}"`}
                </Typography>
              )}
              
              {/* Project Statistics */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {projects.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {projects.filter(p => p.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {projects.filter(p => p.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {projects.filter(p => p.status === 'on-hold').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On Hold
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            {onAddNew && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddNew}
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.4)'
                  }
                }}
              >
                New Project
              </Button>
            )}
          </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Search and Filters */}
      <Fade in timeout={700}>
        <Card 
          elevation={6}
          sx={{ 
            mb: 6, 
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(25,118,210,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.4)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 20px 56px rgba(0,0,0,0.15), 0 0 0 2px rgba(25,118,210,0.15)',
              border: '2px solid rgba(25,118,210,0.15)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            },
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Search */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search projects by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                          transition: 'all 0.2s',
                          '&:hover': {
                            color: 'error.main',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    background: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(25,118,210,0.2)',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 3px rgba(25,118,210,0.1)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
                    }
                  }
                }}
              />
              {searchQuery && (
                <Chip
                  label={`${sortedProjects.length} result${sortedProjects.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 8,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>

          {/* Filters and Sort */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 3, sm: 4 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {/* Status Filter */}
              <Box sx={{ position: 'relative', minWidth: { xs: '100%', sm: 220 } }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 600, color: 'primary.main' }}>Status Filter</InputLabel>
                  <Select
                    value={filter}
                    label="Status Filter"
                    onChange={(e) => setFilter(e.target.value as ProjectFilter)}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(25,118,210,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        border: '2px solid rgba(25,118,210,0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25,118,210,0.15)',
                      },
                      '&.Mui-focused': {
                        border: '2px solid #1976d2',
                        boxShadow: '0 0 0 4px rgba(25,118,210,0.1)',
                      },
                      '& .MuiSelect-select': {
                        fontWeight: 600,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <MenuItem value="all" sx={{ fontWeight: 600 }}>🔍 All Status</MenuItem>
                    <MenuItem value="active" sx={{ fontWeight: 600, color: 'success.main' }}>🟢 Active</MenuItem>
                    <MenuItem value="completed" sx={{ fontWeight: 600, color: 'info.main' }}>✅ Completed</MenuItem>
                    <MenuItem value="on-hold" sx={{ fontWeight: 600, color: 'warning.main' }}>⏸️ On Hold</MenuItem>
                  </Select>
                </FormControl>
                {filter !== 'all' && (
                  <Chip
                    label="Filtered"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>

              {/* Sort Options */}
              <Box sx={{ position: 'relative', minWidth: { xs: '100%', sm: 220 } }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 600, color: 'primary.main' }}>Sort By</InputLabel>
                  <Select
                    value={sort}
                    label="Sort By"
                    onChange={(e) => handleSortChange(e.target.value as ProjectSort)}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(25,118,210,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        border: '2px solid rgba(25,118,210,0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25,118,210,0.15)',
                      },
                      '&.Mui-focused': {
                        border: '2px solid #1976d2',
                        boxShadow: '0 0 0 4px rgba(25,118,210,0.1)',
                      },
                      '& .MuiSelect-select': {
                        fontWeight: 600,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <MenuItem value="name" sx={{ fontWeight: 600 }}>📝 Name</MenuItem>
                    <MenuItem value="updated" sx={{ fontWeight: 600 }}>🕒 Last Updated</MenuItem>
                    <MenuItem value="created" sx={{ fontWeight: 600 }}>📅 Created Date</MenuItem>
                    <MenuItem value="dueDate" sx={{ fontWeight: 600 }}>⏰ Due Date</MenuItem>
                    <MenuItem value="progress" sx={{ fontWeight: 600 }}>📈 Progress</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Sort Direction */}
              <IconButton
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  borderRadius: 3,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.4)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(0.98)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  }
                }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </IconButton>
            </Stack>
        </Stack>
          </CardContent>
        </Card>
      </Fade>



      {/* Empty State */}
      {projects.length === 0 ? (
        <Fade in timeout={800}>
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 20%, rgba(25,118,210,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(66,165,245,0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box 
                sx={{ 
                  mb: 4,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      right: -10,
                      bottom: -10,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      opacity: 0.1,
                      animation: 'pulse 2s ease-in-out infinite'
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.2 }
                    }
                  }}
                >
                  <Typography sx={{ fontSize: 60 }}>📁</Typography>
                </Box>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                🚀 Ready to Start?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                No Projects Yet
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 5, 
                  color: 'text.secondary', 
                  maxWidth: 500, 
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                Transform your ideas into reality! Create your first project to organize tasks, track progress, and achieve your goals with style.
              </Typography>
              {onAddNew && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={onAddNew}
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(25,118,210,0.4)'
                    }
                  }}
                >
                  ✨ Create Your First Project
                </Button>
              )}
            </Box>
          </Paper>
        </Fade>
      ) : sortedProjects.length === 0 ? (
        <Fade in timeout={800}>
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box 
                sx={{ 
                  mb: 4,
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,183,77,0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <SearchIcon 
                    sx={{ 
                      fontSize: 50, 
                      color: 'warning.main',
                      opacity: 0.8
                    }} 
                  />
                </Box>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                🔍 No Projects Found
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: 'text.secondary', 
                  maxWidth: 450, 
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {searchQuery 
                  ? `No projects match "${searchQuery}". Try different keywords or adjust your filters.`
                  : 'No projects match the current filters. Try changing your criteria to see more results.'
                }
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                {searchQuery && (
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => setSearchQuery('')}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(25,118,210,0.04)'
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: 'rgba(156,39,176,0.04)'
                    }
                  }}
                >
                  Reset All Filters
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          {sortedProjects.map((project, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={project.id}>
              <Zoom in timeout={400 + index * 100} style={{ transitionDelay: `${index * 50}ms` }}>
                <div>
                  <ProjectCard project={project} onDelete={onDelete} onView={() => {}} />
                </div>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectList;