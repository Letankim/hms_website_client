import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
  Slide,
} from "@mui/material";
import { HealthAndSafety as HealthIcon } from "@mui/icons-material";
import apiUserService from "services/apiUserService";
import AuthContext from "contexts/AuthContext";
import "./editProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "",
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    action: null,
    xs: { zIndex: 1600 },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiUserService.getUserActiveById(user.userId);
        if (!response.data) {
          throw new Error("No user data received");
        }
        const {
          fullName = "",
          email = "",
          phone = "",
          status = "",
          roles = [],
        } = response.data;
        setFormData({ fullName, email, phone, status, roles });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Invalid phone number (10-15 digits)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const updateData = {
        userId: user.userId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: "active",
      };
      await apiUserService.updateUser(user.userId, updateData);
      setSnackbar({
        open: true,
        message: "Your profile has been updated successfully.",
        severity: "success",
        action: null,
        xs: { zIndex: 1600 },
      });
      setTimeout(() => {
        navigate(`/profile`);
      }, 1000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update profile.",
        severity: "error",
        action: null,
        xs: { zIndex: 1300 },
      });
    }
  };

  const handleCancel = () => {
    navigate(`/profile`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSnackbarAction = async () => {
    if (snackbar.action) {
      await snackbar.action();
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box className="edit-profile-loading">
        <CircularProgress className="loading-spinner" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="edit-profile-page-container">
        <Alert severity="error" className="edit-profile-error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="edit-profile-page-container">
      <Box className="edit-profile-page-header">
        <Typography variant="h4" className="header-title">
          Edit Your Health Profile
        </Typography>
      </Box>
      <Card className="edit-profile-card">
        <CardContent>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                value={formData.fullName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                fullWidth
                variant="outlined"
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon className="input-icon" />
                    </InputAdornment>
                  ),
                }}
                className="edit-profile-textfield"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                type="email"
                variant="outlined"
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon className="input-icon" />
                    </InputAdornment>
                  ),
                }}
                className="edit-profile-textfield"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                fullWidth
                variant="outlined"
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon className="input-icon" />
                    </InputAdornment>
                  ),
                }}
                className="edit-profile-textfield"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="section-label">
                Status
              </Typography>
              <Chip
                label={formData.status || "N/A"}
                color={
                  formData.status === "active"
                    ? "success"
                    : formData.status === "pending"
                    ? "warning"
                    : "error"
                }
                size="small"
                className="status-chip"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="section-label">
                Roles
              </Typography>
              <Box className="roles-container">
                {formData.roles && formData.roles.length > 0 ? (
                  formData.roles.map((role, index) => (
                    <Chip
                      key={index}
                      label={role}
                      size="small"
                      className="role-chip"
                    />
                  ))
                ) : (
                  <Typography variant="body2" className="no-roles">
                    No roles
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} className="button-container">
              <Button
                className="edit-profile-cancel-btn"
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="edit-profile-save-btn"
                variant="contained"
                onClick={handleSubmit}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
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
          className="snackbar-alert"
          action={
            snackbar.severity === "info" ? (
              <Button
                className="snackbar-confirm-btn"
                size="small"
                onClick={handleSnackbarAction}
              >
                Confirm
              </Button>
            ) : null
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
