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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Stack,
  Skeleton,
} from "@mui/material";
import { Work as WorkIcon } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon, EditIcon } from "lucide-react";
import apiServicePackageService from "services/apiServicePackageService";
import apiSubscriptionService from "services/apiSubscriptionService";
import AuthContext from "contexts/AuthContext";
import "./index.css";
import {
  showErrorFetchAPI,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const MyServiceDetailPage = () => {
  const { packageId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fetchPackageDetails = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.userId || !packageId) {
        throw new Error("Invalid user or package ID.");
      }
      const response = await apiServicePackageService.getPackageByIdByTrainer(
        packageId
      );
      if (response.statusCode === 200 && response.data) {
        setPackageData(response.data);
      } else {
        throw new Error("Failed to fetch package details.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  }, [user, packageId]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      if (!packageId) {
        throw new Error("Invalid package ID.");
      }
      const params = { pageNumber: 1, pageSize: 10 };
      const response = await apiSubscriptionService.getSubscriptionsByPackageId(
        packageId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        throw new Error("Failed to fetch subscriptions.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackageDetails();
    fetchSubscriptions();
  }, [fetchPackageDetails, fetchSubscriptions]);

  const handleStatusUpdate = async (packageId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const statusData = { status: newStatus };
      const response = await apiServicePackageService.updatePackageStatus(
        packageId,
        statusData
      );
      if (response.statusCode === 200) {
        showSuccessMessage(
          `Package status updated to ${newStatus} successfully.`
        );
        setShowSuccess(true);
        fetchPackageDetails();
      } else {
        throw new Error("Failed to update package status.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleConfirmStatusChange = (currentStatus) => {
    setCurrentStatus(currentStatus);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = (confirm) => {
    setConfirmDialogOpen(false);
    if (confirm && currentStatus && packageData) {
      handleStatusUpdate(packageData.packageId, currentStatus);
    }
    setCurrentStatus(null);
  };

  const handleDetailOpen = (subscription) => {
    setSelectedSubscription(subscription);
    setDetailDialogOpen(true);
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedSubscription(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Skeleton variant="rectangular" width={400} height={300} />
      </Box>
    );
  }

  if (!packageData) {
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
            Package Not Found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/my-services")}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--primary-color)",
              color: "var(--text-white)",
              "&:hover": { bgcolor: "var(--primary-hover)" },
            }}
          >
            Back to My Services
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="services-container">
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
              My Service Details
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            View details of this service package and its subscriptions
          </Typography>
        </Box>

        {/* Package Details */}
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{ p: 3, borderRadius: 2, bgcolor: "var(--background-white)" }}
          >
            <Stack spacing={2}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "var(--text-primary)" }}
              >
                Package Information
              </Typography>
              <TextField
                label="Package ID"
                value={packageData.packageId}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Package Name"
                value={packageData.packageName}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Description"
                value={packageData.description.replace(/<[^>]+>/g, "")}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                multiline
                rows={4}
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Price"
                value={`${packageData.price.toLocaleString()} VND`}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Duration (Days)"
                value={packageData.durationDays}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Maximum Subscribers"
                value={packageData.maxSubscribers || "N/A"}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Current Subscribers"
                value={packageData.currentSubscribers || 0}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Status"
                value={packageData.status}
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
                value={new Date(packageData.createdAt).toLocaleDateString()}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Updated At"
                value={new Date(packageData.updatedAt).toLocaleDateString()}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Trainer Name"
                value={packageData.trainerFullName}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  className="status-pill"
                  onClick={() => handleConfirmStatusChange(packageData.status)}
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    ...getStatusColor(packageData.status),
                    mt: 2,
                    borderRadius: "20px",
                    padding: "8px 16px",
                    maxWidth: "150px",
                    minWidth: "100px",
                  }}
                >
                  {packageData.status}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/trainer/service-edit/${packageId}`)}
                  startIcon={<EditIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: "20px",
                    bgcolor: "var(--accent-info)",
                    color: "var(--text-white)",
                    "&:hover": { bgcolor: "#1976d2" },
                    maxWidth: "150px",
                    minWidth: "100px",
                  }}
                >
                  Edit
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {/* Subscriptions Table */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "var(--text-primary)", mb: 2 }}
          >
            Subscriptions
          </Typography>
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
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    No
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    User Name
                  </TableCell>
                  <TableCell
                    sx={{ color: "var(--text-primary)", fontWeight: 600 }}
                  >
                    Email
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
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography sx={{ color: "var(--text-secondary)" }}>
                          No subscriptions found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub, index) => (
                    <TableRow key={sub.subscriptionId} hover>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {sub.userFullName}
                      </TableCell>
                      <TableCell sx={{ color: "var(--text-primary)" }}>
                        {sub.userEmail}
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
                          onClick={() => handleDetailOpen(sub)}
                          sx={{
                            borderRadius: "20px",
                            minWidth: "80px",
                            height: "36px",
                            padding: "6px 12px",
                            color: "var(--accent-info)",
                            borderColor: "var(--accent-info)",
                            "&:hover": {
                              bgcolor: "var(--background-light)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

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

        {/* Subscription Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={handleDetailClose}
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
                  label="Package Name"
                  value={selectedSubscription.packageName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Price"
                  value={`${selectedSubscription.packagePrice.toLocaleString()} VND`}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: "var(--background-white)" }}
                />
                <TextField
                  label="Duration (Days)"
                  value={selectedSubscription.packageDurationDays}
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
          <DialogActions
            sx={{
              bgcolor: "var(--background-light)",
              justifyContent: "center",
              pb: 2,
            }}
          >
            <Button
              onClick={handleDetailClose}
              variant="contained"
              sx={{
                borderRadius: "12px",
                bgcolor: "var(--accent-error)",
                color: "var(--text-white)",
                "&:hover": { bgcolor: "var(--primary-hover)" },
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
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowError(false)}
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
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSuccess(false)}
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

export default MyServiceDetailPage;
