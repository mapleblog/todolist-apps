import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { performanceMonitor } from '../utils/performance';
import type { PerformanceMetrics } from '../utils/performance';

interface PerformanceDashboardProps {
  isVisible?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isVisible = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [expanded, setExpanded] = useState(isVisible);
  const [loading, setLoading] = useState(false);

  const updateMetrics = async () => {
    setLoading(true);
    try {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateMetrics();
    
    // Update metrics every 5 seconds when visible
    let interval: NodeJS.Timeout;
    if (expanded) {
      interval = setInterval(updateMetrics, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expanded]);

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 90) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number): string => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  if (!metrics && !loading) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1300,
        maxWidth: expanded ? 400 : 'auto'
      }}
    >
      {/* Toggle Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Tooltip title={expanded ? 'Hide Performance Dashboard' : 'Show Performance Dashboard'}>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
            size="small"
          >
            {expanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded}>
        <Card sx={{ bgcolor: 'background.paper', boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SpeedIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Performance Dashboard
              </Typography>
              <IconButton
                onClick={updateMetrics}
                disabled={loading}
                size="small"
                sx={{ ml: 'auto' }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {metrics && (
              <Grid container spacing={2}>
                {/* Web Vitals */}
                {metrics.webVitals && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <TimelineIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Web Vitals
                      </Typography>
                    </Grid>
                    
                    {metrics.webVitals.CLS !== undefined && (
                      <Grid item xs={4}>
                        <Chip
                          label={`CLS: ${metrics.webVitals.CLS.toFixed(3)}`}
                          color={getScoreColor(metrics.webVitals.CLS < 0.1 ? 100 : metrics.webVitals.CLS < 0.25 ? 50 : 0)}
                          size="small"
                        />
                      </Grid>
                    )}
                    
                    {metrics.webVitals.FID !== undefined && (
                      <Grid item xs={4}>
                        <Chip
                          label={`FID: ${formatTime(metrics.webVitals.FID)}`}
                          color={getScoreColor(metrics.webVitals.FID < 100 ? 100 : metrics.webVitals.FID < 300 ? 50 : 0)}
                          size="small"
                        />
                      </Grid>
                    )}
                    
                    {metrics.webVitals.LCP !== undefined && (
                      <Grid item xs={4}>
                        <Chip
                          label={`LCP: ${formatTime(metrics.webVitals.LCP)}`}
                          color={getScoreColor(metrics.webVitals.LCP < 2500 ? 100 : metrics.webVitals.LCP < 4000 ? 50 : 0)}
                          size="small"
                        />
                      </Grid>
                    )}
                  </>
                )}

                {/* Load Times */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                    Load Performance
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Page Load: {formatTime(metrics.loadTime)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    DOM Ready: {formatTime(metrics.domContentLoaded)}
                  </Typography>
                </Grid>

                {/* Memory Usage */}
                {metrics.memoryUsage && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                        <MemoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Memory Usage
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Used: {formatBytes(metrics.memoryUsage.usedJSHeapSize)} / 
                        Total: {formatBytes(metrics.memoryUsage.totalJSHeapSize)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize) * 100}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </>
                )}

                {/* Render Performance */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                    Render Performance
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    First Paint: {formatTime(metrics.firstPaint)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    FCP: {formatTime(metrics.firstContentfulPaint)}
                  </Typography>
                </Grid>

                {/* Performance Score */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Score: {metrics.performanceScore}/100
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.performanceScore}
                      color={getScoreColor(metrics.performanceScore)}
                    />
                  </Box>
                </Grid>

                {/* Warnings */}
                {metrics.performanceScore < 70 && (
                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Performance issues detected. Consider optimizing your application.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

export default PerformanceDashboard;