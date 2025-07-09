import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Grid,
  Chip,
  Skeleton,
  Paper,
  Stack,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Email,
  Phone,
  Cake,
  Male,
  Female,
  Work,
  School,
  Link as LinkIcon,
  Description,
  CheckCircle,
  CalendarToday,
  Note,
  FitnessCenter as FitnessCenterIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiTrainerApplicationService from "services/apiTrainerApplicationService";
import "./index.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusColors = {
  pending: "#ff9800",
  approved: "var(--accent-success)",
  rejected: "var(--accent-error)",
  deleted: "var(--background-light)",
};

const TrainerApplicationDetail = () => {
  const { user } = useContext(AuthContext);
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response =
        await apiTrainerApplicationService.getApplicationApprovedByTrainerId(
          trainerId
        );
      if (response.statusCode === 200 && response.data) {
        setApplication(response.data);
      } else {
        showErrorMessage("Trainer application not found.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [trainerId]);

  const handleBack = () => {
    navigate("/services");
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const LoadingSkeleton = () => (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
        p: 3,
      }}
    >
      <Container maxWidth="lg">
        <Card
          sx={{ borderRadius: 4, boxShadow: "0 4px 12px var(--shadow-color)" }}
        >
          <Skeleton variant="rectangular" height={200} />
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ fontSize: "2rem", mb: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Box>
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="75%" />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );

  if (loading) return <LoadingSkeleton />;

  if (error && !application) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          sx={{
            textAlign: "center",
            p: 6,
            borderRadius: 4,
            bgcolor: "var(--background-white)",
            boxShadow: "0 4px 12px var(--shadow-color)",
          }}
        >
          <CheckCircle
            sx={{ fontSize: 80, color: "var(--accent-error)", mb: 2 }}
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "var(--text-primary)", mb: 2 }}
          >
            Oops! Something went wrong
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "var(--text-secondary)", mb: 3 }}
          >
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              borderRadius: 2,
              bgcolor: "var(--accent-error)",
              color: "var(--text-white)",
              "&:hover": { bgcolor: "var(--primary-hover)" },
            }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      className="trainer-application-detail-container"
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--background-white) 0%, var(--secondary-light) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6, pt: 12 }}>
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
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Trainer Application Details
            </Typography>
          </Stack>
          <Typography
            variant="h6"
            sx={{ color: "var(--text-secondary)", maxWidth: 600, mx: "auto" }}
          >
            View detailed information about{" "}
            {application ? application.fullName : "the trainer"}'s application
          </Typography>
        </Box>

        {/* Main Card */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 12px var(--shadow-color)",
            mb: 4,
            bgcolor: "var(--background-white)",
          }}
        >
          <Box
            sx={{
              height: 200,
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--secondary-light) 100%)",
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              p: 3,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "end", gap: 3, width: "100%" }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={
                    application?.profileImageUrl || "/placeholder-avatar.jpg"
                  }
                  alt={application?.fullName}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "4px solid var(--background-white)",
                    boxShadow: "0 2px 4px var(--shadow-color)",
                  }}
                />
                <CheckCircle
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "var(--accent-success)",
                    borderRadius: "50%",
                    fontSize: 32,
                    color: "var(--text-white)",
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, color: "var(--text-white)" }}>
                <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                  {application?.fullName}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person sx={{ color: "var(--text-white)" }} />
                    <Typography
                      variant="h6"
                      sx={{ color: "var(--text-white)" }}
                    >
                      Trainer Identity: #TRAINER{application?.userId}
                    </Typography>
                  </Stack>
                  <Chip
                    label={
                      application?.status.charAt(0).toUpperCase() +
                      application?.status.slice(1)
                    }
                    size="small"
                    sx={{
                      bgcolor: statusColors[application?.status],
                      color:
                        application?.status === "pending"
                          ? "var(--text-primary)"
                          : "var(--text-white)",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 4 }}>
            {/* Trainer Info Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "var(--background-white)",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Email sx={{ color: "var(--accent-info)" }} />
                    <Typography
                      sx={{ fontWeight: "bold", color: "var(--text-primary)" }}
                    >
                      Email
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {application?.email}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "var(--background-white)",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Phone sx={{ color: "var(--accent-info)" }} />
                    <Typography
                      sx={{ fontWeight: "bold", color: "var(--text-primary)" }}
                    >
                      Phone
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {application?.phoneNumber}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "var(--background-white)",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Cake sx={{ color: "var(--accent-info)" }} />
                    <Typography
                      sx={{ fontWeight: "bold", color: "var(--text-primary)" }}
                    >
                      Date of Birth
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    sx={{ color: "var(--text-primary)" }}
                  >
                    {new Date(application?.dateOfBirth).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Bio */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "var(--secondary-color)",
                  mb: 2,
                }}
              >
                Bio
              </Typography>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "var(--background-white)",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px var(--shadow-color)",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      application?.bio || "<i>No bio provided.</i>"
                    ),
                  }}
                />
              </Paper>
            </Box>

            {/* Additional Information */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                    bgcolor: "var(--background-white)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "var(--secondary-color)",
                        mb: 2,
                      }}
                    >
                      Personal Details
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {application?.gender === "male" ? (
                          <Male sx={{ color: "var(--accent-info)" }} />
                        ) : (
                          <Female sx={{ color: "var(--accent-info)" }} />
                        )}
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Gender:{" "}
                          {application?.gender.charAt(0).toUpperCase() +
                            application?.gender.slice(1)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Work sx={{ color: "var(--accent-info)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Experience: {application?.experienceYears} years
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                    bgcolor: "var(--background-white)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "var(--secondary-color)",
                        mb: 2,
                      }}
                    >
                      Professional Details
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <School sx={{ color: "var(--accent-info)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Specialties:{" "}
                          {application?.specialties || "None provided"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <CheckCircle sx={{ color: "var(--accent-info)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Certifications:{" "}
                          {application?.certifications || "None provided"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px var(--shadow-color)",
                    bgcolor: "var(--background-white)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "var(--secondary-color)",
                        mb: 2,
                      }}
                    >
                      Additional Information
                    </Typography>
                    <Stack spacing={2}>
                      {application?.cvFileUrl && (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Description sx={{ color: "var(--accent-info)" }} />
                          <Typography sx={{ color: "var(--text-primary)" }}>
                            CV:{" "}
                            <Link
                              href={application?.cvFileUrl}
                              target="_blank"
                              sx={{ color: "var(--accent-info)" }}
                            >
                              View CV
                            </Link>
                          </Typography>
                        </Stack>
                      )}
                      {application?.socialLinks && (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <LinkIcon sx={{ color: "var(--accent-info)" }} />
                          <Typography sx={{ color: "var(--text-primary)" }}>
                            Social Links:{" "}
                            <Link
                              href={application?.socialLinks}
                              target="_blank"
                              sx={{ color: "var(--accent-info)" }}
                            >
                              View Profile
                            </Link>
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <CalendarToday sx={{ color: "var(--accent-info)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Submitted At:{" "}
                          {new Date(application?.submittedAt).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <CheckCircle sx={{ color: "var(--accent-info)" }} />
                        <Typography sx={{ color: "var(--text-primary)" }}>
                          Reviewed At:{" "}
                          {application?.reviewedAt
                            ? new Date(application?.reviewedAt).toLocaleString()
                            : "Not reviewed"}
                        </Typography>
                      </Stack>
                      {application?.notes && (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Note sx={{ color: "var(--accent-info)" }} />
                          <Typography sx={{ color: "var(--text-primary)" }}>
                            Notes: {application?.notes}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Action Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBack}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 1,
                  bgcolor: "var(--accent-error)",
                  color: "var(--text-white)",
                  "&:hover": {
                    bgcolor: "var(--primary-hover)",
                    transform: "scale(1.02)",
                  },
                }}
              >
                Back to Services
              </Button>
            </Box>
          </CardContent>
        </Card>

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
      </Container>
    </Box>
  );
};

export default TrainerApplicationDetail;
