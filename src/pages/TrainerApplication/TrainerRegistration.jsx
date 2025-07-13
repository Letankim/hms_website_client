import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Input,
  IconButton,
  Stack,
  FormHelperText,
} from "@mui/material";
import {
  FitnessCenter as FitnessCenterIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiTrainerApplicationService from "services/apiTrainerApplicationService";
import { apiUploadImageCloudService } from "services/apiUploadImageCloudService";
import "./index.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

const TrainerRegistration = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    experienceYears: "",
    specialties: "",
    certifications: "",
    profileImageUrl: "",
    cvFileUrl: "",
    socialLinks: "",
    status: "pending",
  });
  const [imageType, setImageType] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [canApply, setCanApply] = useState(false);
  const [canApplyLoading, setCanApplyLoading] = useState(true);

  const checkCanApply = useCallback(async () => {
    if (!user?.userId) {
      showInfoMessage("Please login to submit an application.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setCanApplyLoading(true);
    try {
      const canApplyResult =
        await apiTrainerApplicationService.canApplyNewApplication();
      setCanApply(canApplyResult);
    } catch (e) {
      showErrorFetchAPI(e);
      setCanApply(false);
    } finally {
      setCanApplyLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    checkCanApply();
  }, [checkCanApply]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showErrorMessage(
          `Invalid image type. Only ${ALLOWED_TYPES.join(", ")} are allowed.`
        );
        setImageFile(null);
        setImagePreview("");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLinkChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, profileImageUrl: url }));
    setImagePreview(url);
    setImageFile(null);
  };

  const handleCvLinkChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, cvFileUrl: url }));
  };

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Full name is required.";
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      errors.fullName = "Full name must be between 2 and 100 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      errors.email = "Email is required.";
    } else if (formData.email.length > 100) {
      errors.email = "Email cannot exceed 100 characters.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format.";
    }

    const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (formData.phoneNumber.length > 20) {
      errors.phoneNumber = "Phone number cannot exceed 20 characters.";
    } else if (!formData?.phoneNumber.match(regexPhoneNumber)) {
      errors.phoneNumber = "Invalid phone number format.";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old.";
      }
    }

    if (formData.gender && formData.gender.length > 10) {
      errors.gender = "Gender cannot exceed 10 characters.";
    }

    if (formData.bio && formData.bio.length > 2000) {
      errors.bio = "Bio cannot exceed 2000 characters.";
    }

    if (
      formData.experienceYears !== undefined &&
      (formData.experienceYears < 0 || formData.experienceYears > 100)
    ) {
      errors.experienceYears = "Experience must be between 0 and 100 years.";
    }

    if (formData.specialties && formData.specialties.length > 2000) {
      errors.specialties = "Specialties cannot exceed 2000 characters.";
    }

    if (formData.certifications && formData.certifications.length > 1500) {
      errors.certifications = "Certifications cannot exceed 1500 characters.";
    }

    if (formData.profileImageUrl && formData.profileImageUrl.length > 255) {
      errors.profileImageUrl =
        "Profile image URL cannot exceed 255 characters.";
    }

    if (formData.cvFileUrl && formData.cvFileUrl.length > 500) {
      errors.cvFileUrl = "CV file URL cannot exceed 500 characters.";
    }

    if (formData.socialLinks && formData.socialLinks.length > 700) {
      errors.socialLinks = "Social links cannot exceed 700 characters.";
    }

    if (!formData.status?.trim()) {
      errors.status = "Status is required.";
    } else if (formData.status.length > 20) {
      errors.status = "Status cannot exceed 20 characters.";
    }

    if (formData.notes && formData.notes.length > 3000) {
      errors.notes = "Notes cannot exceed 3000 characters.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showInfoMessage("Please login to submit an application.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showErrorMessage("Please correct the form errors before submitting.");
      return;
    }
    setLoading(true);
    try {
      let profileImageUrl = formData.profileImageUrl;
      if (imageFile && imageType === "upload") {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);
        formDataImage.append("user", user.userId || "anonymous");
        const uploadResponse = await apiUploadImageCloudService.uploadImage(
          formDataImage
        );
        if (uploadResponse.isError) {
          setError(uploadResponse.message);
          setShowError(true);
          setLoading(false);
          return;
        }
        profileImageUrl = uploadResponse.imageUrl;
      }
      const applicationData = {
        ...formData,
        userId: user.userId,
        profileImageUrl,
        specialties: DOMPurify.sanitize(formData.specialties),
        certifications: DOMPurify.sanitize(formData.certifications),
        experienceYears: Number(formData.experienceYears),
      };
      const res = await apiTrainerApplicationService.createApplication(
        applicationData
      );
      if (res.statusCode === 201) {
        showSuccessMessage("Application submitted successfully!");
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
          bio: "",
          experienceYears: "",
          specialties: "",
          certifications: "",
          profileImageUrl: "",
          cvFileUrl: "",
          socialLinks: "",
          status: "pending",
        });
        setImageFile(null);
        setImagePreview("");
        setTimeout(() => navigate("/profile/application-history"), 2000);
      } else {
        showErrorMessage("Failed to submit application.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  if (canApplyLoading) {
    return (
      <Box
        className="trainer-application-container"
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canApply) {
    return (
      <Box
        className="trainer-application-container"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              bgcolor: "#FFF4D6",
              p: 3,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <WarningIcon sx={{ fontSize: 48, color: "#D97706" }} />{" "}
            <Typography variant="h5" sx={{ color: "#D97706", fontWeight: 500 }}>
              You're not eligible to submit a new application
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate("/profile/application-history")}
            >
              View Application History
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      className="trainer-application-container"
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
            <FitnessCenterIcon
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
              Apply to Become a Trainer
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            Submit your application to join our team of fitness trainers
          </Typography>
        </Box>

        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ maxWidth: 900, mx: "auto", p: 3 }}
        >
          <TextField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            error={!!formErrors.fullName}
            helperText={formErrors.fullName}
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            error={!!formErrors.email}
            helperText={formErrors.email}
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
          />

          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.dateOfBirth}
            helperText={formErrors.dateOfBirth}
          />

          <FormControl
            fullWidth
            margin="normal"
            required
            error={!!formErrors.gender}
          >
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              label="Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {formErrors.gender && (
              <FormHelperText>{formErrors.gender}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />

          <TextField
            label="Years of Experience"
            name="experienceYears"
            type="number"
            value={formData.experienceYears}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 0 }}
            error={!!formErrors.experienceYears}
            helperText={formErrors.experienceYears}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">Specialties</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={formData.specialties}
              onChange={(event, editor) =>
                setFormData((prev) => ({
                  ...prev,
                  specialties: editor.getData(),
                }))
              }
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">Certifications</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={formData.certifications}
              onChange={(event, editor) =>
                setFormData((prev) => ({
                  ...prev,
                  certifications: editor.getData(),
                }))
              }
            />
          </Box>

          <TextField
            label="CV URL"
            name="cvFileUrl"
            value={formData.cvFileUrl}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="https://3docorp.vn/my-cv.pdf"
            error={!!formErrors.cvFileUrl}
            helperText={formErrors.cvFileUrl}
          />

          <TextField
            label="Social Links"
            name="socialLinks"
            value={formData.socialLinks}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="https://linkedin.com/in/username"
          />

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Submit Application"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/my-applications")}
            >
              Cancel
            </Button>
          </Box>
        </Box>

        {/* Snackbars */}
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

export default TrainerRegistration;
