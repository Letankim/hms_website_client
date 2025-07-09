import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
  Alert,
  Snackbar,
  TextField,
  Pagination,
  Stack,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { PersonAdd as RequestIcon } from "@mui/icons-material";
import DOMPurify from "dompurify";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiGroupService from "services/apiGroupService";
import apiGroupMemberService from "services/apiGroupMemberService";
import "./index.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  banned: "error",
};

const GroupJoinRequests = () => {
  const { user } = useContext(AuthContext);
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (["pending", "approved", "rejected", "banned"].includes(action)) {
      setStatusFilter(action);
    } else {
      setStatusFilter("pending");
    }
  }, [location.search]);

  const fetchGroup = async () => {
    if (!user) {
      showInfoMessage("Please login to view group details.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    try {
      const res = await apiGroupService.getMyGroupActiveById(groupId);
      if (res.statusCode === 200 && res.data) {
        setGroup(res.data);
      } else {
        showErrorMessage("Group not found.");
        setGroup(null);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setGroup(null);
    }
  };

  const fetchJoinRequests = async () => {
    if (!user) {
      showInfoMessage("Please login to view join requests.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        searchTerm: search,
      };
      const res = await apiGroupMemberService.getJoinRequestsByGroup(
        groupId,
        statusFilter,
        params
      );
      if (res.statusCode === 200 && res.data) {
        setRequests(res.data.requests || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        showErrorMessage(`No ${statusFilter} join requests found.`);
        setRequests([]);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (memberId, newStatus) => {
    setLoading(true);
    try {
      const res = await apiGroupMemberService.updateMemberStatus(memberId, {
        status: newStatus,
      });
      if (res.statusCode === 200) {
        showSuccessMessage(`Join request ${newStatus}.`);
        fetchJoinRequests();
      } else {
        showErrorMessage("Failed to update join request status.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = (request, newStatus) => {
    setSelectedRequest(request);
    setPendingStatus(newStatus);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedRequest && pendingStatus) {
      handleUpdateRequestStatus(selectedRequest.memberId, pendingStatus);
    }
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
    setPendingStatus(null);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
    setPendingStatus(null);
  };

  useEffect(() => {
    fetchGroup();
    fetchJoinRequests();
  }, [groupId, user, navigate, pageNumber, pageSize, search, statusFilter]);

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box
      className="group-join-requests-container"
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6, pt: "100px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <RequestIcon
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
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}{" "}
              Join Requests
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            Manage join requests for{" "}
            {group ? group.groupName : `Group #${groupId}`}
          </Typography>
        </Box>

        {/* Group Card */}
        {group && (
          <Box
            className="group-join-requests-card"
            sx={{
              bgcolor: "var(--background-white)",
              mb: 3,
              borderRadius: 2,
              border: "1px solid var(--border-light)",
              boxShadow: "0 2px 10px var(--shadow-color)",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="flex-start"
              >
                <Avatar
                  className="group-join-requests-avatar"
                  src={group.thumbnail || "/placeholder-group.jpg"}
                  alt={group.groupName}
                  sx={{ bgcolor: "var(--accent-info)", width: 56, height: 56 }}
                >
                  <RequestIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "var(--secondary-color)" }}
                    >
                      {group.groupName}
                    </Typography>
                    <Chip
                      label={group.isPrivate ? "Private" : "Public"}
                      size="small"
                      sx={{
                        bgcolor: group.isPrivate
                          ? "var(--accent-error)"
                          : "var(--accent-success)",
                        color: "var(--text-white)",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: "var(--text-primary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        group.description || "<i>No description provided.</i>"
                      ),
                    }}
                  />
                  <Box className="group-join-requests-meta">
                    <Chip
                      className="group-join-requests-status-chip"
                      label={
                        group.status.charAt(0).toUpperCase() +
                        group.status.slice(1)
                      }
                      color={statusColors[group.status] || "default"}
                      size="small"
                      sx={{
                        bgcolor:
                          statusColors[group.status] === "success"
                            ? "var(--accent-success)"
                            : "var(--accent-error)",
                        color: "var(--text-white)",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ ml: 1, color: "var(--text-secondary)" }}
                    >
                      Created:{" "}
                      {group.createdAt
                        ? new Date(group.createdAt).toLocaleString()
                        : ""}
                    </Typography>
                  </Box>
                  <Typography
                    className="group-join-requests-id"
                    sx={{ mt: 1, color: "var(--text-secondary)" }}
                  >
                    Group ID: #{group.groupId} | Members: {group.memberCount}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Filter Section */}
        <Box className="group-join-requests-filters" sx={{ mb: 4 }}>
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
            <TextField
              label="Search User Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                minWidth: 220,
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
            <TextField
              select
              label="Request Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
                navigate(
                  `/my-groups/${groupId}/requests?action=${e.target.value}`
                );
              }}
              size="small"
              SelectProps={{ native: true }}
              sx={{
                minWidth: 140,
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="banned">Banned</option>
            </TextField>
            <TextField
              select
              label="Requests per Page"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              size="small"
              SelectProps={{ native: true }}
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </TextField>
            <Button
              variant="contained"
              onClick={() => {
                setPageNumber(1);
                fetchJoinRequests();
              }}
              sx={{
                fontWeight: 700,
                px: 3,
                boxShadow: "0 2px 6px var(--shadow-color)",
                bgcolor: "var(--primary-color)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
                borderRadius: 2,
              }}
            >
              Search
            </Button>
          </Stack>
        </Box>

        {/* Requests Table */}
        {loading ? (
          <Box sx={{ py: 4 }}>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        ) : requests.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "var(--background-white)",
              boxShadow: "0 4px 12px var(--shadow-color)",
            }}
          >
            <RequestIcon
              sx={{ fontSize: 80, color: "var(--text-secondary)", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ mb: 1, color: "var(--text-secondary)" }}
            >
              No {statusFilter} join requests found
            </Typography>
            <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
              Try adjusting your search or status filters
            </Typography>
          </Box>
        ) : (
          <Box>
            <Table className="group-join-requests-table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    Avatar
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    Requested At
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.memberId}>
                    <TableCell>
                      <Avatar
                        src={request.avatar || "/placeholder-user.jpg"}
                        alt={request.userFullName}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "var(--accent-info)",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {request.userFullName || "Unknown"}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)
                        }
                        color={statusColors[request.status] || "default"}
                        size="small"
                        sx={{
                          bgcolor:
                            statusColors[request.status] === "success"
                              ? "var(--accent-success)"
                              : statusColors[request.status] === "warning"
                              ? "#ff9800"
                              : "var(--accent-error)",
                          color: "var(--text-white)",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {request.userId === group.createdBy ? (
                        <Typography
                          sx={{
                            fontStyle: "italic",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Owner
                        </Typography>
                      ) : (
                        <Select
                          value={request.status}
                          onChange={(e) =>
                            handleStatusChangeRequest(request, e.target.value)
                          }
                          size="small"
                          sx={{
                            minWidth: 120,
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "var(--background-white)",
                              borderRadius: 2,
                              "&:hover fieldset": {
                                borderColor: "var(--accent-info)",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "var(--accent-info)",
                              },
                            },
                          }}
                        >
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="removed">Remove</MenuItem>
                          <MenuItem value="banned">Ban</MenuItem>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mt: 3,
                  mb: 2,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={(e, value) =>
                    setPageNumber(Math.max(1, Math.min(value, totalPages)))
                  }
                  color="primary"
                  variant="outlined"
                  shape="rounded"
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
                <Typography
                  variant="body2"
                  sx={{ color: "var(--text-secondary)" }}
                >
                  Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                  {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                  requests
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Back Button */}
        <Button
          variant="contained"
          onClick={() => navigate("/my-groups")}
          sx={{
            mt: 3,
            fontWeight: "bold",
            borderRadius: 1,
            boxShadow: "0 2px 6px var(--shadow-color)",
            bgcolor: "var(--accent-error)",
            color: "var(--text-white)",
            "&:hover": { bgcolor: "var(--primary-hover)" },
          }}
        >
          Back to Groups
        </Button>

        {/* Confirm Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCloseConfirmDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, bgcolor: "var(--background-white)" },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, color: "var(--secondary-color)" }}
          >
            Confirm Status Change
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "var(--background-light)" }}>
            <Typography sx={{ color: "var(--text-primary)" }}>
              Are you sure you want to {pendingStatus} the join request for{" "}
              <strong>{selectedRequest?.userFullName || "Unknown"}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: "var(--background-light)" }}>
            <Button
              onClick={handleCloseConfirmDialog}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                borderRadius: 1,
                borderWidth: 2,
                color: "var(--accent-error)",
                borderColor: "var(--accent-error)",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "rgba(220, 53, 69, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              variant="contained"
              sx={{
                fontWeight: "bold",
                bgcolor:
                  pendingStatus === "banned" || pendingStatus === "rejected"
                    ? "var(--accent-error)"
                    : "var(--accent-info)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{
              width: "100%",
              bgcolor: "var(--accent-error)",
              color: "var(--text-white)",
              elevation: 6,
              variant: "filled",
            }}
          >
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity="success"
            sx={{
              width: "100%",
              bgcolor: "var(--accent-success)",
              color: "var(--text-white)",
              elevation: 6,
              variant: "filled",
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default GroupJoinRequests;
