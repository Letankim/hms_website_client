import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { HealthAndSafety as HealthIcon } from "@mui/icons-material";
import apiAuthService from "services/apiAuthService";
import AuthContext from "contexts/AuthContext";
import "./changePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    action: null,
    xs: { zIndex: 1600 },
  });

  if (!user || !user.username) {
    return (
      <Box className="change-password-page-container">
        <Alert severity="error" className="change-password-error">
          Unauthorized access or missing user information.
        </Alert>
      </Box>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (otpSent && !formData.otpCode) {
      errors.otpCode = "OTP code is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOTP = async () => {
    setOtpLoading(true);
    setError(null);
    try {
      await apiAuthService.changePassword(user.username);
      setOtpSent(true);
      setSnackbar({
        open: true,
        message: "An OTP has been sent to your email. Please check your inbox.",
        severity: "success",
        action: null,
      });
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP.");
      setSnackbar({
        open: true,
        message: err.message || "Failed to send OTP.",
        severity: "error",
        action: null,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    setSnackbar({
      open: true,
      message: "Do you want to update your password?",
      severity: "info",
      action: async () => {
        setLoading(true);
        setError(null);
        try {
          const resetData = {
            email: user.username,
            otpCode: formData.otpCode,
            newPassword: formData.newPassword,
          };
          await apiAuthService.resetPassword(resetData);
          setSnackbar({
            open: true,
            message: "Your password has been updated successfully.",
            severity: "success",
            action: null,
          });
          navigate(`/profile`);
        } catch (err) {
          console.error("Error resetting password:", err);
          setError(err.message || "Failed to change password.");
          setSnackbar({
            open: true,
            message: err.message || "Failed to change password.",
            severity: "error",
            action: null,
          });
        } finally {
          setLoading(false);
        }
      },
    });
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

  return (
    <Box className="change-password-page-container">
      <Box className="change-password-page-header">
        <Typography variant="h4" color="#1877f2" fontWeight={800}>
          Change Your Password
        </Typography>
      </Box>
      <Card className="change-password-card">
        <CardContent>
          {error && (
            <Alert severity="error" className="change-password-error">
              {error}
            </Alert>
          )}
          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
              <TextField
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                fullWidth
                variant="outlined"
                error={!!formErrors.newPassword}
                helperText={formErrors.newPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon sx={{ color: "#43b72a" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: "100%", sm: 200 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                fullWidth
                variant="outlined"
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HealthIcon sx={{ color: "#43b72a" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: "100%", sm: 200 } }}
              />
            </Grid>
            {otpSent && (
              <Grid item xs={12}>
                <TextField
                  label="OTP Code"
                  value={formData.otpCode}
                  onChange={(e) =>
                    setFormData({ ...formData, otpCode: e.target.value })
                  }
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.otpCode}
                  helperText={formErrors.otpCode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HealthIcon sx={{ color: "#43b72a" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 200 } }}
                />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                className="change-password-cancel-btn"
                variant="outlined"
                color="primary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                {!otpSent && (
                  <Button
                    className="change-password-otp-btn"
                    variant="contained"
                    color="secondary"
                    onClick={handleSendOTP}
                    disabled={otpLoading || loading}
                  >
                    {otpLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}
                <Button
                  className="change-password-submit-btn"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || otpLoading || !otpSent}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
          action={
            snackbar.severity === "info" ? (
              <Button
                color="inherit"
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
