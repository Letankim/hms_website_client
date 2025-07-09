import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Stack,
  Skeleton,
  MenuItem,
  Paper,
} from "@mui/material";
import { ArrowBack, Work as WorkIcon } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { SaveIcon } from "lucide-react";
import apiServicePackageService from "services/apiServicePackageService";
import AuthContext from "contexts/AuthContext";
import "./index.css";
import {
  showErrorFetchAPI,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusOptions = ["active", "inactive"];

const MyServiceEditPage = () => {
  const { packageId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState({
    packageId: 0,
    trainerId: 0,
    packageName: "",
    description: "",
    price: 0,
    durationDays: 0,
    status: "deleted",
    maxSubscribers: 0,
    currentSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
    } finally {
      setLoading(false);
    }
  }, [user, packageId]);

  useEffect(() => {
    fetchPackageDetails();
  }, [fetchPackageDetails]);

  const validateForm = (packageData) => {
    const errors = {};

    if (!packageData.packageName || !packageData.packageName.trim()) {
      errors.packageName = "Package name is required";
    } else if (
      packageData.packageName.length < 3 ||
      packageData.packageName.length > 255
    ) {
      errors.packageName = "Package name must be between 3 and 255 characters";
    }

    if (packageData.description && packageData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (
      packageData.durationDays == null ||
      isNaN(packageData.durationDays) ||
      packageData.durationDays <= 0
    ) {
      errors.durationDays = "Duration must be a positive number";
    }

    if (packageData.maxSubscribers != null) {
      if (isNaN(packageData.maxSubscribers) || packageData.maxSubscribers < 0) {
        errors.maxSubscribers =
          "Maximum subscribers must be a non-negative number";
      }
    }

    if (
      packageData.price == null ||
      isNaN(packageData.price) ||
      packageData.price < 0
    ) {
      errors.price = "Price must be a non-negative number";
    }

    if (
      packageData.trainerId == null ||
      isNaN(packageData.trainerId) ||
      packageData.trainerId <= 0
    ) {
      errors.trainerId = "Trainer ID must be a positive number";
    }

    if (
      packageData.status &&
      packageData.status !== "active" &&
      packageData.status !== "inactive"
    ) {
      errors.status = "Status must be either 'active' or 'inactive'";
    }

    return errors;
  };

  const handleSaveChanges = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const updatedData = {
        packageName: packageData.packageName,
        description: packageData.description,
        durationDays: parseInt(packageData.durationDays, 10),
        status: packageData.status,
        maxSubscribers: parseInt(packageData.maxSubscribers, 10),
      };
      const response = await apiServicePackageService.updatePackageByTrainer(
        packageId,
        updatedData
      );
      if (response.statusCode === 200) {
        showSuccessMessage("Package updated successfully.");
        setTimeout(() => navigate(`/my-service-detail/${packageId}`), 2000);
      } else {
        throw new Error("Failed to update package.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setPackageData((prev) => ({ ...prev, description: data }));
    setFormErrors((prev) => ({ ...prev, description: null }));
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
              Edit Service
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            Update details of this service package
          </Typography>
        </Box>

        {/* Edit Form */}
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{ p: 3, borderRadius: 2, bgcolor: "var(--background-white)" }}
          >
            <Stack spacing={2}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "var(--text-primary)" }}
              >
                Edit Package Information
              </Typography>
              <TextField
                label="Package ID"
                name="packageId"
                value={packageData.packageId}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Trainer ID"
                name="trainerId"
                value={packageData.trainerId}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Package Name"
                name="packageName"
                value={packageData.packageName}
                onChange={handleChange}
                fullWidth
                Koll
                variant="outlined"
                size="small"
                error={!!formErrors.packageName}
                helperText={formErrors.packageName}
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 500, color: "var(--text-primary)", mt: 1 }}
              >
                Description
              </Typography>
              <CKEditor
                editor={ClassicEditor}
                data={packageData.description}
                onChange={handleEditorChange}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "blockQuote",
                    "|",
                    "undo",
                    "redo",
                  ],
                }}
                sx={{ bgcolor: "var(--background-white)" }}
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
              <TextField
                label="Price"
                name="price"
                value={`${packageData.price.toLocaleString()} VND`}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Duration (Days)"
                name="durationDays"
                value={packageData.durationDays}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!formErrors.durationDays}
                helperText={formErrors.durationDays}
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Maximum Subscribers"
                name="maxSubscribers"
                value={packageData.maxSubscribers}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                error={!!formErrors.maxSubscribers}
                helperText={formErrors.maxSubscribers}
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                label="Current Subscribers"
                name="currentSubscribers"
                value={packageData.currentSubscribers || 0}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              />
              <TextField
                select
                label="Status"
                name="status"
                value={packageData.status}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ bgcolor: "var(--background-white)" }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  startIcon={<SaveIcon />}
                  sx={{
                    borderRadius: "5px",
                    bgcolor: "var(--primary-color)",
                    color: "var(--text-white)",
                    "&:hover": { bgcolor: "var(--primary-hover)" },
                    flex: 1,
                    maxWidth: "250px",
                    minWidth: "100px",
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate(`/trainer/service-detail/${packageId}`)
                  }
                  startIcon={<ArrowBack />}
                  sx={{
                    borderRadius: "5px",
                    color: "var(--accent-error)",
                    borderColor: "var(--accent-error)",
                    "&:hover": { bgcolor: "var(--background-light)" },
                    flex: 1,
                    maxWidth: "150px",
                    minWidth: "100px",
                  }}
                >
                  Back
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>

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

export default MyServiceEditPage;
