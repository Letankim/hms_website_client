import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Pagination,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import apiWeightHistoryService from "services/apiWeightHistoryService";
import "./WeightHistoryPage.css";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function WeightHistoryPage() {
  const [weightHistory, setWeightHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({
    minWeight: "",
    maxWeight: "",
  });

  useEffect(() => {
    fetchWeightHistory();
  }, [pageNumber, pageSize, startDate, endDate, filters]);

  const fetchWeightHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        pageNumber,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minWeight: filters.minWeight ? Number(filters.minWeight) : undefined,
        maxWeight: filters.maxWeight ? Number(filters.maxWeight) : undefined,
      };
      const response = await apiWeightHistoryService.getMyWeightHistory(
        queryParams
      );
      setWeightHistory(response.data.records || []);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load weight history.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPageNumber(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPageNumber(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilters({
      minWeight: "",
      maxWeight: "",
    });
    setPageNumber(1);
  };

  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Chart gradient plugin
  const gradientPlugin = {
    id: "gradientBackground",
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { top, bottom, left, right },
      } = chart;
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, "rgba(220, 237, 200, 0.3)");
      gradient.addColorStop(1, "rgba(255, 245, 204, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(left, top, right - left, bottom - top);
    },
  };

  const chartData = {
    labels: weightHistory.map((entry) => formatDate(entry.recordedAt)),
    datasets: [
      {
        label: "Weight (kg)",
        data: weightHistory.map((entry) => entry.weight),
        fill: true,
        backgroundColor: "rgba(104, 159, 56, 0.2)", // Light green fill
        borderColor: "#689f38", // Vibrant green
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#689f38",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14, weight: "bold" },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Weight Trends",
        font: { size: 20, weight: "bold" },
        color: "#1a3c34",
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1a3c34",
        bodyColor: "#333",
        borderColor: "#689f38",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Weight: ${value} kg`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Date",
          font: { size: 14, weight: "bold" },
          color: "#1a3c34",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#333",
        },
      },
      y: {
        title: {
          display: true,
          text: "Weight (kg)",
          font: { size: 14, weight: "bold" },
          color: "#1a3c34",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#333",
        },
        suggestedMin:
          weightHistory.length > 0
            ? Math.min(...weightHistory.map((entry) => entry.weight)) - 5
            : 0,
        suggestedMax:
          weightHistory.length > 0
            ? Math.max(...weightHistory.map((entry) => entry.weight)) + 5
            : 100,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", padding: "100px" }}>
      <Grid container spacing={2} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Grid item xs={12}>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "#1976d3", fontWeight: 600 }}
          >
            Weight History
          </Typography>
        </Grid>

        {/* Filters */}
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Card sx={{ borderRadius: 8, boxShadow: 3, mb: 4 }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FilterListIcon sx={{ mr: 1, color: "#1976d3" }} />
                <Typography variant="h6" color="#1976d3">
                  Filters
                </Typography>
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: "#fff" }}
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
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Min Weight (kg)"
                    type="number"
                    name="minWeight"
                    value={filters.minWeight}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Max Weight (kg)"
                    type="number"
                    name="maxWeight"
                    value={filters.maxWeight}
                    onChange={handleFilterChange}
                    fullWidth
                    size="small"
                    sx={{ bgcolor: "#fff" }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    fullWidth
                    size="small"
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Card sx={{ borderRadius: 8, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Box sx={{ height: { xs: 300, sm: 400 } }}>
                <Line
                  data={chartData}
                  options={chartOptions}
                  plugins={[gradientPlugin]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Table and Pagination */}
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Card sx={{ borderRadius: 8, boxShadow: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="#1976d3">
                  Weight Records
                </Typography>
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel>Records per page</InputLabel>
                  <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    label="Records per page"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weightHistory.map((entry) => (
                      <TableRow key={entry.historyId}>
                        <TableCell>{formatDate(entry.recordedAt)}</TableCell>
                        <TableCell>{entry.weight.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
