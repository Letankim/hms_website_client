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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
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
    avatar: "",
    gender: "",
    birthDate: "",
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
          avatar = "",
          gender = "",
          birthDate = "",
          status = "",
          roles = [],
        } = response.data;
        setFormData({
          fullName,
          email,
          phone,
          gender,
          avatar,
          birthDate: birthDate
            ? new Date(birthDate).toISOString().split("T")[0]
            : "",
          status,
          roles,
        });
      } catch (err) {
        showErrorFetchAPI(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const validateForm = () => {
    const errors = {};

    // Full Name
    if (!formData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.length > 255) {
      errors.fullName = "Full name cannot exceed 255 characters";
    }

    // Phone
    const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (formData.phone && formData.phone.length > 20) {
      errors.phone = "Phone number cannot exceed 20 characters.";
    } else if (formData.phone && !formData.phone.match(regexPhoneNumber)) {
      errors.phone = "Invalid phone number format.";
    }

    // Gender
    if (formData.gender && formData.gender.length > 10) {
      errors.gender = "Gender cannot exceed 10 characters.";
    }

    // Birth Date
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        errors.birthDate = "You must be at least 18 years old.";
      }
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
        phone: formData.phone || null,
        gender: formData.gender || null,
        birthDate: formData.birthDate || null,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
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
              variant="h4"
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
            variant="body1"
            sx={{
              color: "var(--text-secondary)",
              maxWidth: 600,
              mx: "auto",
              px: 1,
            }}
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
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleInputChange}
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
                  name="email"
                  value={formData.email || ""}
                  disabled
                  fullWidth
                  type="email"
                  variant="outlined"
                  helperText="Email cannot be changed."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HealthIcon sx={{ color: "var(--accent-info)" }} />
                      </InputAdornment>
                    ),
                    readOnly: true,
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
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
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
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.gender}
                >
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formErrors.gender && (
                    <FormHelperText>{formErrors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Date of Birth"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.birthDate}
                  helperText={formErrors.birthDate}
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={submitting}
                    fullWidth
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "2px !important",
                      borderWidth: 2,
                      minHeight: 48,
                      minWidth: 120,
                      fontSize: "1rem",
                      flexGrow: 1,
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
                    fullWidth
                    sx={{
                      fontWeight: "bold",
                      borderRadius: "2px !important",
                      minHeight: 48,
                      minWidth: 120,
                      fontSize: "1rem",
                      flexGrow: 1,
                      bgcolor: "var(--accent-info)",
                      color: "var(--text-white)",
                      "&:hover": { bgcolor: "var(--primary-hover)" },
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
