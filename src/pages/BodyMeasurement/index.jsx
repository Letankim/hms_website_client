import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Slide,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  HealthAndSafety as HealthIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
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
import AuthContext from "contexts/AuthContext";
import apiBodyMeasurementService from "services/apiBodyMeasurementService";
import "./bodyMeasurement.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const BMICategories = {
  UNDERWEIGHT: { range: "<18.5", color: "#0288d1" },
  NORMAL: { range: "18.5-24.9", color: "#689f38" },
  OVERWEIGHT: { range: "25-29.9", color: "#ffca28" },
  OBESE: { range: "≥30", color: "#d32f2f" },
};

function BMIGauge({ bmi }) {
  const getColor = (bmiValue) => {
    if (bmiValue < 18.5) return BMICategories.UNDERWEIGHT.color;
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return BMICategories.NORMAL.color;
    if (bmiValue >= 25 && bmiValue <= 29.9)
      return BMICategories.OVERWEIGHT.color;
    return BMICategories.OBESE.color;
  };

  const getCategory = (bmiValue) => {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "Normal";
    if (bmiValue >= 25 && bmiValue <= 29.9) return "Overweight";
    return "Obese";
  };

  const needleAngle = bmi ? ((bmi - 15) / 35) * 180 - 90 : -90; // Scale from 15 to 50
  const category = getCategory(bmi);

  return (
    <Box
      sx={{
        position: "relative",
        width: "200px",
        height: "120px",
        margin: "0 auto",
      }}
    >
      <svg width="200" height="120">
        {/* Gauge Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="20"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor(bmi)}
          strokeWidth="15"
          strokeDasharray="50 50 50 50 50"
          transform="rotate(-90 100 100)"
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="#000"
          strokeWidth="2"
          transform={`rotate(${needleAngle} 100 100)`}
        />
        {/* Center Pin */}
        <circle cx="100" cy="100" r="5" fill="#000" />
        {/* Labels */}
        <text x="20" y="110" fill="#0288d1" fontSize="12">
          {BMICategories.UNDERWEIGHT.range}
        </text>
        <text x="70" y="110" fill="#689f38" fontSize="12">
          {BMICategories.NORMAL.range}
        </text>
        <text x="120" y="110" fill="#ffca28" fontSize="12">
          {BMICategories.OVERWEIGHT.range}
        </text>
        <text x="170" y="110" fill="#d32f2f" fontSize="12">
          {BMICategories.OBESE.range}
        </text>
      </svg>
      <Typography
        sx={{
          textAlign: "center",
          mt: 1,
          color: getColor(bmi),
          fontWeight: "bold",
        }}
      >
        Your BMI: {bmi ? bmi.toFixed(1) : "-"}
      </Typography>
      <Typography sx={{ textAlign: "center", color: "#555" }}>
        Category: {category || "-"}
      </Typography>
    </Box>
  );
}

export default function BodyMeasurementPage() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bmiData, setBmiData] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({
    minWeight: "",
    maxWeight: "",
  });
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    height: "",
    notes: "",
  });
  const [editMeasurement, setEditMeasurement] = useState({
    measurementId: "",
    weight: "",
    height: "",
    notes: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchData();
  }, [user, pageNumber, pageSize, startDate, endDate, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user || !user.userId) throw new Error("Not logged in");
      const queryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
        MinWeight: filters.minWeight ? Number(filters.minWeight) : undefined,
        MaxWeight: filters.maxWeight ? Number(filters.maxWeight) : undefined,
        Status: "active",
      };
      const res = await apiBodyMeasurementService.getMyBodyMeasurements(
        queryParams
      );
      const recs = res.data?.records || [];
      setRecords(recs);
      setTotalCount(res.data?.totalCount || 0);
      setTotalPages(res.data?.totalPages || 1);

      const bmiResults = {};
      for (const rec of recs) {
        const heightM = rec.height ? rec.height / 100 : null;
        if (!rec.weight || !heightM || isNaN(rec.weight) || isNaN(heightM)) {
          bmiResults[rec.measurementId] = { bmi: "-", weightCategory: "-" };
          continue;
        }
        const bmi = calculateBMI(rec.weight, rec.height);
        const category = getWeightCategory(bmi);
        bmiResults[rec.measurementId] = { bmi, weightCategory: category };
      }
      setBmiData(bmiResults);
    } catch (err) {
      setError(err.message || "Failed to load measurements");
      setSnackbar({
        open: true,
        message: err.message || "Failed to load measurements",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height || isNaN(weight) || isNaN(height)) return "-";
    const heightM = height / 100;
    return Number((weight / (heightM * heightM)).toFixed(2));
  };

  const getWeightCategory = (bmi) => {
    if (bmi === "-") return "-";
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "Normal";
    if (bmi >= 25 && bmi <= 29.9) return "Overweight";
    return "Obese";
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseNewDialog = () => {
    setOpenNewDialog(false);
    setNewMeasurement({ weight: "", height: "", notes: "" });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditMeasurement({
      measurementId: "",
      weight: "",
      height: "",
      notes: "",
    });
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedRecord(null);
  };

  const handleNewMeasurementChange = (e) => {
    const { name, value } = e.target;
    setNewMeasurement((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditMeasurementChange = (e) => {
    const { name, value } = e.target;
    setEditMeasurement((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewMeasurement = async () => {
    try {
      const measurementDto = {
        weight: Number(newMeasurement.weight),
        height: Number(newMeasurement.height),
        notes: newMeasurement.notes,
      };
      await apiBodyMeasurementService.createMeasurement(measurementDto);
      setSnackbar({
        open: true,
        message: "Measurement added successfully!",
        severity: "success",
      });
      fetchData();
      handleCloseNewDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to add measurement",
        severity: "error",
      });
    }
  };

  const handleSaveEditMeasurement = async () => {
    try {
      const measurementDto = {
        weight: Number(editMeasurement.weight),
        height: Number(editMeasurement.height),
        notes: editMeasurement.notes,
      };
      await apiBodyMeasurementService.updateMeasurement(
        editMeasurement.measurementId,
        measurementDto
      );
      setSnackbar({
        open: true,
        message: "Measurement updated successfully!",
        severity: "success",
      });
      fetchData();
      handleCloseEditDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update measurement",
        severity: "error",
      });
    }
  };

  const handleNewClick = () => {
    setOpenNewDialog(true);
  };

  const handleEditClick = (record) => {
    setEditMeasurement({
      measurementId: record.measurementId,
      weight: record.weight || "",
      height: record.height || "",
      notes: record.notes || "",
    });
    setOpenEditDialog(true);
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

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
    labels: records.map((entry) => entry.measurementDate),
    datasets: [
      {
        label: "Weight (kg)",
        data: records.map((entry) => entry.weight || 0),
        fill: true,
        backgroundColor: "rgba(104, 159, 56, 0.2)",
        borderColor: "#689f38",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#689f38",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "BMI",
        data: records.map(
          (entry) => calculateBMI(entry.weight, entry.height) || 0
        ),
        fill: false,
        borderColor: "#0288d1",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#0288d1",
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
        text: "Weight & BMI Trends",
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
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}${label === "Weight (kg)" ? " kg" : ""}`;
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
          text: "Value (kg or BMI)",
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
          records.length > 0
            ? Math.min(
                ...records.map((entry) =>
                  Math.min(
                    entry.weight || 0,
                    calculateBMI(entry.weight, entry.height) || 0
                  )
                )
              ) - 5
            : 0,
        suggestedMax:
          records.length > 0
            ? Math.max(
                ...records.map((entry) =>
                  Math.max(
                    entry.weight || 0,
                    calculateBMI(entry.weight, entry.height) || 0
                  )
                )
              ) + 5
            : 100,
      },
    },
  };

  const averageBMI =
    records.length > 0
      ? (
          records.reduce(
            (sum, rec) => sum + (calculateBMI(rec.weight, rec.height) || 0),
            0
          ) / records.length
        ).toFixed(2)
      : 0;

  const averageWeightCategory = getWeightCategory(averageBMI);

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
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Typography
            variant="h5"
            sx={{ mb: 2, color: "#1976d3", fontWeight: 600 }}
          >
            Body Measurements
          </Typography>
        </Grid>

        {/* Average BMI Table */}
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Card sx={{ borderRadius: 8, boxShadow: 3, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" color="#1976d3" sx={{ mb: 2 }}>
                Average Statistics
              </Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Average BMI</TableCell>
                      <TableCell>Weight Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{averageBMI}</TableCell>
                      <TableCell>
                        <Chip
                          label={averageWeightCategory}
                          size="small"
                          color={
                            averageWeightCategory === "Normal"
                              ? "success"
                              : averageWeightCategory === "Underweight"
                              ? "info"
                              : averageWeightCategory === "Overweight"
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
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

        {/* Table */}
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
                  Measurement Records
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
                      <TableCell>Height (cm)</TableCell>
                      <TableCell>BMI</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.measurementId}>
                        <TableCell>{rec.measurementDate}</TableCell>
                        <TableCell>
                          {rec.weight ? rec.weight.toFixed(1) : "-"}
                        </TableCell>
                        <TableCell>
                          {rec.height ? rec.height.toFixed(1) : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              bmiData[rec.measurementId]?.bmi
                                ? Number(
                                    bmiData[rec.measurementId].bmi
                                  ).toFixed(2)
                                : "-"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewClick(rec)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleEditClick(rec)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
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
            <Box sx={{ p: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewClick}
              >
                Add New
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* New Measurement Dialog */}
        <Dialog open={openNewDialog} onClose={handleCloseNewDialog}>
          <DialogTitle>Add New Measurement</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Weight (kg)"
                  name="weight"
                  value={newMeasurement.weight}
                  onChange={handleNewMeasurementChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Height (cm)"
                  name="height"
                  value={newMeasurement.height}
                  onChange={handleNewMeasurementChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes"
                  name="notes"
                  value={newMeasurement.notes}
                  onChange={handleNewMeasurementChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveNewMeasurement} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Measurement Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Measurement</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Weight (kg)"
                  name="weight"
                  value={editMeasurement.weight}
                  onChange={handleEditMeasurementChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Height (cm)"
                  name="height"
                  value={editMeasurement.height}
                  onChange={handleEditMeasurementChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes"
                  name="notes"
                  value={editMeasurement.notes}
                  onChange={handleEditMeasurementChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveEditMeasurement} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Measurement Dialog */}
        <Dialog open={openViewDialog} onClose={handleCloseViewDialog}>
          <DialogTitle>View Measurement Details</DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Date: {selectedRecord.measurementDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Weight: {selectedRecord.weight?.toFixed(1) || "-"} kg
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Height: {selectedRecord.height?.toFixed(1) || "-"} cm
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    BMI:{" "}
                    {bmiData[selectedRecord.measurementId]?.bmi?.toFixed(2) ||
                      "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <BMIGauge
                    bmi={
                      Number(bmiData[selectedRecord.measurementId]?.bmi) || 0
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Notes: {selectedRecord.notes || "-"}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={(props) => <Slide {...props} direction="down" />}
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
      </Grid>
    </Box>
  );
}
