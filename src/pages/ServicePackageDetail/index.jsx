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
  IconButton,
  Skeleton,
  Paper,
  Rating,
  Divider,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  CardActionArea,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  CheckCircle,
  Schedule,
  Star,
  Person,
  FlashOn,
  LocalOffer,
  Email,
  Verified,
} from "@mui/icons-material";
import apiServicePackageService from "services/apiServicePackageService";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";

const ServicePackageDetail = () => {
  const { user } = useContext(AuthContext);
  const { packageId } = useParams();
  const [pkg, setPkg] = useState(null);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const fetchPackage = async () => {
    setLoading(true);
    try {
      const response = await apiServicePackageService.getPackageById(packageId);
      if (response.statusCode === 200 && response.data) {
        setPkg(response.data);
        fetchRelatedPackages(response.data.trainerId);
      } else {
        setError("Package not found.");
        setShowError(true);
      }
    } catch (e) {
      setError("Failed to load package details.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPackages = async (trainerId) => {
    setRelatedLoading(true);
    try {
      const response =
        await apiServicePackageService.getRelativePackageServiceByTrainer(
          trainerId,
          packageId,
          { PageNumber: 1, PageSize: 4 }
        );
      if (response.statusCode === 200 && response.data?.packages) {
        const filtered = response.data.packages.filter(
          (p) => p.packageId !== packageId
        );
        setRelatedPackages(filtered);
      }
    } catch (e) {
      console.error("Failed to load related packages:", e);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const handleBookNow = () => {
    if (!user) {
      setError("Please login before do this action.");
      setShowError(true);
      setTimeout(() => {
        navigate(`/login`);
      }, 1000);
    } else {
      navigate(`/checkout/${packageId}`);
    }
  };

  const handleBack = () => {
    navigate("services");
  };

  const handleRelatedPackageClick = (relatedPackageId) => {
    navigate("/service-packages/" + relatedPackageId);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const LoadingSkeleton = () => (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 3 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={250} />
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

  if (error && !pkg) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "error.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper sx={{ textAlign: "center", p: 6, borderRadius: 4 }}>
          <FlashOn sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleBack}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="lg" sx={{ py: 3, pt: "100px" }}>
        <Card sx={{ borderRadius: 4, overflow: "hidden", mb: 4, boxShadow: 4 }}>
          <Box
            sx={{
              height: 200,
              background:
                "linear-gradient(135deg, #1d88ec 0%, #114c84 50%, #9db2c6 100%)",
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
                  src={pkg.trainerAvatar}
                  alt={pkg.trainerFullName}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "4px solid white",
                    boxShadow: 2,
                  }}
                />
                <Verified
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "success.main",
                    borderRadius: "50%",
                    fontSize: 32,
                    color: "white",
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, color: "white" }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {pkg.packageName}
                </Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person fontSize="small" />
                    <Typography variant="h6">
                      by {pkg.trainerFullName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={4.8} precision={0.1} readOnly size="small" />
                    <Typography fontWeight="bold">4.8</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Package Info Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #1976d2, #1565c0)",
                    color: "white",
                    borderRadius: 3,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <CalendarToday />
                    <Typography fontWeight="bold">Duration</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {pkg.durationDays} Days
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
                    color: "white",
                    borderRadius: 3,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <CheckCircle />
                    <Typography fontWeight="bold">Status</Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {pkg.status}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #7b1fa2, #4a148c)",
                    color: "white",
                    borderRadius: 3,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <FlashOn />
                    <Typography fontWeight="bold">Price</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold">
                    {pkg.price.toLocaleString()} VND
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About This Package
              </Typography>
              <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 3 }}>
                <Typography
                  variant="body1"
                  sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
                >
                  {pkg.description}
                </Typography>
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBookNow}
                sx={{
                  flex: 1,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #228aeb, #0b64b7)",
                  borderRadius: 1,
                  "&:hover": {
                    background: "linear-gradient(135deg, #0b64b7, #228aeb)",
                    transform: "scale(1.02)",
                  },
                }}
              >
                Book Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 1,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                  },
                }}
              >
                Contact Trainer
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", width: "100%", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  Trainer Information
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={pkg.trainerAvatar}
                    alt={pkg.trainerFullName}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box>
                    <Typography fontWeight="bold">
                      {pkg.trainerFullName}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="#004D40">
                        {pkg.trainerEmail}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  Package Details
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Schedule color="action" />
                    <Typography>Duration: {pkg.durationDays} days</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Person color="action" />
                    <Typography>Personal training included</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle color="action" />
                    <Typography>Money-back guarantee</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  Warranty Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle color="action" />
                    <Typography>Warranty period: 30 days</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle color="action" />
                    <Typography>Full refund if unsatisfied</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle color="action" />
                    <Typography>Contact trainer for claims</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Related Packages */}
        {relatedPackages.length > 0 && (
          <Card
            sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 4, mt: 4 }}
          >
            <CardContent sx={{ p: 4, borderBottom: 1, borderColor: "divider" }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <LocalOffer color="primary" />
                <Typography variant="h5" fontWeight="bold">
                  More from {pkg.trainerFullName}
                </Typography>
              </Stack>
              <Typography color="text.secondary">
                Discover other training packages by this trainer
              </Typography>
            </CardContent>

            <CardContent sx={{ p: 4 }}>
              {relatedLoading ? (
                <Grid container spacing={3}>
                  {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={12} md={6} lg={3} key={i}>
                      <Paper sx={{ p: 3, borderRadius: 3, minHeight: 200 }}>
                        <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
                        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                        <Skeleton
                          variant="text"
                          height={20}
                          width="75%"
                          sx={{ mb: 2 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          height={40}
                          sx={{ borderRadius: 2 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {relatedPackages.map((relatedPkg) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={3}
                      key={relatedPkg.packageId}
                      className="package-wrapper"
                      sx={{ width: "100%" }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.03)",
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            handleRelatedPackageClick(relatedPkg.packageId)
                          }
                        >
                          <CardContent
                            sx={{
                              p: 3,
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="flex-start"
                              sx={{ mb: 2 }}
                            >
                              <Avatar
                                src={relatedPkg.trainerAvatar}
                                alt={relatedPkg.trainerFullName}
                                sx={{ width: 48, height: 48 }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.4,
                                    maxHeight: "2.8em",
                                  }}
                                >
                                  {relatedPkg.packageName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {relatedPkg.durationDays} days
                                </Typography>
                              </Box>
                            </Stack>

                            <div
                              sx={{
                                flex: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.5,
                                maxHeight: "4.5em",
                                mb: 2,
                                color: "#004D40",
                                fontSize: "0.875rem",
                                fontFamily:
                                  '"Roboto", "Helvetica", "Arial", sans-serif',
                              }}
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  relatedPkg.description
                                ),
                              }}
                            />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary"
                              >
                                {relatedPkg.price.toLocaleString()} VND
                              </Typography>
                              <Chip
                                label={relatedPkg.status}
                                color="success"
                                size="small"
                                sx={{ textTransform: "capitalize" }}
                              />
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

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
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicePackageDetail;
