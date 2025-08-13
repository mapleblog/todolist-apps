import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  Sync,
  SyncProblem,
  CloudOff,
  CloudDone,
  Warning,
  Info,
  Refresh
} from '@mui/icons-material';
import { useNetworkStatus } from '../../services/networkStatus';
import { SyncService } from '../../services/syncService';
import { OperationQueueService } from '../../services/operationQueue';
import { ConflictResolverService } from '../../services/conflictResolver';
import { QueueStatus, ConflictData } from '../../types';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueStatus: QueueStatus;
  conflicts: ConflictData[];
  lastSyncTime?: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = true,
  compact = false
}) => {
  const { status: networkStatus, isOnline, isOffline } = useNetworkStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    queueStatus: { pendingCount: 0, isProcessing: false },
    conflicts: []
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const syncService = SyncService.getInstance();
  const queueService = OperationQueueService.getInstance();
  const conflictResolver = ConflictResolverService.getInstance();

  useEffect(() => {
    updateSyncStatus();
    
    // Update sync status every 10 seconds
    const interval = setInterval(updateSyncStatus, 10000);
    
    return () => clearInterval(interval);
  }, [networkStatus]);

  const updateSyncStatus = async () => {
    try {
      const [queueStatus, conflicts] = await Promise.all([
        queueService.getQueueStatus(),
        conflictResolver.getAllConflicts()
      ]);
      
      setSyncStatus({
        isOnline,
        isSyncing: syncService.isSyncInProgress() || queueStatus.isProcessing,
        queueStatus,
        conflicts,
        lastSyncTime: queueStatus.lastProcessed
      });
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setRefreshing(true);
    try {
      await syncService.syncAll();
      await updateSyncStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: 'local' | 'remote') => {
    try {
      const conflict = syncStatus.conflicts.find(c => c.todoId === conflictId);
      if (conflict) {
        await conflictResolver.resolveConflict(conflict, resolution === 'local' ? 'local_wins' : 'remote_wins');
        await updateSyncStatus();
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const getStatusColor = (): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (isOffline) return 'error';
    if (syncStatus.conflicts.length > 0) return 'warning';
    if (syncStatus.queueStatus.pendingCount > 0) return 'info';
    if (syncStatus.isSyncing) return 'primary';
    return 'success';
  };

  const getStatusIcon = () => {
    if (isOffline) return <WifiOff />;
    if (syncStatus.conflicts.length > 0) return <SyncProblem />;
    if (syncStatus.isSyncing || refreshing) return <CircularProgress size={16} />;
    if (syncStatus.queueStatus.pendingCount > 0) return <CloudOff />;
    return <CloudDone />;
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline';
    if (syncStatus.conflicts.length > 0) return `${syncStatus.conflicts.length} Conflicts`;
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.queueStatus.pendingCount > 0) return `${syncStatus.queueStatus.pendingCount} Pending`;
    return 'Synced';
  };

  const getTooltipText = () => {
    if (isOffline) return 'You are offline. Changes will be saved locally and synced when online.';
    if (syncStatus.conflicts.length > 0) return 'There are sync conflicts that need resolution.';
    if (syncStatus.isSyncing) return 'Syncing data with server...';
    if (syncStatus.queueStatus.pendingCount > 0) return 'Some changes are waiting to be synced.';
    return 'All data is synced with server.';
  };

  if (compact) {
    return (
      <Tooltip title={getTooltipText()}>
        <IconButton
          size="small"
          color={getStatusColor()}
          onClick={() => showDetails && setDetailsOpen(true)}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          variant="outlined"
          size="small"
          onClick={() => showDetails && setDetailsOpen(true)}
          clickable={showDetails}
        />
      </Tooltip>

      {showDetails && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              {getStatusIcon()}
              Sync Status
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Network Status */}
              <Alert 
                severity={isOnline ? 'success' : 'warning'}
                icon={isOnline ? <Wifi /> : <WifiOff />}
              >
                <Typography variant="body2">
                  {isOnline ? 'Connected to internet' : 'No internet connection'}
                </Typography>
              </Alert>

              {/* Sync Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Synchronization
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      {syncStatus.isSyncing ? <Sync className="rotating" /> : <CloudDone />}
                    </ListItemIcon>
                    <ListItemText
                      primary={syncStatus.isSyncing ? 'Syncing in progress' : 'Sync idle'}
                      secondary={syncStatus.lastSyncTime ? 
                        `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleString()}` : 
                        'Never synced'
                      }
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${syncStatus.queueStatus.pendingCount} operations pending`}
                      secondary={syncStatus.queueStatus.isProcessing ? 'Processing queue...' : 'Queue idle'}
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Conflicts */}
              {syncStatus.conflicts.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Sync Conflicts ({syncStatus.conflicts.length})
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      These items have conflicting changes. Choose which version to keep:
                    </Typography>
                    
                    <List dense>
                      {syncStatus.conflicts.map((conflict) => (
                        <ListItem key={conflict.todoId}>
                          <ListItemText
                            primary={conflict.localVersion.title}
                            secondary={`Conflicts in: ${conflict.conflictFields.join(', ')}`}
                          />
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleResolveConflict(conflict.todoId, 'local')}
                            >
                              Keep Local
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleResolveConflict(conflict.todoId, 'remote')}
                            >
                              Keep Remote
                            </Button>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}

              {/* Manual Sync */}
              {isOnline && (
                <>
                  <Divider />
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                      onClick={handleManualSync}
                      disabled={refreshing || syncStatus.isSyncing}
                    >
                      {refreshing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Force synchronization with server
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      <style>{`
        .rotating {
          animation: rotate 2s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default OfflineIndicator;