import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Chip,
  Avatar,
  InputAdornment,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Edit as EditIcon,
  Lock as LockIcon,
  CameraAlt as CameraIcon,
  Phone as PhoneIcon,
  CheckCircle as StatusIcon,
  People as RolesIcon,
  CalendarToday as CreatedAtIcon,
  Login as LastLoginIcon,
  History as HistoryIcon,
  FitnessCenter as FitnessIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import AuthContext from "contexts/AuthContext";
import apiUserService from "services/apiUserService";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarSource, setAvatarSource] = useState("file");
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const weightHistory = [
    { date: "2025-06-01", weight: 70, bmi: 22.5 },
    { date: "2025-05-01", weight: 71, bmi: 22.8 },
    { date: "2025-04-01", weight: 72, bmi: 23.1 },
  ];
  const bodyMeasurements = {
    height: "175 cm",
    weight: "70 kg",
    bmi: "22.5",
    waist: "80 cm",
    chest: "95 cm",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiUserService.getUserActiveById(user.userId);
        if (!response.data) throw new Error("No user data received");
        setProfile(response.data);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (!user || !user.userId) {
      setError("You are not authorized to view this profile.");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("image/")) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarError("Please upload a valid image file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleUpdateAvatar = async () => {
    if (avatarSource === "file" && !newAvatarBase64) {
      setAvatarError("Please upload an image.");
      return;
    }
    if (avatarSource === "url" && !avatarUrl) {
      setAvatarError("Please enter a valid image URL.");
      return;
    }
    setAvatarLoading(true);
    setAvatarError(null);
    try {
      const avatarData = avatarSource === "file" ? newAvatarBase64 : avatarUrl;
      await apiUserService.updateAvatar(user.userId, avatarData);
      setAvatarDialogOpen(false);
      const response = await apiUserService.getUserActiveById(user.userId);
      setProfile(response.data);
      setSnackbar({
        open: true,
        message: "Avatar updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setAvatarError(err.response?.message || "Failed to update avatar.");
      setSnackbar({
        open: true,
        message: err.response?.message || "Failed to update avatar.",
        severity: "error",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCloseAvatarDialog = () => {
    setAvatarDialogOpen(false);
    setNewAvatarFile(null);
    setNewAvatarBase64("");
    setAvatarUrl("");
    setAvatarError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        marginTop: "100px",
      }}
    >
      <Grid container spacing={3} className="profile-container">
        <Grid item xs={12} md={12} sm={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2, width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
              Profile Actions
            </Typography>
            <List>
              <ListItem
                button
                onClick={() => handleNavigation("/profile/edit")}
              >
                <ListItemIcon>
                  <EditIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation("/profile/change-password")}
              >
                <ListItemIcon>
                  <LockIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation("/profile/weight-history")}
              >
                <ListItemIcon>
                  <HistoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Weight History" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleNavigation("/profile/body-measurements")}
              >
                <ListItemIcon>
                  <FitnessIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Body Measurements" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9} sm={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, width: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={profile.avatar}
                    alt={profile.fullName}
                    sx={{
                      width: 100,
                      height: 100,
                      border: "3px solid #1976d2",
                      mr: 3,
                    }}
                  >
                    {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <IconButton
                    onClick={() => setAvatarDialogOpen(true)}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 15,
                      bgcolor: "#1976d2",
                      color: "#fff",
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    <CameraIcon />
                  </IconButton>
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1976d2" }}
                  >
                    {profile.fullName || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#555" }}>
                    {profile.email || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PhoneIcon sx={{ color: "#43b72a", mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Phone:</strong> {profile.phone || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <StatusIcon sx={{ color: "#43b72a", mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Status:</strong>
                      <Chip
                        label={profile.status || "N/A"}
                        color={
                          profile.status === "active"
                            ? "success"
                            : profile.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <RolesIcon sx={{ color: "#43b72a", mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Roles:</strong>
                      {profile.roles && profile.roles.length > 0 ? (
                        profile.roles.map((role, index) => (
                          <Chip
                            key={index}
                            label={role}
                            size="small"
                            sx={{ ml: 1, bgcolor: "#e3f2fd", color: "#1976d2" }}
                          />
                        ))
                      ) : (
                        <span style={{ marginLeft: 8, color: "#888" }}>
                          No roles
                        </span>
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CreatedAtIcon sx={{ color: "#43b72a", mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Created At:</strong>{" "}
                      {formatDate(profile.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LastLoginIcon sx={{ color: "#43b72a", mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Last Login:</strong>{" "}
                      {formatDate(profile.lastLogin) || "Never"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Weight History */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2, color: "#1976d2" }}>
                Weight History
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                      <TableCell>BMI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weightHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.weight}</TableCell>
                        <TableCell>{entry.bmi}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Body Measurements */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2, color: "#1976d2" }}>
                Body Measurements
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(bodyMeasurements).map(([key, value]) => (
                  <Grid item xs={6} sm={4} key={key}>
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {key}
                      </Typography>
                      <Typography variant="h6">{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={avatarDialogOpen}
        onClose={handleCloseAvatarDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "#fff" }}>
          Update Your Avatar
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {avatarError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {avatarError}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
            <InputLabel>Avatar Source</InputLabel>
            <Select
              value={avatarSource}
              onChange={(e) => {
                setAvatarSource(e.target.value);
                setNewAvatarFile(null);
                setNewAvatarBase64("");
                setAvatarUrl("");
                setAvatarError(null);
              }}
              label="Avatar Source"
            >
              <MenuItem value="file">Upload File</MenuItem>
              <MenuItem value="url">Enter URL</MenuItem>
            </Select>
          </FormControl>
          {avatarSource === "file" ? (
            <Box>
              <Box
                {...getRootProps()}
                sx={{
                  border: "2px dashed #1976d2",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  bgcolor: isDragActive ? "#e3f2fd" : "#fff",
                  mb: 2,
                }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <Typography>Drop the image here...</Typography>
                ) : (
                  <Typography>
                    Drag & drop an image here, or click to select
                  </Typography>
                )}
              </Box>
              {newAvatarBase64 && (
                <Box sx={{ position: "relative", height: 300, mb: 2 }}>
                  <Cropper
                    image={newAvatarBase64}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(croppedArea, croppedAreaPixels) =>
                      setCroppedAreaPixels(croppedAreaPixels)
                    }
                  />
                </Box>
              )}
            </Box>
          ) : (
            <TextField
              label="Image URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CameraIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {(avatarSource === "file" && newAvatarBase64) ||
          (avatarSource === "url" && avatarUrl) ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Preview
              </Typography>
              <Avatar
                src={avatarSource === "file" ? newAvatarBase64 : avatarUrl}
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  border: "2px solid #1976d2",
                }}
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAvatarDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateAvatar}
            variant="contained"
            disabled={avatarLoading}
          >
            {avatarLoading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
