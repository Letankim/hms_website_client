import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import useTheme from '@mui/material/styles/useTheme';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import {
  Gift,
  MessageText1,
  Notification,
  Setting2,
  ArrowLeft,
  Trash,
  CopySuccess,
  CloseCircle,
  NotificationBing,
  Refresh
} from 'iconsax-react';
import AuthContext from 'contexts/AuthContext';
import apiNotificationService from 'services/apiNotificationService';
import DOMPurify from 'dompurify';

export default function AllNotificationsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchNotifications = async () => {
    if (!user || !user.userId) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await apiNotificationService.getNotificationsByUserId(user.userId, true);
      setNotifications(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setSnackbar({ open: true, message: 'Notifications fetched successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to fetch notifications.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, navigate]);

  const getIcon = (notificationType) => {
    switch (notificationType?.toLowerCase()) {
      case 'birthday':
        return <Gift size={20} variant="Bold" />;
      case 'comment':
        return <MessageText1 size={20} variant="Bold" />;
      case 'profile_update':
        return <Setting2 size={20} variant="Bold" />;
      default:
        return <Notification size={20} variant="Bold" />;
    }
  };

  const getStatusChipProps = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.text.white,
          border: `1px solid ${theme.palette.success.dark}`
        };
      case 'pending':
        return {
          bgcolor: theme.palette.warning.lighter,
          color: theme.palette.warning.main,
          border: `1px solid ${theme.palette.warning.main}`
        };
      case 'inactive':
        return {
          bgcolor: theme.palette.error.lighter,
          color: theme.palette.error.main,
          border: `1px solid ${theme.palette.error.main}`
        };
      default:
        return {
          bgcolor: theme.palette.secondary[200],
          color: theme.palette.secondary[500],
          border: `1px solid ${theme.palette.secondary[500]}`
        };
    }
  };

  const handleToggleReadStatus = async (notificationId, isRead) => {
    setActionLoading(true);
    try {
      const updateDto = { notificationIds: [notificationId], isRead: !isRead };
      if (isRead) {
        await apiNotificationService.markNotificationsUnread(updateDto);
        setSnackbar({ open: true, message: 'Notification marked as unread.', severity: 'success' });
      } else {
        await apiNotificationService.updateNotificationReadStatus(updateDto);
        setSnackbar({ open: true, message: 'Notification marked as read.', severity: 'success' });
      }
      setNotifications((prev) => prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: !isRead } : n)));
    } catch (error) {
      console.error(`Error marking notification as ${isRead ? 'unread' : 'read'}:`, error.message);
      setSnackbar({
        open: true,
        message: error.message || `Failed to mark notification as ${isRead ? 'unread' : 'read'}.`,
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    setActionLoading(true);
    try {
      await apiNotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
      setSnackbar({ open: true, message: 'Notification deleted successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to delete notification.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await apiNotificationService.markAllNotificationsRead(user.userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setSnackbar({ open: true, message: 'All notifications marked as read.', severity: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to mark all notifications as read.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllUnread = async () => {
    setActionLoading(true);
    try {
      await apiNotificationService.markAllNotificationsUnread(user.userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })));
      setSnackbar({ open: true, message: 'All notifications marked as unread.', severity: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as unread:', error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to mark all notifications as unread.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setActionLoading(true);
    try {
      await apiNotificationService.deleteNotificationsByUser(user.userId);
      setNotifications([]);
      setSnackbar({ open: true, message: 'All notifications deleted successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error deleting all notifications:', error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to delete all notifications.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    setActionLoading(true);
    await fetchNotifications();
    setActionLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.secondary.lighter, minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '16px',
            background: theme.palette.background.main,
            boxShadow: theme.customShadows.z2
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationBing color="#fff" fontWeight="bold" />
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.white, mb: 0.5 }}>
                  All Notifications
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.white, maxWidth: '600px' }}>
                View and manage all your notifications
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowLeft />}
              disabled={actionLoading}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.2,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                bgcolor: theme.palette.common.white,
                color: theme.palette.text.dark,
                boxShadow: theme.customShadows.button,
                '&:hover': {
                  bgcolor: theme.palette.secondary.light,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Back'}
            </Button>
          </Box>
        </Paper>

        {/* Actions Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: '16px',
            boxShadow: theme.customShadows.z2,
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            mb: 4
          }}
        >
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.lighter,
                color: theme.palette.text.primary,
                borderRadius: '10px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.primary[200],
                  bgcolor: theme.palette.primary[100]
                },
                disabled: { borderColor: theme.palette.action.disabled }
              }}
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              startIcon={actionLoading && <CircularProgress size={20} color="inherit" />}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: theme.palette.warning.lighter,
                color: theme.palette.warning.main,
                borderRadius: '10px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.warning.light,
                  bgcolor: theme.palette.warning.lighter
                },
                disabled: { borderColor: theme.palette.action.disabled }
              }}
              onClick={handleMarkAllUnread}
              disabled={actionLoading}
              startIcon={actionLoading && <CircularProgress size={20} color="inherit" />}
            >
              Mark All Unread
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: theme.palette.error.lighter,
                color: theme.palette.error.main,
                borderRadius: '10px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.error.light,
                  bgcolor: theme.palette.error.lighter
                },
                disabled: { borderColor: theme.palette.action.disabled }
              }}
              onClick={handleDeleteAll}
              disabled={actionLoading}
              startIcon={actionLoading && <CircularProgress size={20} color="inherit" />}
            >
              Delete All
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: theme.palette.info.lighter,
                color: theme.palette.info.main,
                borderRadius: '10px',
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.info.light,
                  bgcolor: theme.palette.info.lighter
                },
                disabled: { borderColor: theme.palette.action.disabled }
              }}
              onClick={handleRefreshData}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
            >
              Refresh Data
            </Button>
          </Stack>
        </Paper>

        {/* Notifications List */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: '16px',
            boxShadow: theme.customShadows.z2,
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            mb: 10
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <Box key={notification.notificationId}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : theme.palette.secondary[200],
                      '&:hover': { bgcolor: theme.palette.secondary.light },
                      borderBottom: index < notifications.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar type={notification.isRead ? 'outlined' : 'filled'}>{getIcon(notification.notificationType)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: notification.isRead ? 400 : 600, color: theme.palette.text.primary }}
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(notification.message)
                            }}
                          />
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" component="span">
                            Type: {notification.notificationType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            | Created: {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={notification.status}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 600,
                                color: theme.palette.text.white,
                                textTransform: 'capitalize',
                                ...getStatusChipProps(notification.status),
                                ml: 1
                              }}
                            />
                            <Chip
                              label={notification.isRead ? 'Read' : 'Unread'}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 600,
                                bgcolor: notification.isRead ? theme.palette.secondary[200] : theme.palette.secondary[900],
                                color: notification.isRead ? theme.palette.secondary[500] : theme.palette.text.primary,
                                border: `1px solid ${notification.isRead ? theme.palette.secondary[500] : theme.palette.secondary[600]}`,
                                ml: 1
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={notification.isRead ? 'Mark Unread' : 'Mark Read'} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleReadStatus(notification.notificationId, notification.isRead)}
                          sx={{
                            color: notification.isRead ? theme.palette.warning.main : theme.palette.success.dark
                          }}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : notification.isRead ? (
                            <CloseCircle fontSize="small" />
                          ) : (
                            <CopySuccess fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Notification" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.notificationId)}
                          sx={{ color: theme.palette.error.main }}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <CircularProgress size={20} color="inherit" /> : <Trash fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: '10px',
            boxShadow: theme.customShadows.z2,
            '& .MuiAlert-icon': {
              color: theme.palette.common.white
            },
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
