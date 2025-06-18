import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import apiSubscriptionService from "services/apiSubscriptionService";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/system";

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
        searchTerm: searchTerm || undefined,
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
      setError(e.message || "An error occurred while fetching subscriptions.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage, searchTerm, status, startDate, endDate]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

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
    switch (status) {
      case "active":
        return { backgroundColor: "#4caf50", color: "#fff" };
      case "pending":
        return { backgroundColor: "#ffca28", color: "#000" };
      case "canceled":
        return { backgroundColor: "#f44336", color: "#fff" };
      case "paid":
        return { backgroundColor: "#2196f3", color: "#fff" };
      default:
        return { backgroundColor: "#e0e0e0", color: "#000" };
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
          bgcolor: "error.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper sx={{ textAlign: "center", padding: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please login to view your subscriptions.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            size="medium"
            sx={{ borderRadius: 2 }}
          >
            Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pt: "100px" }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        My Subscriptions
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
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
          />
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub, index) => (
                <TableRow key={sub.subscriptionId} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{sub.packageName}</TableCell>
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
                  <TableCell>
                    {new Date(sub.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(sub)}
                      sx={{ borderRadius: 0.5 }}
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
        />
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subscription Details</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedSubscription && (
            <Stack spacing={2} sx={{ pt: 2 }}>
              <TextField
                label="Subscription ID"
                value={selectedSubscription.subscriptionId}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="User Name"
                value={selectedSubscription.userFullName}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="User Email"
                value={selectedSubscription.userEmail}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Trainer Name"
                value={selectedSubscription.trainerFullName}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Trainer Email"
                value={selectedSubscription.trainerEmail}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Package Name"
                value={selectedSubscription.packageName}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Package Price"
                value={`${selectedSubscription.packagePrice?.toLocaleString()} VND`}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
              <TextField
                label="Package Duration (Days)"
                value={selectedSubscription.packageDurationDays}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
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
              />
              <TextField
                label="Status"
                value={selectedSubscription.status}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ textTransform: "capitalize" }}
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
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MySubscriptionsPage;
