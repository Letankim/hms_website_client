import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Skeleton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import {
  Subscriptions as SubscriptionsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import apiSubscriptionService from "services/apiSubscriptionService";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "canceled", label: "Canceled" },
  { value: "paid", label: "Paid" },
];

const pageSizeOptions = [5, 10, 20, 50];

const MySubscriptionsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.userId) {
        throw new Error("Please login to view your subscriptions.");
      }
      const params = {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchTerm.trim() || undefined,
        status: status === "all" ? undefined : status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await apiSubscriptionService.getMySubscriptions(
        user.userId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error("Failed to fetch subscriptions.");
      }
    } catch (e) {
      setSubscriptions([]);
      setTotalCount(0);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage, searchTerm, status, startDate, endDate]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(0);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);
    debouncedSetSearch(value);
  };

  const handleClearFilters = () => {
    setTempSearch("");
    setSearchTerm("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  useEffect(() => {
    setTempSearch(searchTerm);
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(0);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(0);
  };

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleCloseError = () => {
    setShowError(false);
    setError(null);
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
    setSelectedSubscription(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          backgroundColor: "var(--accent-success)",
          color: "var(--text-white)",
        };
      case "pending":
        return { backgroundColor: "#ff9800", color: "var(--text-primary)" };
      case "canceled":
        return {
          backgroundColor: "var(--accent-error)",
          color: "var(--text-white)",
        };
      case "paid":
        return {
          backgroundColor: "var(--accent-info)",
          color: "var(--text-white)",
        };
      default:
        return {
          backgroundColor: "var(--background-light)",
          color: "var(--text-primary)",
        };
    }
  };

  const skeletonRows = Array.from({ length: rowsPerPage }).map((_, idx) => (
    <TableRow key={idx}>
      <TableCell>
        <Skeleton variant="text" width={40} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={120} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={80} height={36} />
      </TableCell>
    </TableRow>
  ));

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "var(--accent-error)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            textAlign: "center",
            padding: 4,
            borderRadius: 3,
            bgcolor: "var(--background-white)",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "var(--text-primary)", mb: 2 }}
          >
            Authentication Required
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-secondary)", mb: 2 }}
          >
            Please login to view your subscriptions.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--primary-color)",
              color: "var(--text-white)",
              "&:hover": { bgcolor: "var(--primary-hover)" },
            }}
          >
            Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      className="subscriptions-container"
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
            <SubscriptionsIcon
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
              My Subscriptions
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            View and manage your active and past subscription plans
          </Typography>
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by email or name..."
              value={tempSearch}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "var(--accent-info)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={status}
              onChange={handleStatusChange}
              sx={{
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
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: endDate || undefined }}
              sx={{
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: startDate || undefined }}
              sx={{
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: "var(--accent-error)",
                borderColor: "var(--accent-error)",
                width: "100%",
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.04)",
                  borderColor: "var(--accent-error)",
                },
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Subscriptions Table */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: "0 4px 12px var(--shadow-color)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  No
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Package
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Start Date
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  End Date
                </TableCell>
                <TableCell
                  sx={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                skeletonRows
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <SubscriptionsIcon
                        sx={{
                          fontSize: 80,
                          color: "var(--text-secondary)",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{ color: "var(--text-secondary)", mb: 1 }}
                      >
                        No subscriptions found
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "var(--text-secondary)" }}
                      >
                        Try adjusting your search or date filters
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub, index) => (
                  <TableRow key={sub.subscriptionId} hover>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {sub.packageName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status}
                        sx={{
                          ...getStatusColor(sub.status),
                          textTransform: "capitalize",
                          fontWeight: "bold",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {new Date(sub.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {new Date(sub.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(sub)}
                        sx={{
                          borderRadius: 0.5,
                          color: "var(--accent-info)",
                          borderColor: "var(--accent-info)",
                          "&:hover": { bgcolor: "var(--background-light)" },
                        }}
                      >
                        View Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={pageSizeOptions}
            labelRowsPerPage="Subscriptions per page:"
            sx={{
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "var(--text-secondary)",
                },
              "& .MuiTablePagination-select": {
                color: "var(--text-primary)",
              },
            }}
          />
        </TableContainer>

        {/* Details Dialog */}
        <Dialog
          open={openDetailDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, bgcolor: "var(--background-white)" },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, color: "var(--secondary-color)" }}
          >
            Subscription Details
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: "var(--background-light)" }}>
            {selectedSubscription && (
              <Stack spacing={2} sx={{ pt: 2 }}>
                <TextField
                  label="Subscription ID"
                  value={selectedSubscription.subscriptionId}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="User Name"
                  value={selectedSubscription.userFullName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="User Email"
                  value={selectedSubscription.userEmail}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Trainer Name"
                  value={selectedSubscription.trainerFullName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Trainer Email"
                  value={selectedSubscription.trainerEmail}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Package Name"
                  value={selectedSubscription.packageName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Package Price"
                  value={`${
                    selectedSubscription.packagePrice?.toLocaleString() || "N/A"
                  } VND`}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Package Duration (Days)"
                  value={selectedSubscription.packageDurationDays || "N/A"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Start Date"
                  value={new Date(
                    selectedSubscription.startDate
                  ).toLocaleDateString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="End Date"
                  value={new Date(
                    selectedSubscription.endDate
                  ).toLocaleDateString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Status"
                  value={selectedSubscription.status}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: "var(--background-white)",
                    textTransform: "capitalize",
                  }}
                />
                <TextField
                  label="Created At"
                  value={new Date(
                    selectedSubscription.createdAt
                  ).toLocaleDateString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "var(--background-light)" }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                borderRadius: 2,
                bgcolor: "var(--accent-error)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
      </Container>
    </Box>
  );
};

export default MySubscriptionsPage;
