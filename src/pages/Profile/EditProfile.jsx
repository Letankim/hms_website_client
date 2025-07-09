import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
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
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  HealthAndSafety as HealthIcon,
} from "@mui/icons-material";
import apiUserService from "services/apiUserService";
import AuthContext from "contexts/AuthContext";
import "./index.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const EditProfile = () => {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.userId) {
        setLoading(false);
        showErrorMessage("You are not authorized to edit this profile.");
        return;
      }

      setLoading(true);
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
        showErrorFetchAPI(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const validateForm = () => {
    const errors = {};
    const {
      fullName,
      email,
      phone,
      gender,
      birthDate,
      avatar,
      status,
      levelAccount,
      experience,
      currentStreak,
    } = formData;

    // Full Name
    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (fullName.length > 255) {
      errors.fullName = "Full name cannot exceed 255 characters";
    }

    // Email
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = "Invalid email format";
    } else if (email.length > 255) {
      errors.email = "Email cannot exceed 255 characters";
    }

    // Phone
    const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required.";
    } else if (formData.phoneNumber.length > 20) {
      errors.phone = "Phone number cannot exceed 20 characters.";
    } else if (!formData?.phone.match(regexPhoneNumber)) {
      errors.phone = "Invalid phone number format.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const updateData = {
        userId: user.userId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status || "active",
      };

      await apiUserService.updateUser(user.userId, updateData);
      showSuccessMessage("Your profile has been updated successfully.");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "var(--accent-info)" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          p: 4,
        }}
      >
        <Container maxWidth="md">
          <Alert
            severity="error"
            sx={{
              bgcolor: "var(--accent-error)",
              color: "var(--text-white)",
              boxShadow: 6,
              variant: "filled",
            }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      className="edit-profile-container"
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6, pt: "100px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <PersonIcon
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
              }}
            >
              Edit Profile
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            Update your personal information to keep your profile current
          </Typography>
        </Box>

        {/* Form Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px var(--shadow-color)",
            bgcolor: "var(--background-white)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
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
                        <HealthIcon sx={{ color: "var(--accent-info)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "var(--background-white)",
                      "&:hover fieldset": { borderColor: "var(--accent-info)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--accent-info)",
                      },
                    },
                  }}
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
                        <HealthIcon sx={{ color: "var(--accent-info)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "var(--background-white)",
                      "&:hover fieldset": { borderColor: "var(--accent-info)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--accent-info)",
                      },
                    },
                  }}
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
                        <HealthIcon sx={{ color: "var(--accent-info)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "var(--background-white)",
                      "&:hover fieldset": { borderColor: "var(--accent-info)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--accent-info)",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "var(--text-primary)", mb: 1 }}
                >
                  Status
                </Typography>
                <Chip
                  label={formData.status || "N/A"}
                  color={getStatusColor(formData.status)}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor:
                      formData.status?.toLowerCase() === "active"
                        ? "var(--accent-success)"
                        : formData.status?.toLowerCase() === "pending"
                        ? "#ff9800"
                        : formData.status?.toLowerCase() === "inactive"
                        ? "var(--accent-error)"
                        : "var(--background-light)",
                    color:
                      formData.status?.toLowerCase() === "pending"
                        ? "var(--text-primary)"
                        : "var(--text-white)",
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "var(--text-primary)", mb: 1 }}
                >
                  Roles
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.roles?.length > 0 ? (
                    formData.roles.map((role, index) => (
                      <Chip
                        key={index}
                        label={role}
                        size="small"
                        sx={{
                          color: "var(--text-primary)",
                          borderColor: "var(--accent-info)",
                          bgcolor: "var(--background-white)",
                        }}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-secondary)" }}
                    >
                      No roles
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={submitting}
                    sx={{
                      fontWeight: "bold",
                      borderRadius: 1,
                      borderWidth: 2,
                      color: "var(--accent-error)",
                      borderColor: "var(--accent-error)",
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: "rgba(220, 53, 69, 0.04)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "var(--accent-info)",
                      color: "var(--text-white)",
                      "&:hover": { bgcolor: "var(--primary-hover)" },
                      borderRadius: 1,
                    }}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ zIndex: 1600 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              bgcolor:
                snackbar.severity === "success"
                  ? "var(--accent-success)"
                  : "var(--accent-error)",
              color: "var(--text-white)",
              boxShadow: 6,
              variant: "filled",
              borderRadius: 2,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default EditProfile;
