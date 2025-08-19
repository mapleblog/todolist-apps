import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  Stack,
  Zoom,
  Fade
} from '@mui/material';
import {
  Book as BookIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  TrendingUp as ProgressIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  completed: boolean;
  date: string;
  type: 'reading' | 'practice' | 'review' | 'exam';
}

interface StudyGoal {
  id: string;
  subject: string;
  targetHours: number;
  completedHours: number;
  deadline: string;
}

const mockStudySessions: StudySession[] = [
  {
    id: '1',
    subject: 'JavaScript',
    topic: 'Async/Await and Promises',
    duration: 45,
    completed: true,
    date: '2024-01-15',
    type: 'reading'
  },
  {
    id: '2',
    subject: 'React',
    topic: 'Context API and State Management',
    duration: 60,
    completed: true,
    date: '2024-01-14',
    type: 'practice'
  },
  {
    id: '3',
    subject: 'TypeScript',
    topic: 'Advanced Types and Generics',
    duration: 30,
    completed: false,
    date: '2024-01-16',
    type: 'review'
  }
];

const mockStudyGoals: StudyGoal[] = [
  {
    id: '1',
    subject: 'JavaScript',
    targetHours: 20,
    completedHours: 15,
    deadline: '2024-02-01'
  },
  {
    id: '2',
    subject: 'React',
    targetHours: 25,
    completedHours: 18,
    deadline: '2024-02-15'
  },
  {
    id: '3',
    subject: 'TypeScript',
    targetHours: 15,
    completedHours: 8,
    deadline: '2024-01-30'
  }
];

const StudyPage: React.FC = () => {
  const [studySessions] = useState<StudySession[]>(mockStudySessions);
  const [studyGoals] = useState<StudyGoal[]>(mockStudyGoals);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Timer functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setCurrentTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    if (currentTime > 0) {
      // Save session logic here
      setCurrentTime(0);
    }
  };



  const getTypeIcon = (type: StudySession['type']) => {
    switch (type) {
      case 'reading':
        return <BookIcon />;
      case 'practice':
        return <QuizIcon />;
      case 'review':
        return <ProgressIcon />;
      case 'exam':
        return <QuizIcon />;
      default:
        return <BookIcon />;
    }
  };

  const getTypeColor = (type: StudySession['type']) => {
    switch (type) {
      case 'reading':
        return '#1976d2';
      case 'practice':
        return '#388e3c';
      case 'review':
        return '#f57c00';
      case 'exam':
        return '#d32f2f';
      default:
        return '#1976d2';
    }
  };

  const totalStudyTime = studySessions
    .filter(session => session.completed)
    .reduce((total, session) => total + session.duration, 0);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Study Tracker
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Track your learning progress and study sessions
            </Typography>
          </Box>

          {/* Study Timer */}
          <Zoom in={true} timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }
            }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <TimerIcon sx={{ color: 'white' }} />
                  </Avatar>
                }
                title={
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                    Study Timer
                  </Typography>
                }
                subheader={
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Track your current study session
                  </Typography>
                }
              />
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography 
                    variant="h1" 
                    component="div" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      mb: 3,
                      fontSize: { xs: '3rem', md: '4rem' },
                      fontWeight: 300,
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {formatTime(currentTime)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {!timerRunning ? (
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={handleStartTimer}
                        sx={{
                          bgcolor: 'rgba(76, 175, 80, 0.9)',
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 1)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        Start
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<PauseIcon />}
                        onClick={handlePauseTimer}
                        sx={{
                          bgcolor: 'rgba(255, 152, 0, 0.9)',
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 152, 0, 1)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        Pause
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<StopIcon />}
                      onClick={handleStopTimer}
                      disabled={currentTime === 0}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.05)'
                        },
                        '&:disabled': {
                          color: 'rgba(255, 255, 255, 0.5)',
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      Stop
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Zoom>

          <Grid container spacing={3}>
            {/* Study Goals */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardHeader 
                    title={
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Study Goals
                      </Typography>
                    }
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      '& .MuiCardHeader-title': {
                        color: 'white'
                      }
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
              {studyGoals.map((goal) => {
                const progress = (goal.completedHours / goal.targetHours) * 100;
                return (
                  <Box key={goal.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{goal.subject}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.completedHours}h / {goal.targetHours}h
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                );
              })}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Study Statistics */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1200}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardHeader 
                    title={
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                        Study Statistics
                      </Typography>
                    }
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 3,
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                          }
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {Math.floor(totalStudyTime / 60)}h
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Study Time
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          borderRadius: 3,
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 20px rgba(17, 153, 142, 0.4)'
                          }
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {studySessions.filter(s => s.completed).length}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Sessions Completed
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                          borderRadius: 3,
                          color: '#8B4513',
                          boxShadow: '0 4px 15px rgba(252, 182, 159, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 20px rgba(252, 182, 159, 0.4)'
                          }
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {new Set(studySessions.map(s => s.subject)).size}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Subjects
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          borderRadius: 3,
                          color: '#2E8B57',
                          boxShadow: '0 4px 15px rgba(168, 237, 234, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 20px rgba(168, 237, 234, 0.4)'
                          }
                        }}>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {Math.round(totalStudyTime / studySessions.filter(s => s.completed).length) || 0}m
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Avg Session
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Recent Study Sessions */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1400}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardHeader 
                    title={
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                        Recent Study Sessions
                      </Typography>
                    }
                    sx={{
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: 'white'
                    }}
                  />
                  <CardContent sx={{ p: 0 }}>
                    <List sx={{ p: 0 }}>
                      {studySessions.slice(0, 5).map((session, index) => (
                        <Fade in={true} timeout={1600 + index * 200} key={session.id}>
                          <ListItem sx={{
                            py: 2,
                            px: 3,
                            borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.02)',
                              transform: 'translateX(8px)'
                            }
                          }}>
                            <ListItemIcon>
                              <Avatar sx={{ 
                                bgcolor: getTypeColor(session.type), 
                                width: 40, 
                                height: 40,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                }
                              }}>
                                {getTypeIcon(session.type)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {session.subject} - {session.topic}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={session.type}
                                    size="small"
                                    sx={{
                                      bgcolor: getTypeColor(session.type),
                                      color: 'white',
                                      fontWeight: 600,
                                      textTransform: 'capitalize'
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {session.duration}min • {new Date(session.date).toLocaleDateString()}
                                  </Typography>
                                  {session.completed && (
                                    <CompleteIcon 
                                      color="success" 
                                      fontSize="small" 
                                      sx={{ 
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                          '0%': { opacity: 1 },
                                          '50%': { opacity: 0.5 },
                                          '100%': { opacity: 1 }
                                        }
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        </Fade>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default StudyPage;