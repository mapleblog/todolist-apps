import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Typography,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  Flag as FlagIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,

} from '@mui/icons-material';
import { TodoFilter, TodoSort } from '../../types';
import { useTodos } from '../../contexts/TodoContext';

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
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        {/* Search and Filter Toggle */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )
            }}
          />
          
          <Tooltip title="Toggle Filters">
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: expanded ? 'primary.main' : 'divider',
                backgroundColor: expanded ? 'primary.50' : 'transparent'
              }}
            >
              <Badge badgeContent={activeFiltersCount} color="primary">
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>

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

        {/* Expanded Filters */}
        <Collapse in={expanded}>
          <Box sx={{ pt: 1 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={3}>
              {/* Filter Controls */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon fontSize="small" />
                  Filters
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {/* Status Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filter.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Priority Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filter.priority}
                      label="Priority"
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="high">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlagIcon sx={{ color: '#f44336', fontSize: 16 }} />
                          High
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlagIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                          Medium
                        </Box>
                      </MenuItem>
                      <MenuItem value="low">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlagIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                          Low
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Category Filter */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filter.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              {/* Sort Controls */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SortIcon fontSize="small" />
                  Sort
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {/* Sort Field */}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                      value={sort.field}
                      label="Sort by"
                      onChange={(e) => handleSortChange('field', e.target.value)}
                    >
                      <MenuItem value="createdAt">Created Date</MenuItem>
                      <MenuItem value="updatedAt">Updated Date</MenuItem>
                      <MenuItem value="dueDate">Due Date</MenuItem>
                      <MenuItem value="priority">Priority</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Direction */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={sort.direction}
                      label="Order"
                      onChange={(e) => handleSortChange('direction', e.target.value)}
                    >
                      <MenuItem value="desc">Newest First</MenuItem>
                      <MenuItem value="asc">Oldest First</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default TodoFilters;