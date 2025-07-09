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
  Work as WorkIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import apiServicePackageService from "services/apiServicePackageService";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./index.css";
import {
  showErrorFetchAPI,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const pageSizeOptions = [5, 10, 20, 50];

const MyServicesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    packageName: "",
    price: "",
    durationDays: "",
    status: "active",
    description: "",
    maxSubscribers: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.userId) {
        throw new Error("Please login to view your services.");
      }
      const params = {
        PageNumber: page + 1,
        PageSize: rowsPerPage,
        SearchTerm: searchTerm || undefined,
        Status: status === "all" ? undefined : status,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
      };
      const response = await apiServicePackageService.getMyPackageService(
        user.userId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setPackages(response.data.packages || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error("Failed to fetch service packages.");
      }
    } catch (e) {
      setPackages([]);
      setTotalCount(0);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage, searchTerm, status, startDate, endDate]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleStatusUpdate = async (packageId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const statusData = { status: newStatus };
      const response = await apiServicePackageService.updatePackageStatus(
        packageId,
        statusData
      );
      if (response.statusCode === 200) {
        setSuccessMessage(
          `Package status updated to ${newStatus} successfully.`
        );
        setShowSuccess(true);
        fetchPackages();
      } else {
        throw new Error("Failed to update package status.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleConfirmStatusChange = (packageId, currentStatus) => {
    setSelectedPackageId(packageId);
    setCurrentStatus(currentStatus);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = (confirm) => {
    setConfirmDialogOpen(false);
    if (confirm && selectedPackageId && currentStatus) {
      handleStatusUpdate(selectedPackageId, currentStatus);
    }
    setSelectedPackageId(null);
    setCurrentStatus(null);
  };

  const handleAddPackageDialogOpen = () => {
    setAddDialogOpen(true);
    setNewPackage({
      packageName: "",
      price: "",
      durationDays: "",
      status: "active",
      description: "",
      maxSubscribers: "",
    });
    setFormErrors({});
  };

  const handleAddPackageDialogClose = () => {
    setAddDialogOpen(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!newPackage.packageName || !newPackage.packageName.trim()) {
      errors.packageName = "Package name is required";
    } else if (
      newPackage.packageName.length < 3 ||
      newPackage.packageName.length > 255
    ) {
      errors.packageName = "Package name must be between 3 and 255 characters";
    }

    if (
      newPackage.price == null ||
      isNaN(newPackage.price) ||
      newPackage.price < 0
    ) {
      errors.price = "Price must be a non-negative number";
    }

    if (
      newPackage.durationDays == null ||
      isNaN(newPackage.durationDays) ||
      newPackage.durationDays <= 0
    ) {
      errors.durationDays = "Duration must be a positive number";
    }

    if (newPackage.maxSubscribers != null) {
      if (isNaN(newPackage.maxSubscribers) || newPackage.maxSubscribers < 0) {
        errors.maxSubscribers =
          "Maximum subscribers must be a non-negative number";
      }
    }

    if (newPackage.description) {
      if (newPackage.description.length > 1000) {
        errors.description = "Description cannot exceed 1000 characters";
      }
    }

    return errors;
  };

  const handleAddPackage = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const packageData = {
        ...newPackage,
        price: parseFloat(newPackage.price),
        durationDays: parseInt(newPackage.durationDays, 10),
        maxSubscribers: parseInt(newPackage.maxSubscribers, 10),
        trainerId: user.userId,
      };
      const response = await apiServicePackageService.addPackageByTrainer(
        packageData
      );
      if (response.statusCode === 201) {
        showSuccessMessage("Package added successfully.");
        setShowSuccess(true);
        setAddDialogOpen(false);
        fetchPackages();
      } else {
        throw new Error("Failed to add package.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
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

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleViewDetails = (pkg) => {
    navigate(`/trainer/service-detail/${pkg.packageId}`);
  };

  const handleViewStatistics = () => {
    navigate("/trainer/service-statistics/view");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          backgroundColor: "var(--accent-success)",
          color: "var(--text-white)",
        };
      case "inactive":
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
        <Skeleton variant="text" width={120} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} />
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
            Please login to view your services.
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
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <WorkIcon sx={{ fontSize: 40, color: "var(--secondary-color)" }} />
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
              My Services
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPackageDialogOpen}
                sx={{
                  borderRadius: "20px",
                  bgcolor: "var(--primary-color)",
                  color: "var(--text-white)",
                  "&:hover": { bgcolor: "var(--primary-hover)" },
                  padding: "6px 16px",
                }}
              >
                Add Package
              </Button>
            </Box>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            View and manage your service packages
          </Typography>
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by package name..."
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

        {/* Services Table */}
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
                  Package Name
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Price
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Duration (Days)
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Current Subscribers
                </TableCell>
                <TableCell
                  sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Status
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
              ) : packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <WorkIcon
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
                        No service packages found
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
                packages.map((pkg, index) => (
                  <TableRow key={pkg.packageId} hover>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {pkg.packageName}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {pkg.price?.toLocaleString() || "N/A"} VND
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {pkg.durationDays || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "var(--text-primary)" }}>
                      {pkg.currentSubscribers || 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          handleConfirmStatusChange(pkg.packageId, pkg.status)
                        }
                        sx={{
                          ...getStatusColor(pkg.status),
                          textTransform: "capitalize",
                          fontWeight: "bold",
                          borderRadius: "12px",
                          padding: "4px 12px",
                          minWidth: "80px",
                        }}
                      >
                        {pkg.status}
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(pkg)}
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
            labelRowsPerPage="Packages per page:"
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

        {/* Add Package Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={handleAddPackageDialogClose}
          maxWidth="sm"
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
            Add New Package
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "var(--background-light)" }}>
            <TextField
              fullWidth
              label="Package Name"
              value={newPackage.packageName}
              onChange={(e) =>
                setNewPackage({ ...newPackage, packageName: e.target.value })
              }
              error={!!formErrors.packageName}
              helperText={formErrors.packageName}
              sx={{ mb: 2, mt: 2 }}
            />
            <TextField
              fullWidth
              label="Price (VND)"
              type="number"
              value={newPackage.price}
              onChange={(e) =>
                setNewPackage({ ...newPackage, price: e.target.value })
              }
              error={!!formErrors.price}
              helperText={formErrors.price}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Duration (Days)"
              type="number"
              value={newPackage.durationDays}
              onChange={(e) =>
                setNewPackage({ ...newPackage, durationDays: e.target.value })
              }
              error={!!formErrors.durationDays}
              helperText={formErrors.durationDays}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Maximum Subscribers"
              type="number"
              value={newPackage.maxSubscribers}
              onChange={(e) =>
                setNewPackage({ ...newPackage, maxSubscribers: e.target.value })
              }
              error={!!formErrors.maxSubscribers}
              helperText={formErrors.maxSubscribers}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={newPackage.status}
              onChange={(e) =>
                setNewPackage({ ...newPackage, status: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "var(--text-primary)" }}
              >
                Description
              </Typography>
              <CKEditor
                editor={ClassicEditor}
                data={newPackage.description}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setNewPackage({ ...newPackage, description: data });
                }}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "undo",
                    "redo",
                  ],
                }}
              />
              {formErrors.description && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {formErrors.description}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "var(--background-light)",
              justifyContent: "center",
              pb: 2,
            }}
          >
            <Button
              onClick={handleAddPackageDialogClose}
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
              onClick={handleAddPackage}
              variant="contained"
              sx={{
                borderRadius: "12px",
                bgcolor: "var(--primary-color)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
              }}
            >
              Add Package
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog for Status Update */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => handleConfirmDialogClose(false)}
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
            Confirm Status Change
          </DialogTitle>
          <DialogContent
            sx={{
              p: 3,
              bgcolor: "var(--background-light)",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "var(--text-primary)" }}>
              Are you sure you want to change the status to{" "}
              <strong>
                {currentStatus === "active" ? "inactive" : "active"}
              </strong>
              ?
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "var(--background-light)",
              justifyContent: "center",
              pb: 2,
            }}
          >
            <Button
              onClick={() => handleConfirmDialogClose(false)}
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
              onClick={() => handleConfirmDialogClose(true)}
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

        {/* Success Snackbar */}
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

export default MyServicesPage;
