import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Palette as PaletteIcon,
  Assignment as ProjectIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CreateProjectData } from '../../services/projectService';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectData) => Promise<void>;
}

const PROJECT_COLORS = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Green', value: '#388e3c' },
  { name: 'Orange', value: '#f57c00' },
  { name: 'Red', value: '#d32f2f' },
  { name: 'Purple', value: '#7b1fa2' },
  { name: 'Teal', value: '#00796b' },
  { name: 'Pink', value: '#c2185b' },
  { name: 'Indigo', value: '#303f9f' }
];

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    dueDate: undefined,
    color: '#1976d2'
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    dueDate?: string;
    color?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        dueDate: undefined,
        color: '#1976d2'
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      dueDate?: string;
      color?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.dueDate && formData.dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProjectIcon color="primary" />
            <Typography variant="h6" component="span">
              Create New Project
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Project Name */}
            <TextField
              label="Project Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              required
              autoFocus
              disabled={submitting}
              placeholder="Enter project name..."
            />

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description || `${formData.description.length}/500 characters`}
              fullWidth
              multiline
              rows={3}
              disabled={submitting}
              placeholder="Describe your project..."
            />

            {/* Due Date */}
            <DatePicker
              label="Due Date (Optional)"
              value={formData.dueDate}
              onChange={(date: Date | null) => handleInputChange('dueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.dueDate),
                  helperText: errors.dueDate || '',
                  InputProps: {
                    startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'action.active' }} />
                  }
                }
              }}
              minDate={new Date()}
              disabled={submitting}
            />

            {/* Color Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon fontSize="small" color="action" />
                Project Color
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {PROJECT_COLORS.map((color) => (
                  <Chip
                    key={color.value}
                    label={color.name}
                    onClick={() => handleInputChange('color', color.value)}
                    variant={formData.color === color.value ? 'filled' : 'outlined'}
                    disabled={submitting}
                    sx={{
                      backgroundColor: formData.color === color.value ? color.value : 'transparent',
                      borderColor: color.value,
                      color: formData.color === color.value ? 'white' : color.value,
                      '&:hover': {
                        backgroundColor: formData.color === color.value ? color.value : `${color.value}20`
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Preview */}
            {formData.name && (
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
                  Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: formData.color
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {formData.name}
                  </Typography>
                </Box>
                {formData.description && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.description}
                  </Typography>
                )}
                {formData.dueDate && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    Due: {formData.dueDate.toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.name.trim()}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ProjectForm;