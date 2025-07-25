import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Snackbar,
  Alert,
  Grid,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  TrendingUp,
  MonetizationOn,
  Person,
  BarChart,
  PieChart,
  Error as ErrorIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import AuthContext from "contexts/AuthContext";
import apiTrainerPayoutService from "services/apiTrainerPayoutService";
import { useNavigate } from "react-router-dom";
import "./index.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const COLORS = {
  completed: "#22c55e",
  pending: "#f59e0b",
  failed: "#ef4444",
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const payoutStatusOptions = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const TrainerPayoutStatisticsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.userId) {
        throw new Error("Please login to view your payout statistics.");
      }
      const params = {
        SearchTerm: searchTerm || undefined,
        Status: status === "all" ? undefined : status,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
      };
      const response = await apiTrainerPayoutService.getPayoutStatistics(
        user.userId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setStats(response.data);
      } else {
        throw new Error("Failed to fetch payout statistics.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, status, startDate, endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleStatusChangeDialogOpen = (payoutId) => {
    setSelectedPayoutId(payoutId);
    setNewStatus("");
    setStatusDialogOpen(true);
  };

  const handleStatusChangeDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedPayoutId(null);
    setNewStatus("");
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      showErrorMessage("Please select a new status.");
      setShowError(true);
      return;
    }
    try {
      const statusData = { status: newStatus };
      const response = await apiTrainerPayoutService.updatePayoutStatus(
        selectedPayoutId,
        statusData
      );
      if (response.statusCode === 200) {
        showSuccessMessage(
          `Payout status updated to ${newStatus} successfully.`
        );
        setShowSuccess(true);
        handleStatusChangeDialogClose();
        fetchStatistics();
      } else {
        throw new Error("Failed to update payout status.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChangeFilter = (e) => {
    setStatus(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const pieChartData = (stats?.payoutsByStatus || [])?.map((item) => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status] || "#6b7280",
  }));

  const barChartData = (stats?.payoutsByCreationDate || [])?.map((item) => ({
    name: `${item.month}/${item.year}`,
    payouts: item.count,
  }));

  const topTrainer =
    Array.isArray(stats?.payoutsByTrainer) && stats.payoutsByTrainer.length > 0
      ? stats.payoutsByTrainer[0]
      : { trainerName: "N/A", payoutCount: 0, totalAmount: 0 };

  const isDataEmpty =
    stats?.totalPayouts === 0 &&
    pieChartData.length === 0 &&
    barChartData.length === 0;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          p: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6, pt: 12 }}>
            <Skeleton
              variant="rectangular"
              width={480}
              height={64}
              sx={{ mx: "auto", mb: 3, borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width={320}
              height={32}
              sx={{ mx: "auto", borderRadius: 2 }}
            />
          </Box>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={160}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton
                variant="rectangular"
                height={480}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton
                variant="rectangular"
                height={480}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Card
          sx={{ maxWidth: 512, width: "100%", boxShadow: 6, borderRadius: 3 }}
        >
          <CardContent sx={{ pt: 4, textAlign: "center" }}>
            <ErrorIcon
              sx={{ fontSize: 64, color: "var(--accent-error)", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: "bold", color: "var(--text-primary)" }}
            >
              Statistics Not Available
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                maxWidth: 640,
                mx: "auto",
                fontSize: "1.25rem",
                color: "var(--text-secondary)",
              }}
            >
              {error || "Unable to load payout statistics at this time."}
            </Typography>
            <Button
              onClick={fetchStatistics}
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.125rem",
                borderRadius: 2,
                bgcolor: "var(--primary-color)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isDataEmpty) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: {
              xs: "100%",
              sm: 480,
              md: 512,
            },
            mx: "auto",
            boxShadow: 6,
            borderRadius: 3,
            p: { xs: 2, sm: 4 },
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <ErrorIcon
              sx={{ fontSize: 64, color: "var(--accent-error)", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: "bold",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                color: "var(--text-primary)",
              }}
            >
              No Payout Data Available
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                maxWidth: "100%",
                mx: "auto",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                color: "var(--text-secondary)",
              }}
            >
              No payout statistics found for the selected filters. Try adjusting
              your filters or check back later.
            </Typography>
            <Button
              onClick={fetchStatistics}
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1,
                fontSize: { xs: "1rem", sm: "1.125rem" },
                borderRadius: 2,
                bgcolor: "var(--primary-color)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
              }}
            >
              Refresh Data
            </Button>
          </CardContent>
        </Card>
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
        p: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 8, pt: 12 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor:
                  "linear-gradient(to right, var(--primary-color), var(--secondary-color))",
                borderRadius: "50%",
              }}
            >
              <TrendingUp sx={{ fontSize: 40, color: "var(--text-white)" }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background:
                  "linear-gradient(45deg, var(--secondary-color), var(--primary-color))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.25rem", md: "3.5rem" },
              }}
            >
              Payout Statistics
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 640,
              mx: "auto",
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
            }}
          >
            Comprehensive overview of your payout performance
          </Typography>
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
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
              onChange={handleStatusChangeFilter}
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
              {statusOptions?.map((opt) => (
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

        {/* Key Metrics Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                boxShadow: 6,
                bgcolor: "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
                border: "none",
                borderRadius: 3,
                minHeight: 200,
              }}
              className="card-container"
            >
              <CardContent sx={{ p: 6 }} className="card-content">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "var(--primary-color)",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Total Payouts
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "var(--text-primary)",
                        fontWeight: "bold",
                        fontSize: "2.5rem",
                      }}
                    >
                      {stats.totalPayouts || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "var(--primary-color)",
                      borderRadius: "50%",
                    }}
                  >
                    <TrendingUp
                      sx={{ fontSize: 32, color: "var(--text-white)" }}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    opacity: 0.1,
                  }}
                >
                  <TrendingUp
                    sx={{ fontSize: 96, color: "var(--text-primary)" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                boxShadow: 6,
                bgcolor: "linear-gradient(to bottom right, #ecfdf5, #d1fae5)",
                border: "none",
                borderRadius: 3,
                minHeight: 200,
              }}
              className="card-container"
            >
              <CardContent sx={{ p: 6 }} className="card-content">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "var(--accent-success)",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Total Payout Amount
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "var(--text-primary)",
                        fontWeight: "bold",
                        fontSize: "2.5rem",
                      }}
                    >
                      {formatCurrency(stats.totalPayoutAmount)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "var(--accent-success)",
                      borderRadius: "50%",
                    }}
                  >
                    <MonetizationOn
                      sx={{ fontSize: 32, color: "var(--text-white)" }}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    opacity: 0.1,
                  }}
                >
                  <MonetizationOn
                    sx={{ fontSize: 96, color: "var(--text-primary)" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                boxShadow: 6,
                bgcolor: "linear-gradient(to bottom right, #f5f3ff, #ede9fe)",
                border: "none",
                borderRadius: 3,
                minHeight: 200,
              }}
              className="card-container"
            >
              <CardContent sx={{ p: 6 }} className="card-content">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "var(--secondary-color)",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Top Trainer
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "var(--text-primary)",
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: "1.5rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {topTrainer.trainerName || "N/A"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "var(--text-secondary)",
                        fontSize: "1.125rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {topTrainer.payoutCount || 0} payouts •{" "}
                      {formatCurrency(topTrainer.totalAmount)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "var(--secondary-color)",
                      borderRadius: "50%",
                    }}
                  >
                    <Person sx={{ fontSize: 32, color: "var(--text-white)" }} />
                  </Box>
                </Box>
                {topTrainer.trainerId && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleStatusChangeDialogOpen(topTrainer.trainerId)
                    }
                    sx={{
                      borderRadius: 0.5,
                      color: "var(--accent-info)",
                      borderColor: "var(--accent-info)",
                      "&:hover": { bgcolor: "var(--background-light)" },
                    }}
                  >
                    Change Status
                  </Button>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    opacity: 0.1,
                  }}
                >
                  <Person sx={{ fontSize: 96, color: "var(--text-primary)" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                color: "var(--text-primary)",
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Payout Insights
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}
            >
              Detailed analytics of your payout performance
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {/* Pie Chart - Payouts by Status */}
            <Card
              sx={{
                boxShadow: 6,
                border: "none",
                borderRadius: 3,
                flex: "1 1 45%",
                maxWidth: "50%",
              }}
              className="chart-container"
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PieChart
                      sx={{ fontSize: 24, color: "var(--primary-color)" }}
                    />
                    <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
                      Payouts by Status
                    </Typography>
                  </Box>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                {pieChartData.length === 0 ? (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "var(--text-secondary)",
                    }}
                  >
                    No payout status data available for the selected filters
                  </Typography>
                ) : (
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={160}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [value, "Payouts"]}
                          contentStyle={{
                            backgroundColor: "var(--background-white)",
                            border: "1px solid var(--background-light)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px-1px var(--shadow-color)",
                            fontSize: "1rem",
                          }}
                        />
                        <Legend iconSize={16} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Payouts by Creation Date */}
            <Card
              sx={{
                boxShadow: 6,
                border: "none",
                borderRadius: 3,
                flex: "1 1 45%",
                maxWidth: "50%",
              }}
              className="chart-container"
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BarChart
                      sx={{ fontSize: 24, color: "var(--accent-success)" }}
                    />
                    <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
                      Payouts by Creation Date
                    </Typography>
                  </Box>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                {barChartData.length === 0 ? (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "var(--text-secondary)",
                    }}
                  >
                    No payout creation date data available for the selected
                    filters
                  </Typography>
                ) : (
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={barChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--background-light)"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-secondary)"
                          fontSize={14}
                        />
                        <YAxis stroke="var(--text-secondary)" fontSize={14} />
                        <Tooltip
                          formatter={(value) => [value, "Payouts"]}
                          contentStyle={{
                            backgroundColor: "var(--background-white)",
                            border: "1px solid var(--background-light)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px-1px var(--shadow-color)",
                            fontSize: "1rem",
                          }}
                        />
                        <Bar
                          dataKey="payouts"
                          fill="url(#colorGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--primary-color)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--primary-color)"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                        </defs>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Status Change Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={handleStatusChangeDialogClose}
          maxWidth="xs"
          fullWidth
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
            Change Payout Status
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "var(--background-light)" }}>
            <TextField
              fullWidth
              select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              {payoutStatusOptions?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "var(--background-light)",
              justifyContent: "center",
              pb: 2,
            }}
          >
            <Button
              onClick={handleStatusChangeDialogClose}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                color: "var(--accent-error)",
                borderColor: "var(--accent-error)",
                "&:hover": { bgcolor: "var(--background-light)" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              variant="contained"
              sx={{
                borderRadius: "12px",
                bgcolor: "var(--primary-color)",
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

export default TrainerPayoutStatisticsPage;
