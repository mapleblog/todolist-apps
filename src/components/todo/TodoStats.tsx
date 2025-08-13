import React from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { Todo, TodoPriority } from '../../types';
import { useTodos } from '../../contexts/TodoContext';
import { isBefore, startOfDay, format, isToday, isTomorrow, addDays } from 'date-fns';

interface TodoStatsProps {
  compact?: boolean;
}

const TodoStats: React.FC<TodoStatsProps> = ({ compact = false }) => {
  const { todos } = useTodos();

  // Calculate statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Overdue todos
  const overdueTodos = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    isBefore(new Date(todo.dueDate), startOfDay(new Date()))
  ).length;

  // Due today
  const dueTodayTodos = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    isToday(new Date(todo.dueDate))
  ).length;

  // Due tomorrow
  const dueTomorrowTodos = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    isTomorrow(new Date(todo.dueDate))
  ).length;

  // Due this week (next 7 days)
  const dueThisWeekTodos = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  // Priority breakdown
  const priorityStats = {
    high: todos.filter(todo => !todo.completed && todo.priority === 'high').length,
    medium: todos.filter(todo => !todo.completed && todo.priority === 'medium').length,
    low: todos.filter(todo => !todo.completed && todo.priority === 'low').length
  };

  // Category breakdown
  const categoryStats = todos.reduce((acc, todo) => {
    if (!todo.completed && todo.category) {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const getPriorityColor = (priority: TodoPriority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#8bc34a';
    if (rate >= 40) return '#ff9800';
    if (rate >= 20) return '#ff5722';
    return '#f44336';
  };

  if (compact) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          {/* Completion Rate */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getCompletionColor(completionRate),
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="body2" fontWeight="bold">
                {Math.round(completionRate)}%
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {pendingTodos}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Box>
            
            {overdueTodos > 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                  {overdueTodos}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            )}
            
            {dueTodayTodos > 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">
                  {dueTodayTodos}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due Today
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TrendingUpIcon />
        Todo Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Progress */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                Overall Progress
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {completedTodos} of {totalTodos} completed
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(completionRate)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getCompletionColor(completionRate),
                      borderRadius: 5
                    }
                  }}
                />
              </Box>
              
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${completedTodos} Completed`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${pendingTodos} Pending`}
                  color="default"
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Due Dates */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TodayIcon color="primary" />
                Due Dates
              </Typography>
              
              <Stack spacing={1.5}>
                {overdueTodos > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: '#f44336', fontSize: 16 }} />
                      Overdue
                    </Typography>
                    <Chip label={overdueTodos} color="error" size="small" />
                  </Box>
                )}
                
                {dueTodayTodos > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TodayIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                      Due Today
                    </Typography>
                    <Chip label={dueTodayTodos} sx={{ backgroundColor: '#ff9800', color: 'white' }} size="small" />
                  </Box>
                )}
                
                {dueTomorrowTodos > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ color: '#2196f3', fontSize: 16 }} />
                      Due Tomorrow
                    </Typography>
                    <Chip label={dueTomorrowTodos} sx={{ backgroundColor: '#2196f3', color: 'white' }} size="small" />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Due This Week
                  </Typography>
                  <Chip label={dueThisWeekTodos} color="default" variant="outlined" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Breakdown */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlagIcon color="primary" />
                Priority Breakdown
              </Typography>
              
              <Stack spacing={1.5}>
                {Object.entries(priorityStats).map(([priority, count]) => (
                  <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlagIcon sx={{ color: getPriorityColor(priority as TodoPriority), fontSize: 16 }} />
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </Typography>
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        backgroundColor: count > 0 ? getPriorityColor(priority as TodoPriority) : 'grey.200',
                        color: count > 0 ? 'white' : 'text.secondary'
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderIcon color="primary" />
                Top Categories
              </Typography>
              
              {topCategories.length > 0 ? (
                <Stack spacing={1.5}>
                  {topCategories.map(([category, count], index) => (
                    <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                        {category}
                      </Typography>
                      <Chip label={count} color="primary" variant="outlined" size="small" />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No categories with pending todos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TodoStats;