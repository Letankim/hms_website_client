import styles from "./index.module.css";
import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Pagination,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import apiNotificationService from "services/apiNotificationService";
import AuthContext from "contexts/AuthContext";
import {
  showErrorFetchAPI,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
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
  const [selectedIds, setSelectedIds] = useState([]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) {
      showInfoMessage("Please login to view notifications.");
      return;
    }
    setLoading(true);
    try {
      const params = {
        Search: search,
        SortBy: sortBy,
        SortDescending: sortDescending,
        PageNumber: page,
        PageSize: pageSize,
      };
      const res = await apiNotificationService.getNotificationsByUserId(
        user.userId,
        params,
        true
      );
      const data = res.data || res;
      setNotifications(data.notifications || []);
      setTotalCount(data.totalCount || 0);
      setSelectedIds([]);
    } catch (e) {
      setNotifications([]);
      showErrorFetchAPI(e);
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
      await action({ notificationIds: [id], isRead: !isRead });
      if (isRead) {
        showInfoMessage(`Marked as ${isRead ? "unread" : "read"}!`);
      } else {
        showSuccessMessage(`Marked as ${isRead ? "unread" : "read"}!`);
      }
      fetchNotifications();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleMarkSelected = async (markAsRead) => {
    if (selectedIds.length === 0) {
      showInfoMessage("No notifications selected.");
      return;
    }
    try {
      const action = markAsRead
        ? apiNotificationService.markNotificationsRead
        : apiNotificationService.markNotificationsUnread;
      await action({ notificationIds: selectedIds, isRead: markAsRead });
      if (markAsRead) {
        showSuccessMessage(
          `Selected notifications marked as ${markAsRead ? "read" : "unread"}!`
        );
      } else {
        showInfoMessage(
          `Selected notifications marked as ${markAsRead ? "read" : "unread"}!`
        );
      }
      fetchNotifications();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleMarkAll = async (markAsRead) => {
    if (notifications.length === 0) {
      showInfoMessage("No notifications to update.");
      return;
    }
    try {
      const allIds = notifications.map((n) => n.notificationId);
      const action = markAsRead
        ? apiNotificationService.markNotificationsRead
        : apiNotificationService.markNotificationsUnread;
      await action({ notificationIds: allIds, isRead: markAsRead });
      if (markAsRead) {
        showSuccessMessage(
          `All notifications marked as ${markAsRead ? "read" : "unread"}!`
        );
      } else {
        showInfoMessage(
          `All notifications marked as ${markAsRead ? "read" : "unread"}!`
        );
      }
      fetchNotifications();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === notifications.length
        ? []
        : notifications.map((n) => n.notificationId)
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Box
      className={styles["notification-page-container"]}
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6, pt: "100px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <NotificationsIcon
              sx={{ fontSize: 40, color: "var(--secondary-color)" }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background:
                  "linear-gradient(45deg, var(--secondary-color), var(--primary-color))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Notifications
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{
              color: "var(--text-secondary)",
              maxWidth: 600,
              mx: "auto",
              fontSize: {
                xs: "1rem",
                sm: "inherit",
              },
            }}
          >
            Stay updated with your latest notifications
          </Typography>
        </Box>

        {/* Filter Section */}
        <Box className={styles["notification-page-controls"]} sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              p: 2,
              bgcolor: "var(--background-white)",
              boxShadow: "0 2px 10px var(--shadow-color)",
              borderRadius: 2,
              alignItems: {
                xs: "unset",
                sm: "center",
              },
            }}
          >
            <TextField
              placeholder="Search notifications..."
              size="small"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "var(--accent-info)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 200,
                height: "100%",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "var(--background-white)",
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "var(--accent-info)" },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--accent-info)",
                  },
                },
              }}
            />
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{
                minWidth: 120,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "var(--background-white)",
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "var(--accent-info)" },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--accent-info)",
                  },
                },
              }}
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
                width: 55,
                bgcolor: "var(--background-light)",
                color: "var(--accent-info)",
                "&:hover": { bgcolor: "var(--background-white)" },
              }}
            >
              {sortDescending ? "↓" : "↑"}
            </IconButton>
          </Stack>
        </Box>

        {/* Actions Section */}
        <Box className={styles["notification-page-actions"]} sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              p: 2,
              bgcolor: "var(--background-white)",
              boxShadow: "0 2px 10px var(--shadow-color)",
              borderRadius: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    selectedIds.length === notifications.length &&
                    notifications.length > 0
                  }
                  onChange={handleSelectAll}
                  sx={{ color: "var(--accent-info)" }}
                />
              }
              label="Select All"
              sx={{ color: "var(--text-primary)" }}
            />
            <Button
              variant="outlined"
              onClick={() => handleMarkSelected(true)}
              disabled={selectedIds.length === 0}
              sx={{
                fontWeight: "bold",
                borderRadius: 1,
                borderWidth: 2,
                color: "var(--accent-info)",
                borderColor: "var(--accent-info)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "var(--background-light)",
                },
              }}
            >
              Mark Selected as Read
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleMarkSelected(false)}
              disabled={selectedIds.length === 0}
              sx={{
                fontWeight: "bold",
                borderRadius: 1,
                borderWidth: 2,
                color: "var(--accent-info)",
                borderColor: "var(--accent-info)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "var(--background-light)",
                },
              }}
            >
              Mark Selected as Unread
            </Button>
            <Button
              variant="contained"
              onClick={() => handleMarkAll(true)}
              disabled={notifications.length === 0}
              sx={{
                fontWeight: "bold",
                bgcolor: "var(--accent-success)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
                borderRadius: 1,
              }}
            >
              Mark All as Read
            </Button>
            <Button
              variant="contained"
              onClick={() => handleMarkAll(false)}
              disabled={notifications.length === 0}
              sx={{
                fontWeight: "bold",
                bgcolor: "var(--accent-info)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
                borderRadius: 1,
              }}
            >
              Mark All as Unread
            </Button>
          </Stack>
        </Box>

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "var(--accent-info)" }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "var(--background-white)",
              boxShadow: "0 4px 12px var(--shadow-color)",
            }}
          >
            <NotificationsIcon
              sx={{ fontSize: 80, color: "var(--text-secondary)", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ mb: 1, color: "var(--text-secondary)" }}
            >
              No notifications found
            </Typography>
            <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
              Try adjusting your search or check back later
            </Typography>
          </Box>
        ) : (
          <Box className={styles["notification-page-list"]}>
            {notifications.map((notification) => (
              <Box
                key={notification.notificationId}
                className={`notification-page-card ${
                  notification.isRead ? "read" : "unread"
                }`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  mb: 2,
                  bgcolor: notification.isRead
                    ? "var(--background-white)"
                    : "var(--background-light)",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px var(--shadow-color)",
                  borderLeft: notification.isRead
                    ? "none"
                    : `4px solid var(--accent-info)`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px var(--shadow-hover)",
                  },
                }}
              >
                <Checkbox
                  checked={selectedIds.includes(notification.notificationId)}
                  onChange={() =>
                    handleSelectNotification(notification.notificationId)
                  }
                  sx={{ color: "var(--accent-info)" }}
                />
                <Box
                  className={styles["notification-page-avatar"]}
                  sx={{ mr: 2 }}
                >
                  <Avatar
                    src={notification.userAvatar || "/placeholder-avatar.jpg"}
                    alt="User Avatar"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "var(--accent-info)",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    className={styles["notification-page-type"]}
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "var(--text-primary)" }}
                  >
                    {notification.notificationType}
                  </Typography>
                  <Typography
                    className={styles["notification-page-date"]}
                    variant="caption"
                    sx={{ color: "var(--text-secondary)", mb: 1 }}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                  <Typography
                    className={styles["notification-page-message"]}
                    sx={{ color: "var(--text-primary)" }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(notification.message),
                    }}
                  />
                </Box>
                <IconButton
                  className={styles["notification-page-action"]}
                  title={
                    notification.isRead ? "Mark as unread" : "Mark as read"
                  }
                  onClick={() =>
                    handleMarkRead(
                      notification.notificationId,
                      notification.isRead
                    )
                  }
                  sx={{
                    color: notification.isRead
                      ? "var(--accent-info)"
                      : "var(--accent-success)",
                  }}
                >
                  {notification.isRead ? (
                    <RadioButtonUnchecked />
                  ) : (
                    <CheckCircle />
                  )}
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box className={styles["notification-page-pagination"]}>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              size="small"
              sx={{
                minWidth: 120,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "var(--background-white)",
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "var(--accent-info)" },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--accent-info)",
                  },
                },
              }}
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
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 20,
                  fontWeight: 600,
                  color: "var(--accent-info)",
                  "&:hover": {
                    bgcolor: "var(--background-light)",
                    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                  },
                  "&.Mui-selected": {
                    bgcolor: "var(--accent-info)",
                    color: "var(--text-white)",
                    "&:hover": { bgcolor: "var(--primary-hover)" },
                  },
                  "&.MuiPaginationItem-ellipsis": {
                    color: "var(--text-secondary)",
                  },
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
              notifications
            </Typography>
          </Box>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              bgcolor:
                snackbar.severity === "success"
                  ? "var(--accent-success)"
                  : snackbar.severity === "error"
                  ? "var(--accent-error)"
                  : snackbar.severity === "info"
                  ? "var(--accent-info)"
                  : "#ff9800", // Warning color
              color: "var(--text-white)",
              elevation: 6,
              variant: "filled",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default NotificationPage;
