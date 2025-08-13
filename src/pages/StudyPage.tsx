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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Book as BookIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  TrendingUp as ProgressIcon,
  Add as AddIcon,
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
  const [studySessions, setStudySessions] = useState<StudySession[]>(mockStudySessions);
  const [studyGoals] = useState<StudyGoal[]>(mockStudyGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [newSession, setNewSession] = useState({
    subject: '',
    topic: '',
    type: 'reading' as StudySession['type']
  });

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

  const handleCreateSession = () => {
    if (newSession.subject && newSession.topic) {
      const session: StudySession = {
        id: Date.now().toString(),
        subject: newSession.subject,
        topic: newSession.topic,
        duration: 0,
        completed: false,
        date: new Date().toISOString().split('T')[0],
        type: newSession.type
      };
      setStudySessions([...studySessions, session]);
      setNewSession({ subject: '', topic: '', type: 'reading' });
      setDialogOpen(false);
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Study Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your learning progress and study sessions
        </Typography>
      </Box>

      {/* Study Timer */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <TimerIcon />
            </Avatar>
          }
          title="Study Timer"
          subheader="Track your current study session"
        />
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace', mb: 2 }}>
              {formatTime(currentTime)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!timerRunning ? (
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleStartTimer}
                  color="success"
                >
                  Start
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<PauseIcon />}
                  onClick={handlePauseTimer}
                  color="warning"
                >
                  Pause
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<StopIcon />}
                onClick={handleStopTimer}
                disabled={currentTime === 0}
              >
                Stop
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Study Goals */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Study Goals" />
            <CardContent>
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
        </Grid>

        {/* Study Statistics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Study Statistics" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.contrastText">
                      {Math.floor(totalStudyTime / 60)}h
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Total Study Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="success.contrastText">
                      {studySessions.filter(s => s.completed).length}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Sessions Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="warning.contrastText">
                      {new Set(studySessions.map(s => s.subject)).size}
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Subjects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="info.contrastText">
                      {Math.round(totalStudyTime / studySessions.filter(s => s.completed).length) || 0}m
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Avg Session
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Study Sessions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Study Sessions" />
            <CardContent>
              <List>
                {studySessions.slice(0, 5).map((session) => (
                  <ListItem key={session.id}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getTypeColor(session.type), width: 32, height: 32 }}>
                        {getTypeIcon(session.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${session.subject} - ${session.topic}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={session.type}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption">
                            {session.duration}min • {new Date(session.date).toLocaleDateString()}
                          </Typography>
                          {session.completed && (
                            <CompleteIcon color="success" fontSize="small" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add study session"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Study Session Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Plan Study Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            variant="outlined"
            value={newSession.subject}
            onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Topic"
            fullWidth
            variant="outlined"
            value={newSession.topic}
            onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Study Type</InputLabel>
            <Select
              value={newSession.type}
              onChange={(e) => setNewSession({ ...newSession, type: e.target.value as StudySession['type'] })}
              label="Study Type"
            >
              <MenuItem value="reading">Reading</MenuItem>
              <MenuItem value="practice">Practice</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="exam">Exam</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSession} variant="contained">
            Plan Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyPage;