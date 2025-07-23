import { useContext, useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Skeleton,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Backdrop,
} from "@mui/material";
import {
  CalendarToday,
  FlashOn,
  Person,
  Verified,
  ShoppingCart,
  CheckCircle,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import apiServicePackageService from "services/apiServicePackageService";
import apiUserPaymentService from "services/apiUserPaymentService";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import DOMPurify from "dompurify";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeInOut = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

// Styled components for loading
const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.modal + 1,
  background:
    "linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(17, 76, 132, 0.95) 50%, rgba(157, 178, 198, 0.95) 100%)",
  backdropFilter: "blur(10px)",
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "2rem",
});

const LogoContainer = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LogoImage = styled("img")({
  width: "120px",
  height: "120px",
  objectFit: "contain",
  animation: `${pulse} 2s ease-in-out infinite`,
  filter: "drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3))",
});

const LoadingRing = styled(Box)({
  position: "absolute",
  width: "160px",
  height: "160px",
  border: "3px solid rgba(255, 255, 255, 0.2)",
  borderTop: "3px solid rgba(255, 255, 255, 0.8)",
  borderRadius: "50%",
  animation: `${rotate} 1.5s linear infinite`,
});

const LoadingDots = styled(Box)({
  display: "flex",
  gap: "8px",
  marginTop: "1rem",
});

const Dot = styled(Box)(({ delay }) => ({
  width: "12px",
  height: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: "50%",
  animation: `${fadeInOut} 1.5s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && {
    color: "#00695C",
  }),
  ...(ownerState.completed && {
    color: "#004D40",
  }),
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;
  const icons = {
    1: <ShoppingCart />,
    2: <Person />,
    3: <CheckCircle />,
  };
  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {icons[String(props.icon)]}
    </QontoStepIconRoot>
  );
}

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("BankTransfer");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchPackage = async () => {
    setLoading(true);
    try {
      const response = await apiServicePackageService.getPackageById(packageId);
      if (response.statusCode === 200 && response.data) {
        setPkg(response.data);
      } else {
        showErrorMessage("Package not found.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const handleSubscribe = async () => {
    if (!isConfirmed) {
      showErrorMessage(
        "Please confirm the subscription terms before proceeding."
      );
      return;
    }
    if (!paymentMethod) {
      showErrorMessage("Please select a payment method.");
      return;
    }
    if (!user) {
      showInfoMessage("Please login before subscribing.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const purchaseDto = {
        packageId: Number.parseInt(packageId),
        paymentMethod,
      };
      const response = await apiUserPaymentService.subscribeToPackage(
        purchaseDto
      );
      if (response.statusCode === 201 && response.data.paymentLink) {
        window.location.href = response.data.paymentLink;
      } else {
        showErrorMessage("Failed to initiate payment. Please try again.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const LoadingSkeleton = () => (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 3 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
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

  if (error || !pkg) {
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
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate("/services")}
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
    <>
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Container maxWidth="lg" sx={{ py: 3, pt: "100px" }}>
          <Card
            sx={{ borderRadius: 4, overflow: "hidden", mb: 4, boxShadow: 4 }}
          >
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
                sx={{
                  display: "flex",
                  alignItems: "end",
                  gap: 3,
                  width: "100%",
                }}
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
                    Checkout - {pkg.packageName}
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person fontSize="small" />
                      <Typography variant="h6">
                        by {pkg.trainerFullName}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 4 }}>
              {/* Step Progress Tracker */}
              <Stepper
                alternativeLabel
                activeStep={2}
                connector={<QontoConnector />}
                sx={{ mb: 4 }}
              >
                <Step>
                  <StepLabel StepIconComponent={QontoStepIcon}>
                    Package Selection
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel StepIconComponent={QontoStepIcon}>
                    Trainer Details
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel StepIconComponent={QontoStepIcon}>
                    Confirmation
                  </StepLabel>
                </Step>
              </Stepper>
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
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  About This Package
                </Typography>
                <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        pkg.description || "<i>No description provided.</i>"
                      ),
                    }}
                  ></Typography>
                </Paper>
              </Box>
              {/* Payment Method Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  Payment Method
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="payment-method-label">
                    Select Payment Method
                  </InputLabel>
                  <Select
                    labelId="payment-method-label"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Select Payment Method"
                    className="modern-select"
                  >
                    <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* Payment Safety Information */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="#00695C"
                >
                  Payment Safety Information
                </Typography>
                <Typography variant="body1" color="#004D40">
                  - All transactions are secured with 256-bit SSL encryption.
                </Typography>
                <Typography variant="body1" color="#004D40" sx={{ mt: 1 }}>
                  - Your payment details are never stored on our servers.
                </Typography>
                <Typography variant="body1" color="#004D40" sx={{ mt: 1 }}>
                  - We comply with PCI DSS standards for secure payments.
                </Typography>
              </Box>
              {/* Confirmation */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    color="primary"
                  />
                }
                label="I agree to the terms and conditions"
                sx={{ color: "#004D40", mb: 2 }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleSubscribe}
                sx={{
                  background: "linear-gradient(135deg, #228aeb, #0b64b7)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0b64b7, #228aeb)",
                  },
                  borderRadius: 1,
                }}
                disabled={!isConfirmed || !paymentMethod || isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Confirm Subscription"}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <LoadingOverlay open={isProcessingPayment}>
        <LoadingContainer>
          <LogoContainer>
            <LoadingRing />
            <LogoImage
              src="/logo_loading_.png"
              alt="Loading..."
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </LogoContainer>

          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: "bold",
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Processing Payment
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 400,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Please wait while we redirect you to the payment gateway
            </Typography>

            <LoadingDots>
              <Dot delay={0} />
              <Dot delay={0.2} />
              <Dot delay={0.4} />
            </LoadingDots>
          </Box>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              🔒 Your transaction is secured with SSL encryption
            </Typography>
          </Box>
        </LoadingContainer>
      </LoadingOverlay>
    </>
  );
};

export default CheckoutPage;
