import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Box,
  Typography,
  Pagination,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import apiNotificationService from "services/apiNotificationService";
import "./index.css";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDescending, setSortDescending] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedIds, setSelectedIds] = useState([]); // Track selected notifications
  const user = JSON.parse(localStorage.getItem("user"));

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const params = {
        Search: search,
        SortBy: sortBy,
        SortDescending: sortDescending,
        PageNumber: page,
        PageSize: pageSize,
        ValidPageSize: pageSize,
      };
      const res = await apiNotificationService.getNotificationsByUserId(
        user.userId,
        params,
        true
      );
      const data = res.data || res;
      setNotifications(data.notifications || []);
      setTotalCount(data.totalCount || 0);
      setSelectedIds([]); // Clear selections on new fetch
    } catch (e) {
      setNotifications([]);
      setSnackbar({
        open: true,
        message: e?.message || "Failed to fetch notifications.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.userId, page, pageSize, search, sortBy, sortDescending]);

  const handleSearchChange = debounce((value) => {
    setSearch(value);
    setPage(1);
  }, 500);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id, isRead) => {
    try {
      const action = isRead
        ? apiNotificationService.markNotificationsUnread
        : apiNotificationService.markNotificationsRead;
      await action({
        notificationIds: [id],
        isRead: !isRead,
      });
      setSnackbar({
        open: true,
        message: `Marked as ${isRead ? "unread" : "read"}!`,
        severity: isRead ? "info" : "success",
      });
      fetchNotifications();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Action failed.",
        severity: "error",
      });
    }
  };

  const handleMarkSelected = async (markAsRead) => {
    if (selectedIds.length === 0) {
      setSnackbar({
        open: true,
        message: "No notifications selected.",
        severity: "warning",
      });
      return;
    }
    try {
      const action = markAsRead
        ? apiNotificationService.markNotificationsRead
        : apiNotificationService.markNotificationsUnread;
      await action({
        notificationIds: selectedIds,
        isRead: markAsRead,
      });
      setSnackbar({
        open: true,
        message: `Selected notifications marked as ${
          markAsRead ? "read" : "unread"
        }!`,
        severity: markAsRead ? "success" : "info",
      });
      fetchNotifications();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to update selected notifications.",
        severity: "error",
      });
    }
  };

  const handleMarkAll = async (markAsRead) => {
    try {
      const allIds = notifications.map((n) => n.notificationId);
      const action = markAsRead
        ? apiNotificationService.markNotificationsRead
        : apiNotificationService.markNotificationsUnread;
      await action({
        notificationIds: allIds,
        isRead: markAsRead,
      });
      setSnackbar({
        open: true,
        message: `All notifications marked as ${
          markAsRead ? "read" : "unread"
        }!`,
        severity: markAsRead ? "success" : "info",
      });
      fetchNotifications();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to update all notifications.",
        severity: "error",
      });
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.notificationId));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Box className="notification-modern-container">
      <Box className="notification-modern-header">
        <Typography variant="h4" color="#F47C54" fontWeight={800}>
          Notifications
        </Typography>
        <Box className="notification-modern-controls">
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="createdAt">Newest</MenuItem>
            <MenuItem value="notificationType">Type</MenuItem>
            <MenuItem value="message">Message</MenuItem>
          </Select>
          <IconButton
            onClick={() => {
              setSortDescending((d) => !d);
              setPage(1);
            }}
            sx={{
              width: "55px",
              bgcolor: "#f7f7f7",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            {sortDescending ? "↓" : "↑"}
          </IconButton>
        </Box>
      </Box>
      <Box className="notification-modern-actions">
        <FormControlLabel
          control={
            <Checkbox
              checked={
                selectedIds.length === notifications.length &&
                notifications.length > 0
              }
              onChange={handleSelectAll}
              color="primary"
            />
          }
          label="Select All"
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleMarkSelected(true)}
          disabled={selectedIds.length === 0}
          sx={{ mr: 1 }}
        >
          Mark Selected as Read
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleMarkSelected(false)}
          disabled={selectedIds.length === 0}
          sx={{ mr: 1 }}
        >
          Mark Selected as Unread
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleMarkAll(true)}
          disabled={notifications.length === 0}
        >
          Mark All as Read
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => handleMarkAll(false)}
          disabled={notifications.length === 0}
          sx={{ ml: 1 }}
        >
          Mark All as Unread
        </Button>
      </Box>
      {loading ? (
        <Box className="notification-modern-loading">
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography className="notification-modern-empty" color="#888">
          No notifications found.
        </Typography>
      ) : (
        <Box className="notification-modern-list">
          {notifications.map((n) => (
            <Box
              key={n.notificationId}
              className={`notification-modern-card ${
                n.isRead ? "read" : "unread"
              }`}
            >
              <Checkbox
                checked={selectedIds.includes(n.notificationId)}
                onChange={() => handleSelectNotification(n.notificationId)}
                color="primary"
              />
              <Box className="notification-modern-avatar">
                <img src={n.userAvatar} alt="avatar" />
              </Box>
              <Box className="notification-modern-content">
                <Typography
                  className="notification-modern-type"
                  variant="subtitle1"
                >
                  {n.notificationType}
                </Typography>
                <Typography
                  className="notification-modern-date"
                  variant="caption"
                >
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
                <Typography
                  className="notification-modern-message"
                  dangerouslySetInnerHTML={{ __html: n.message }}
                />
              </Box>
              <IconButton
                className="notification-modern-action"
                title={n.isRead ? "Mark as unread" : "Mark as read"}
                onClick={() => handleMarkRead(n.notificationId, n.isRead)}
                sx={{ color: "#F47C54" }}
              >
                {n.isRead ? <RadioButtonUnchecked /> : <CheckCircle />}
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      <Box className="notification-modern-pagination">
        <Select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          size="small"
        >
          <MenuItem value={10}>10 per page</MenuItem>
          <MenuItem value={20}>20 per page</MenuItem>
          <MenuItem value={50}>50 per page</MenuItem>
        </Select>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          sx={{ mx: 2 }}
        />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationPage;
