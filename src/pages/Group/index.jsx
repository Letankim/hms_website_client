import React, { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Button,
  Pagination,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Search as SearchIcon, CalendarToday } from "@mui/icons-material";
import apiGroupService from "services/apiGroupService";
import DOMPurify from "dompurify";
import "./index.css";
import { useNavigate } from "react-router-dom";

const GroupPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [joinedGroups, setJoinedGroups] = useState(new Set());

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        ValidPageSize: pageSize,
        SearchTerm: search,
        Status: "active",
        StartDate: startDate,
        EndDate: endDate,
      };
      const res = await apiGroupService.getAllActiveGroups(params);
      const data = res.data || res;
      setGroups(data.groups || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (e) {
      setGroups([]);
      setSnackbar({
        open: true,
        message: e?.message || "Failed to fetch groups.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate]);

  const handleSearchChange = debounce((value) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleJoinGroup = async (groupId, isJoined) => {
    try {
      // Replace with actual API calls
      if (isJoined) {
        // await apiGroupService.leaveGroup(groupId);
        setJoinedGroups((prev) => {
          const newSet = new Set(prev);
          newSet.delete(groupId);
          return newSet;
        });
        setSnackbar({
          open: true,
          message: "Left group successfully!",
          severity: "info",
        });
      } else {
        // await apiGroupService.joinGroup(groupId);
        setJoinedGroups((prev) => new Set(prev).add(groupId));
        setSnackbar({
          open: true,
          message: "Joined group successfully!",
          severity: "success",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message:
          e?.message || `Failed to ${isJoined ? "leave" : "join"} group.`,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <Box className="group-page-container">
      <Box className="group-page-header">
        <Typography variant="h4" color="#1877f2" fontWeight={800}>
          Health & Fitness Groups
        </Typography>
        <Box className="group-page-controls">
          <TextField
            placeholder="Search groups..."
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
            sx={{ minWidth: { xs: "100%", sm: 200 } }}
          />
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
            inputProps={{ max: endDate || undefined }}
            label="Start Date"
            variant="outlined"
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          />
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
            inputProps={{ min: startDate || undefined }}
            label="End Date"
            variant="outlined"
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          />
        </Box>
      </Box>
      {loading ? (
        <Box className="group-loading">
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Typography className="group-empty" color="#888">
          No groups found.
        </Typography>
      ) : (
        <Box className="group-list">
          {groups.map((group) => (
            <Box className="group-card" key={group.groupId}>
              <Box className="group-thumbnail">
                <img src={group.thumbnail} alt={group.groupName} />
              </Box>
              <Box className="group-info">
                <Typography className="group-title" variant="h6">
                  {group.groupName}
                </Typography>
                <Typography
                  className="group-description"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(group.description),
                  }}
                />
                <Box
                  className="group-meta"
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  {group.isPrivate ? (
                    <Typography
                      className="group-status private"
                      variant="caption"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "#f44336",
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          marginRight: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="#f44336"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H8V9zm10 9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5z" />
                        </svg>
                      </span>
                      Private Group
                    </Typography>
                  ) : (
                    <Typography
                      className="group-status public"
                      variant="caption"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "#43b72a",
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          marginRight: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          fill="#43b72a"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9l11.21 11.21C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 4.69C8.45 3.63 10.15 3 12 3c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
                        </svg>
                      </span>
                      Public Group
                    </Typography>
                  )}
                  <Typography className="group-date" variant="caption">
                    Created: {new Date(group.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={
                        group.creator?.avatar ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(group.creator?.fullName || "Admin")
                      }
                      alt={group.creator?.fullName || "Admin"}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #1877f2",
                        background: "#fff",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "#1877f2",
                          lineHeight: 1,
                        }}
                      >
                        {group.creator?.fullName || "Admin"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#888", lineHeight: 1 }}
                      >
                        {group.creator?.email || ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      ml: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="#43b72a"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.46 17 16V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    <Typography
                      variant="body2"
                      sx={{ color: "#43b72a", fontWeight: 700 }}
                    >
                      {group.memberCount || 0} members
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mt: 2,
                  ml: "auto",
                }}
              >
                {group.isRequested ? (
                  <Button
                    className="group-join-btn"
                    variant="outlined"
                    color="warning"
                    disabled
                  >
                    Request Pending...
                  </Button>
                ) : group.isJoin ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "#43b72a", fontWeight: 700, ml: 1 }}
                  >
                    Joined • Your Group
                  </Typography>
                ) : (
                  <Button
                    className="group-join-btn"
                    variant="contained"
                    color="primary"
                    onClick={() => handleJoinGroup(group.groupId, false)}
                  >
                    Join Group
                  </Button>
                )}
                <Button
                  className="group-view-btn"
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/groups/${group.groupId}`)}
                >
                  View Group
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Box className="group-pagination">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          sx={{ mx: "auto" }}
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

export default GroupPage;
