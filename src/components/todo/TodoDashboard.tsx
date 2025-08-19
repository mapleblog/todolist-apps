import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrendingUp,
  Today
} from '@mui/icons-material';
import { Todo } from '../../types';

interface TodoDashboardProps {
  todos: Todo[];
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, trend }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: alpha('#fff', 0.1),
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TrendingUp 
                  sx={{ 
                    fontSize: 16, 
                    transform: trend.isPositive ? 'none' : 'rotate(180deg)',
                    color: trend.isPositive ? '#4caf50' : '#f44336'
                  }} 
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Typography>
              </Stack>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha('#fff', 0.2),
              color: 'white',
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TodayFocus: React.FC<{ todos: Todo[] }> = ({ todos }) => {
  const theme = useTheme();
  
  // Get today's important tasks
  const todayTasks = todos.filter(todo => {
    if (todo.completed) return false;
    
    const today = new Date();
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    
    // Tasks due today or high priority tasks
    return (
      (dueDate && dueDate.toDateString() === today.toDateString()) ||
      todo.priority === 'high'
    );
  }).slice(0, 3);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Today color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Today's Focus
          </Typography>
        </Stack>
        
        {todayTasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No urgent tasks for today. Great job! 🎉
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {todayTasks.map((todo) => (
              <Box
                key={todo.id}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  borderRadius: 2,
                  borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                      {todo.title}
                    </Typography>
                    {todo.category && (
                      <Chip
                        label={todo.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </Box>
                  <Chip
                    label={todo.priority}
                    size="small"
                    sx={{
                      bgcolor: alpha(getPriorityColor(todo.priority), 0.1),
                      color: getPriorityColor(todo.priority),
                      fontWeight: 'medium',
                      textTransform: 'capitalize'
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const TodoDashboard: React.FC<TodoDashboardProps> = ({ todos, loading = false }) => {
  const theme = useTheme();
  
  // Calculate statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const inProgressTodos = todos.filter(todo => !todo.completed).length;
  const overdueTodos = todos.filter(todo => {
    if (todo.completed || !todo.dueDate) return false;
    return new Date(todo.dueDate) < new Date();
  }).length;
  
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  const statCards = [
    {
      title: 'Total Tasks',
      value: totalTodos,
      icon: <Assignment />,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Completed',
      value: completedTodos,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'In Progress',
      value: inProgressTodos,
      icon: <Schedule />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
      trend: { value: 3, isPositive: false }
    },
    {
      title: 'Overdue',
      value: overdueTodos,
      icon: <Warning />,
      color: theme.palette.error.main,
      gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
      trend: { value: 15, isPositive: false }
    }
  ];

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card sx={{ height: 140 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                    <Box sx={{ width: 56, height: 56, bgcolor: 'grey.200', borderRadius: '50%' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: 200 }}>
              <CardContent>
                <Box sx={{ width: '30%', height: 24, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: '100%', height: 120, bgcolor: 'grey.200', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 200 }}>
              <CardContent>
                <Box sx={{ width: '50%', height: 24, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: '100%', height: 120, bgcolor: 'grey.200', borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>
      
      {/* Progress Overview and Today's Focus */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <TrendingUp color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Progress Overview
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                      {completionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={completionRate}
                      sx={{
                        mt: 2,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Active Tasks
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {inProgressTodos}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Completed Today
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {completedTodos}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Overdue
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {overdueTodos}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <TodayFocus todos={todos} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodoDashboard;