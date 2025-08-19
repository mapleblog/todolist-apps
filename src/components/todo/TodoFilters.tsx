import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Collapse,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  Paper,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Flag as FlagIcon,
  Sort as SortIcon,
  Folder as FolderIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { TodoFilter, TodoSort } from '../../types';
import { useTodos } from '../../hooks/useTodos';

interface TodoFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  sort: TodoSort;
  onSortChange: (sort: TodoSort) => void;
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange
}) => {
  const { todos } = useTodos();
  const [expanded, setExpanded] = useState(false);

  // Get unique categories from todos
  const categories = Array.from(
    new Set(todos.map(todo => todo.category).filter(Boolean))
  ).sort();

  // Count active filters
  const activeFiltersCount = [
    filter.status !== 'all',
    filter.priority !== 'all',
    filter.category !== 'all'
  ].filter(Boolean).length;

  const handleFilterChange = (key: keyof TodoFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const handleSortChange = (key: keyof TodoSort, value: any) => {
    onSortChange({ ...sort, [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: 'all',
      priority: 'all',
      category: 'all'
    });
    onSearchChange('');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return 'All';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'All';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };



  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={3}>
        {/* Modern Search Bar */}
        <Box>
          <TextField
            placeholder="Search tasks, categories, or descriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: 'primary.light'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(25,118,210,0.15)',
                  borderColor: 'primary.main'
                }
              },
              '& .MuiOutlinedInput-input': {
                py: 1.5,
                fontSize: '1rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onSearchChange('')}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                        backgroundColor: 'error.50'
                      }
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Quick Filter Chips */}
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 2, 
              color: 'text.secondary',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <FilterListIcon fontSize="small" />
            Quick Filters
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Status Filter Chips */}
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={filter.status === 'all' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('status', 'all')}
                startIcon={<AssignmentIcon />}
                sx={{
                  borderRadius: '20px 0 0 20px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                All
              </Button>
              <Button
                variant={filter.status === 'pending' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('status', 'pending')}
                startIcon={<ScheduleIcon />}
                sx={{
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 500,
                  ...(filter.status === 'pending' && {
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800',
                    '&:hover': {
                      backgroundColor: '#f57c00',
                      borderColor: '#f57c00'
                    }
                  })
                }}
              >
                Pending
              </Button>
              <Button
                variant={filter.status === 'completed' ? 'contained' : 'outlined'}
                onClick={() => handleFilterChange('status', 'completed')}
                startIcon={<CheckCircleIcon />}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  textTransform: 'none',
                  fontWeight: 500,
                  ...(filter.status === 'completed' && {
                    backgroundColor: '#4caf50',
                    borderColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: '#388e3c',
                      borderColor: '#388e3c'
                    }
                  })
                }}
              >
                Completed
              </Button>
            </ButtonGroup>

            {/* Priority Filter Chips */}
            <Stack direction="row" spacing={1}>
              {['high', 'medium', 'low'].map((priority) => {
                const isActive = filter.priority === priority;
                const colors = {
                  high: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
                  medium: { bg: '#fff3e0', border: '#ff9800', text: '#ef6c00' },
                  low: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' }
                };
                
                return (
                  <Chip
                    key={priority}
                    label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                    icon={<FlagIcon />}
                    onClick={() => handleFilterChange('priority', isActive ? 'all' : priority)}
                    variant={isActive ? 'filled' : 'outlined'}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease-in-out',
                      ...(isActive ? {
                        backgroundColor: colors[priority as keyof typeof colors].bg,
                        borderColor: colors[priority as keyof typeof colors].border,
                        color: colors[priority as keyof typeof colors].text,
                        '& .MuiChip-icon': {
                          color: colors[priority as keyof typeof colors].text
                        }
                      } : {
                        borderColor: colors[priority as keyof typeof colors].border,
                        color: colors[priority as keyof typeof colors].text,
                        '&:hover': {
                          backgroundColor: colors[priority as keyof typeof colors].bg,
                          borderColor: colors[priority as keyof typeof colors].border
                        },
                        '& .MuiChip-icon': {
                          color: colors[priority as keyof typeof colors].border
                        }
                      })
                    }}
                  />
                );
              })}
            </Stack>

            {/* Advanced Filters Toggle */}
            <Tooltip title="Advanced Filters & Sort">
              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: expanded ? 'primary.main' : 'divider',
                  backgroundColor: expanded ? 'primary.50' : 'background.paper',
                  color: expanded ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                    color: 'primary.main'
                  }
                }}
              >
                <Badge badgeContent={activeFiltersCount} color="primary">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Active Filters Display */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">
              Active filters:
            </Typography>
            
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                size="small"
                onDelete={() => onSearchChange('')}
                deleteIcon={<ClearIcon />}
                variant="outlined"
              />
            )}
            
            {filter.status !== 'all' && (
              <Chip
                label={`Status: ${getStatusLabel(filter.status)}`}
                size="small"
                onDelete={() => handleFilterChange('status', 'all')}
                deleteIcon={<ClearIcon />}
                icon={<CheckCircleIcon />}
                variant="outlined"
              />
            )}
            
            {filter.priority !== 'all' && (
              <Chip
                label={`Priority: ${getPriorityLabel(filter.priority)}`}
                size="small"
                onDelete={() => handleFilterChange('priority', 'all')}
                deleteIcon={<ClearIcon />}
                icon={<FlagIcon />}
                variant="outlined"
                sx={{
                  borderColor: getPriorityColor(filter.priority),
                  color: getPriorityColor(filter.priority)
                }}
              />
            )}
            
            {filter.category !== 'all' && (
              <Chip
                label={`Category: ${filter.category}`}
                size="small"
                onDelete={() => handleFilterChange('category', 'all')}
                deleteIcon={<ClearIcon />}
                icon={<FolderIcon />}
                variant="outlined"
              />
            )}
            
            {activeFiltersCount > 0 && (
              <Chip
                label="Clear All"
                size="small"
                onClick={clearAllFilters}
                variant="outlined"
                color="secondary"
              />
            )}
          </Stack>
        )}

        {/* Advanced Filters & Sort */}
        <Collapse in={expanded}>
          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 3, borderColor: 'primary.100' }} />
            
            <Stack spacing={4}>
              {/* Category Filter */}
              <Box>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  <FolderIcon fontSize="small" color="primary" />
                  Categories
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label="All Categories"
                    onClick={() => handleFilterChange('category', 'all')}
                    variant={filter.category === 'all' ? 'filled' : 'outlined'}
                    color={filter.category === 'all' ? 'primary' : 'default'}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 500,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      icon={<FolderIcon />}
                      onClick={() => handleFilterChange('category', filter.category === category ? 'all' : category)}
                      variant={filter.category === category ? 'filled' : 'outlined'}
                      color={filter.category === category ? 'secondary' : 'default'}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Sort Controls */}
              <Box>
                <Typography 
                  variant="subtitle2" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  <SortIcon fontSize="small" color="primary" />
                  Sort Options
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {/* Sort Field */}
                  <FormControl 
                    sx={{ 
                      minWidth: 180,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }
                      }
                    }}
                  >
                    <InputLabel>Sort by</InputLabel>
                    <Select
                      value={sort.field}
                      label="Sort by"
                      onChange={(e) => handleSortChange('field', e.target.value)}
                    >
                      <MenuItem value="createdAt">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" />
                          Created Date
                        </Box>
                      </MenuItem>
                      <MenuItem value="updatedAt">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" />
                          Updated Date
                        </Box>
                      </MenuItem>
                      <MenuItem value="dueDate">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="warning" />
                          Due Date
                        </Box>
                      </MenuItem>
                      <MenuItem value="priority">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlagIcon fontSize="small" color="error" />
                          Priority
                        </Box>
                      </MenuItem>
                      <MenuItem value="title">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentIcon fontSize="small" />
                          Title
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Direction */}
                  <ButtonGroup variant="outlined">
                    <Button
                      variant={sort.direction === 'desc' ? 'contained' : 'outlined'}
                      onClick={() => handleSortChange('direction', 'desc')}
                      startIcon={<TrendingDownIcon />}
                      sx={{
                        borderRadius: '20px 0 0 20px',
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 120
                      }}
                    >
                      Newest First
                    </Button>
                    <Button
                      variant={sort.direction === 'asc' ? 'contained' : 'outlined'}
                      onClick={() => handleSortChange('direction', 'asc')}
                      startIcon={<TrendingUpIcon />}
                      sx={{
                        borderRadius: '0 20px 20px 0',
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 120
                      }}
                    >
                      Oldest First
                    </Button>
                  </ButtonGroup>
                </Stack>
              </Box>

              {/* Clear All Filters */}
              {(activeFiltersCount > 0 || searchQuery) && (
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearAllFilters}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderStyle: 'dashed',
                      '&:hover': {
                        borderStyle: 'solid',
                        backgroundColor: 'error.50',
                        borderColor: 'error.main',
                        color: 'error.main'
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default TodoFilters;