import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  Chip,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTodos } from '../../contexts/TodoContext';
import { Todo, TodoPriority, CreateTodoData, UpdateTodoData } from '../../types';

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (todoData: CreateTodoData | UpdateTodoData) => Promise<void>;
  todo?: Todo | null;
  defaultCategory?: string;
}

const TodoForm: React.FC<TodoFormProps> = ({
  open,
  onClose,
  onSubmit,
  todo,
  defaultCategory
}) => {
  const { addTodo, updateTodoItem } = useTodos();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    category: '',
    dueDate: null as Date | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Common categories for suggestions
  const commonCategories = [
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'Finance',
    'Education',
    'Travel',
    'Home',
    'Projects'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];

  useEffect(() => {
    if (open) {
      if (todo) {
        // Edit mode
        setFormData({
          title: todo.title,
          description: todo.description || '',
          priority: todo.priority || 'medium',
          category: todo.category || '',
          dueDate: todo.dueDate || null
        });
      } else {
        // Add mode
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          category: defaultCategory || '',
          dueDate: null
        });
      }
      setErrors({});
      setNewCategory('');
      setShowNewCategory(false);
    }
  }, [open, todo, defaultCategory]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters';
    }

    if (formData.dueDate && formData.dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        category: formData.category.trim() || undefined,
        dueDate: formData.dueDate || undefined
      };

      if (onSubmit) {
        // Use external submit handler
        await onSubmit(todoData);
      } else {
        // Use internal TodoContext functions
        if (todo) {
          // Update existing todo
          await updateTodoItem(todo.id, todoData as UpdateTodoData);
        } else {
          // Create new todo
          await addTodo(todoData as CreateTodoData);
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to save todo:', error);
      setErrors({ submit: 'Failed to save todo. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (category === 'new') {
      setShowNewCategory(true);
    } else {
      setFormData(prev => ({ ...prev, category }));
    }
  };

  const isEdit = Boolean(todo);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}
        >
          <Typography variant="h6" component="div">
            {isEdit ? 'Edit Todo' : 'Add New Todo'}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Error Alert */}
            {errors.submit && (
              <Alert severity="error">
                {errors.submit}
              </Alert>
            )}

            {/* Title */}
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              fullWidth
              required
              autoFocus
              placeholder="What needs to be done?"
            />

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
              fullWidth
              multiline
              rows={3}
              placeholder="Add more details (optional)"
            />

            {/* Priority */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value)}
                startAdornment={<FlagIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlagIcon sx={{ color: option.color, fontSize: 16 }} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category */}
            <Box>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  startAdornment={<FolderIcon sx={{ mr: 1, color: 'action.active' }} />}
                  error={Boolean(errors.category)}
                >
                  <MenuItem value="">
                    <em>No Category</em>
                  </MenuItem>
                  {commonCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AddIcon fontSize="small" />
                      Add New Category
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category}
                </Typography>
              )}

              {/* New Category Input */}
              {showNewCategory && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    label="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Enter category name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewCategory();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddNewCategory}
                    disabled={!newCategory.trim()}
                  >
                    Add
                  </Button>
                </Box>
              )}
            </Box>

            {/* Due Date */}
            <DateTimePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(date: Date | null) => handleInputChange('dueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.dueDate),
                  helperText: errors.dueDate,
                  InputProps: {
                    startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'action.active' }} />
                  }
                }
              }}
              minDateTime={new Date()}
            />

            {/* Preview */}
            {formData.title && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {formData.title}
                </Typography>
                {formData.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formData.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    icon={<FlagIcon />}
                    label={priorityOptions.find(p => p.value === formData.priority)?.label}
                    size="small"
                    sx={{
                      backgroundColor: priorityOptions.find(p => p.value === formData.priority)?.color,
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                  {formData.category && (
                    <Chip
                      icon={<FolderIcon />}
                      label={formData.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  {formData.dueDate && (
                    <Chip
                      icon={<ScheduleIcon />}
                      label={formData.dueDate.toLocaleDateString()}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.title.trim()}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Add Todo')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TodoForm;