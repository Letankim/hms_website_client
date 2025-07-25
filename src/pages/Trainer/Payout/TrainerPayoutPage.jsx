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
  Grid,
  Snackbar,
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  BarChart as BarChartIcon,
  MonetizationOn as MonetizationOnIcon,
  Visibility,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiTrainerPayoutService from "services/apiTrainerPayoutService";
import "./index.css";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const pageSizeOptions = [5, 10, 20, 50];

const TrainerPayoutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.userId) {
        throw new Error("Please login to view your payouts.");
      }
      const params = {
        PageNumber: page + 1,
        PageSize: rowsPerPage,
        ValidPageSize: rowsPerPage,
        SearchTerm: searchTerm || undefined,
        Status: status === "all" ? undefined : status,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
      };
      const response = await apiTrainerPayoutService.getPayoutsByTrainerId(
        user.userId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setPayouts(response.data.payouts || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error("Failed to fetch payouts.");
      }
    } catch (e) {
      setPayouts([]);
      setTotalCount(0);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage, searchTerm, status, startDate, endDate]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleDetailsDialogOpen = (payout) => {
    setSelectedPayout({
      payoutId: payout.payoutId,
      amount: payout.amount.toString(),
      payoutDate: format(new Date(payout.payoutDate), "yyyy-MM-dd'T'HH:mm"),
      status: payout.status,
      paymentMethod: payout.paymentMethod,
      transactionReference: payout.transactionReference,
      notes: payout.notes || "",
      createdAt: format(new Date(payout.createdAt), "yyyy-MM-dd'T'HH:mm"),
      createdBy: payout.createdBy.toString(),
      updatedAt: format(new Date(payout.updatedAt), "yyyy-MM-dd'T'HH:mm"),
      updatedBy: payout.updatedBy.toString(),
    });
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setSelectedPayout(null);
  };

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

  const handleViewStatistics = () => {
    navigate("/trainer/payout-statistics/view");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "var(--accent-success)",
          color: "var(--text-white)",
        };
      case "pending":
        return { backgroundColor: "#f59e0b", color: "var(--text-white)" };
      case "failed":
        return {
          backgroundColor: "var(--accent-error)",
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
        <Skeleton variant="text" width={100} />
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
        <Skeleton variant="text" width={120} />
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
            Please login to view your payouts.
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
      className="services-container"
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
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 2, flexWrap: "wrap", gap: { xs: 1.5, md: 2 } }}
          >
            <MonetizationOnIcon
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
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              My Payouts
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: { xs: 2, md: 0 }, justifyContent: "center" }}
            >
              <Button
                variant="contained"
                startIcon={<BarChartIcon />}
                onClick={handleViewStatistics}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "var(--accent-info)",
                  color: "var(--text-white)",
                  "&:hover": { bgcolor: "#1976d2" },
                  padding: "6px 16px",
                }}
              >
                View Statistics
              </Button>
            </Stack>
          </Stack>
          <Typography
            variant="h6"
            sx={{
              color: "var(--text-secondary)",
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              mt: 2,
            }}
          >
            View and manage your payout history
          </Typography>
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by transaction reference..."
              value={searchTerm}
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
        </Grid>

        {/* Payouts Table */}

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px var(--shadow-color)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payout Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Transaction Reference</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  skeletonRows
                ) : payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <MonetizationOnIcon
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
                          No payouts found
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
                  payouts.map((payout, index) => (
                    <TableRow key={payout.payoutId} hover>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {payout.amount.toLocaleString()} VND
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {format(
                          new Date(payout.payoutDate),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          className="status-pill"
                          sx={{
                            ...getStatusColor(payout.status),
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            borderRadius: "12px",
                            padding: "4px 12px",
                            minWidth: "80px",
                          }}
                        >
                          {payout.status}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {payout.paymentMethod === "bank_transfer"
                          ? "Bank Transfer"
                          : payout.paymentMethod}
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {payout.transactionReference}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "var(--text-primary)",
                          maxWidth: 200,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {payout.notes}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDetailsDialogOpen(payout)}
                          sx={{
                            color: "var(--accent-info)",
                            border: "1px solid var(--accent-info)",
                            borderRadius: 1,
                            p: "4px",
                            "&:hover": {
                              bgcolor: "var(--background-light)",
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Payouts per page:"
          sx={{
            mt: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            px: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: "var(--text-secondary)",
              },
            "& .MuiTablePagination-select": {
              color: "var(--text-primary)",
            },
          }}
        />
        {/* Payout Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={handleDetailsDialogClose}
          maxWidth="sm"
          fullWidth
          className="payout-details-dialog"
          PaperProps={{
            sx: { borderRadius: 8, bgcolor: "var(--background-white)" },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: "var(--secondary-color)",
              textAlign: "center",
            }}
          >
            Payout Details
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "var(--background-light)" }}>
            {selectedPayout && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Payout ID"
                  value={selectedPayout.payoutId}
                  disabled
                  sx={{ mb: 2, mt: 2 }}
                />
                <TextField
                  fullWidth
                  label="Amount (VND)"
                  value={selectedPayout.amount}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Payout Date"
                  value={selectedPayout.payoutDate}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Status"
                  value={selectedPayout.status}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Payment Method"
                  value={selectedPayout.paymentMethod}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Transaction Reference"
                  value={selectedPayout.transactionReference}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Notes"
                  value={selectedPayout.notes}
                  disabled
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Created At"
                  value={selectedPayout.createdAt}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Created By"
                  value={selectedPayout.createdBy}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Updated At"
                  value={selectedPayout.updatedAt}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Updated By"
                  value={selectedPayout.updatedBy}
                  disabled
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "var(--background-light)",
              justifyContent: "center",
              pb: 2,
            }}
          >
            <Button
              onClick={handleDetailsDialogClose}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                color: "var(--accent-error)",
                borderColor: "var(--accent-error)",
                "&:hover": { bgcolor: "var(--background-light)" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
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

export default TrainerPayoutPage;
