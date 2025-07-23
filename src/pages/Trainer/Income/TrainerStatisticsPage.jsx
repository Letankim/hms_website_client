import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Skeleton,
  Box,
  Grid,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  BarChart3,
  PieChart,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiSubscriptionService from "services/apiSubscriptionService";
import "./index.css";
import { showErrorFetchAPI } from "../../../components/ErrorHandler/showStatusMessage";

const COLORS = {
  Active: "#10b981",
  Expired: "#f59e0b",
  Cancelled: "#ef4444",
};

const TrainerStatisticsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.userId) {
        throw new Error("Please login to view your statistics.");
      }
      const params = { trainerId: user.userId };
      const response =
        await apiSubscriptionService.getSubscriptionStatisticsByTrainer(params);
      if (response.statusCode === 200 && response.data) {
        setStats(response.data);
      } else {
        throw new Error("Failed to fetch subscription statistics.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleViewPackageDetails = () => {
    navigate(`/trainer/my-services`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
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
            {[1, 2, 3]?.map((i) => (
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

  // Error state
  if (error && !stats) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
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
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: "bold", color: "#111827" }}
            >
              Statistics Not Available
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 640, mx: "auto", fontSize: "1.25rem" }}
            >
              Unable to load your statistics at this time.
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
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!stats) return null;

  // Chart data preparation
  const pieChartData = stats.subscriptionsByStatus?.map((item) => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status],
  }));

  const barChartData = stats.subscriptionsByCreationDate?.map((item) => ({
    name: `${item.month}/${item.year}`,
    subscriptions: item.count,
  }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg" sx={{ p: 4 }}>
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
                bgcolor: "linear-gradient(to right, #3b82f6, #9333ea)",
                borderRadius: "50%",
              }}
            >
              <TrendingUp className="h-10 w-10 text-white" />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(to right, #3b82f6, #9333ea)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2.25rem", md: "3.5rem" },
              }}
            >
              Trainer Statistics
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 640, mx: "auto", fontSize: "1.25rem" }}
          >
            Comprehensive overview of your subscription performance and revenue
            insights
          </Typography>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                boxShadow: 6,
                background:
                  "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
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
                        color: "#2563eb",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Total Subscriptions
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "#1e3a8a",
                        fontWeight: "bold",
                        fontSize: "2.5rem",
                      }}
                    >
                      {stats.totalSubscriptions}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#3b82f6", borderRadius: "50%" }}>
                    <Users className="h-8 w-8 text-white" />
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
                  <Users className="h-24 w-24" />
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
                background:
                  "linear-gradient(to bottom right, #ecfdf5, #d1fae5)",
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
                        color: "#16a34a",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Total Revenue
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "#14532d",
                        fontWeight: "bold",
                        fontSize: "2.5rem",
                      }}
                    >
                      {formatCurrency(stats?.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#22c55e", borderRadius: "50%" }}>
                    <DollarSign className="h-8 w-8 text-white" />
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
                  <DollarSign className="h-24 w-24" />
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
                background:
                  "linear-gradient(to bottom right, #f5f3ff, #ede9fe)",
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
                        color: "#7c3aed",
                        fontWeight: "medium",
                        mb: 1,
                        fontSize: "1.25rem",
                      }}
                    >
                      Most Popular Package
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#4c1d95",
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: "1.5rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stats.mostPopularPackage?.packageName}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6d28d9",
                        fontSize: "1.125rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stats.mostPopularPackage?.subscriptionCount} subs •{" "}
                      {formatCurrency(stats.mostPopularPackage?.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#8b5cf6", borderRadius: "50%" }}>
                    <Package className="h-8 w-8 text-white" />
                  </Box>
                </Box>
                <Button
                  onClick={handleViewPackageDetails}
                  variant="contained"
                  size="small"
                  sx={{
                    fontSize: "1.05rem",
                    borderRadius: 2,
                    bgcolor: "#8b5cf6",
                    "&:hover": { bgcolor: "#7c3aed" },
                  }}
                >
                  View Details
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
                <Box
                  sx={{
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    opacity: 0.1,
                  }}
                >
                  <Package className="h-24 w-24" />
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
                color: "#111827",
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Subscription Insights
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.125rem" }}
            >
              Detailed analytics of your subscription performance
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {/* Pie Chart - Subscriptions by Status */}
            <Card
              sx={{
                boxShadow: 6,
                border: "none",
                borderRadius: 3,
                flex: "1 1 40%",
                maxWidth: "50%",
              }}
              className="chart-container"
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PieChart className="h-6 w-6 text-blue-600" />
                    <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
                      Subscriptions by Status
                    </Typography>
                  </Box>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
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
                        formatter={(value) => [value, "Subscriptions"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px-1px rgba(0, 0, 0, 0.1)",
                          fontSize: "1rem",
                        }}
                      />
                      <Legend iconSize={16} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Bar Chart - Subscriptions by Creation Date */}
            <Card
              sx={{
                boxShadow: 6,
                border: "none",
                borderRadius: 3,
                flex: "1 1 50%",
                maxWidth: "50%",
              }}
              className="chart-container"
            >
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BarChart3 className="h-6 w-6 text-green-600" />
                    <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
                      Subscriptions by Creation Date
                    </Typography>
                  </Box>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={14} />
                      <YAxis stroke="#64748b" fontSize={14} />
                      <Tooltip
                        formatter={(value) => [value, "Subscriptions"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px-1px rgba(0, 0, 0, 0.1)",
                          fontSize: "1rem",
                        }}
                      />
                      <Bar
                        dataKey="subscriptions"
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
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Snackbar for Error Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%", p: 2 }}
          >
            <Typography variant="h6" sx={{ fontSize: "1.25rem" }}>
              Error
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "1rem" }}>
              {snackbar.message}
            </Typography>
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default TrainerStatisticsPage;
