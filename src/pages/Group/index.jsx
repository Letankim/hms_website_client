import styles from "./index.module.css";
import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  Stack,
  InputAdornment,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarToday,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiGroupService from "services/apiGroupService";
import apiGroupMemberService from "services/apiGroupMemberService";
import {
  showErrorFetchAPI,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const GroupPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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
  const [pendingActions, setPendingActions] = useState(new Set());
  const [view, setView] = useState("all");

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
        Status: view === "all" ? "active" : undefined,
        StartDate: startDate,
        EndDate: endDate,
      };
      let res;
      if (view === "joined") {
        res = await apiGroupService.getMyJoinedGroups(0, params);
      } else {
        res = await apiGroupService.getAllActiveGroups(params);
      }
      const data = res.data || res;
      setGroups(data.groups || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      const joined = new Set(
        data.groups?.filter((g) => g.isJoin).map((g) => g.groupId) || []
      );
      setJoinedGroups(joined);
    } catch (e) {
      setGroups([]);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, startDate, endDate, view]);

  const handleSearchChange = debounce((value) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleJoinGroup = async (groupId, isJoined) => {
    if (!user) {
      showInfoMessage("Please log in to join groups.");
      return;
    }

    setPendingActions((prev) => new Set(prev).add(groupId));
    try {
      if (isJoined) {
        await apiGroupMemberService.leaveGroup(groupId);
        setJoinedGroups((prev) => {
          const newSet = new Set(prev);
          newSet.delete(groupId);
          return newSet;
        });
        showSuccessMessage("Left group successfully!");
      } else {
        await apiGroupMemberService.joinGroup(groupId);
        setJoinedGroups((prev) => new Set(prev).add(groupId));
        showSuccessMessage("Joined group successfully!");
      }
      await fetchGroups();
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setPendingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      setPage(1);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <Box
      className={styles["group-page-container"]}
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
      }}
    >
      <Box sx={{ mx: "auto", pt: "100px" }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <GroupIcon sx={{ fontSize: 40, color: "var(--secondary-color)" }} />
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
              Health & Fitness Groups
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            Join communities to share your fitness journey and stay motivated
          </Typography>
        </Box>

        {/* View Toggle Section */}
        <div className={styles["toggle-container"]}>
          <div className={styles["toggle-group"]}>
            <button
              className={`${styles["toggle-button"]} ${
                view === "all" ? styles["selected"] : ""
              }`}
              onClick={(e) => handleViewChange(e, "all")}
            >
              <span className={styles["button-text"]}>All Groups</span>
              <div className={styles["button-bg"]}></div>
            </button>
            {user && (
              <button
                className={`${styles["toggle-button"]} ${
                  view === "joined" ? styles["selected"] : ""
                }`}
                onClick={(e) => handleViewChange(e, "joined")}
              >
                <span className={styles["button-text"]}>My Joined Groups</span>
                <div className={styles["button-bg"]}></div>
              </button>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <Box
          className={styles["group-page-controls"]}
          sx={{
            mb: 4,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <TextField
            placeholder="Search groups..."
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
              minWidth: { xs: "100%", sm: 200 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "var(--background-white)",
                "&:hover fieldset": { borderColor: "var(--accent-info)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent-info)" },
              },
            }}
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
                  <CalendarToday sx={{ color: "var(--accent-info)" }} />
                </InputAdornment>
              ),
            }}
            inputProps={{ max: endDate || undefined }}
            label="Start Date"
            variant="outlined"
            sx={{
              minWidth: { xs: "100%", sm: 150 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "var(--background-white)",
                "&:hover fieldset": { borderColor: "var(--accent-info)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent-info)" },
              },
            }}
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
                  <CalendarToday sx={{ color: "var(--accent-info)" }} />
                </InputAdornment>
              ),
            }}
            inputProps={{ min: startDate || undefined }}
            label="End Date"
            variant="outlined"
            sx={{
              minWidth: { xs: "100%", sm: 150 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "var(--background-white)",
                "&:hover fieldset": { borderColor: "var(--accent-info)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent-info)" },
              },
            }}
          />
        </Box>

        {/* Group List */}
        {loading ? (
          <Box
            className={styles["group-loading"]}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : groups.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "var(--background-white)",
              boxShadow: "0 4px 12px var(--shadow-color)",
            }}
          >
            <GroupIcon
              sx={{ fontSize: 80, color: "var(--text-secondary)", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ mb: 1, color: "var(--text-secondary)" }}
            >
              No groups found
            </Typography>
            <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
              Try adjusting your search or date filters
            </Typography>
          </Box>
        ) : (
          <Box className={styles["group-list"]} sx={{ mb: 4 }}>
            {groups.map((group) => (
              <Box
                className={styles["group-card"]}
                key={group.groupId}
                sx={{
                  bgcolor: "var(--background-white)",
                  borderRadius: 3,
                  border: "1px solid var(--border-light)",
                  boxShadow: "0 4px 12px var(--shadow-color)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px var(--shadow-hover)",
                  },
                }}
              >
                <Box className={styles["group-thumbnail"]}>
                  <img
                    src={
                      group.thumbnail ||
                      "https://via.placeholder.com/300x120?text=No+Thumbnail"
                    }
                    alt={group.groupName}
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: "8px 8px 0 0",
                      objectFit: "cover",
                      border: "2px solid var(--accent-info)",
                    }}
                  />
                </Box>
                <Box className={styles["group-info"]} sx={{ p: 2, flex: 1 }}>
                  <Typography
                    className={styles["group-title"]}
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "var(--secondary-color)",
                      mb: 1,
                    }}
                  >
                    {group.groupName}
                  </Typography>
                  <Typography
                    className={styles["group-description"]}
                    sx={{
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(group.description),
                    }}
                  />
                  <Box
                    className={styles["group-meta"]}
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    {group.isPrivate ? (
                      <Typography
                        className={
                          styles["group-status"] + " " + styles["private"]
                        }
                        variant="caption"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "var(--accent-error)",
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
                            fill="var(--accent-error)"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H8V9zm10 9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5z" />
                          </svg>
                        </span>
                        Private Group
                      </Typography>
                    ) : (
                      <Typography
                        className={
                          styles["group-status"] + " " + styles["public"]
                        }
                        variant="caption"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "var(--accent-success)",
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
                            fill="var(--accent-success)"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9l11.21 11.21C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 4.69C8.45 3.63 10.15 3 12 3c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
                          </svg>
                        </span>
                        Public Group
                      </Typography>
                    )}
                    <Typography
                      className={styles["group-date"]}
                      variant="caption"
                      sx={{ color: "var(--text-secondary)" }}
                    >
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <img
                      src={group.creator?.avatar || `/placeholder-avatar.jpg`}
                      alt={group.creator?.fullName || "Admin"}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--accent-info)",
                        background: "var(--background-white)",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "var(--accent-info)",
                          lineHeight: 1,
                        }}
                      >
                        {group.creator?.fullName || "Admin"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--text-secondary)", lineHeight: 1 }}
                      >
                        {group.creator?.email || ""}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        ml: 3,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="var(--accent-success)"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.46 17 16V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                      </svg>
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--accent-success)", fontWeight: 700 }}
                      >
                        {group.memberCount || 0}
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
                    px: 2,
                    pb: 2,
                  }}
                >
                  {pendingActions.has(group.groupId) ? (
                    <Button
                      className={styles["group-join-btn"]}
                      variant="outlined"
                      disabled
                      sx={{
                        borderRadius: 3,
                        borderColor: "#ff9800",
                        color: "#ff9800",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      {joinedGroups.has(group.groupId)
                        ? "Leaving..."
                        : "Joining..."}
                    </Button>
                  ) : group.isRequested ? (
                    <Button
                      className={styles["group-join-btn"]}
                      variant="outlined"
                      color="warning"
                      disabled
                      sx={{
                        borderRadius: 3,
                        borderColor: "#ff9800",
                        color: "#ff9800",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      Request Pending...
                    </Button>
                  ) : group.isJoin ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--accent-success)", fontWeight: 700 }}
                      >
                        Joined
                      </Typography>
                      <Button
                        className={styles["group-leave-btn"]}
                        variant="outlined"
                        color="error"
                        onClick={() => handleJoinGroup(group.groupId, true)}
                        sx={{
                          borderRadius: 3,
                          borderColor: "var(--accent-error)",
                          color: "var(--accent-error)",
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "var(--accent-error)",
                            bgcolor: "rgba(211, 47, 47, 0.04)",
                          },
                        }}
                      >
                        Leave Group
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      className={styles["group-join-btn"]}
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinGroup(group.groupId, false)}
                      sx={{
                        borderRadius: 3,
                        bgcolor: "var(--primary-color)",
                        color: "var(--text-white)",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": { bgcolor: "var(--primary-hover)" },
                      }}
                    >
                      Join Group
                    </Button>
                  )}
                  <Button
                    className={styles["group-view-btn"]}
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/groups/${group.groupId}`)}
                    sx={{
                      borderRadius: 3,
                      borderColor: "var(--accent-info)",
                      color: "var(--accent-info)",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "var(--primary-hover)",
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    View Group
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            className={styles["group-pagination"]}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 4,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "var(--accent-info)",
                  borderRadius: 8,
                  margin: "0 4px",
                  "&.Mui-selected": {
                    bgcolor: "var(--accent-info)",
                    color: "var(--text-white)",
                    "&:hover": { bgcolor: "var(--primary-hover)" },
                  },
                  "&:hover": { bgcolor: "var(--background-light)" },
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} groups
            </Typography>
          </Box>
        )}
      </Box>

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
              snackbar.severity === "error"
                ? "var(--accent-error)"
                : snackbar.severity === "success"
                ? "var(--accent-success)"
                : "#ff9800",
            color: "var(--text-white)",
          }}
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
