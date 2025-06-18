import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  Skeleton,
  Paper,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import apiUserPaymentService from "services/apiUserPaymentService";
import AuthContext from "contexts/AuthContext";

const CancelPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const isMounted = useRef(true);

  const queryParams = new URLSearchParams(location.search);
  const paymentCode = queryParams.get("paymentCode");
  const packageId = queryParams.get("packageId");
  const subscriptionId = queryParams.get("subscription");

  const fetchPaymentStatus = async (signal) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Please login to view payment status.");
      }
      const response = await apiUserPaymentService.checkPaymentStatus(
        paymentCode,
        subscriptionId,
        signal
      );
      if (response.statusCode === 200 && response.data) {
        if (isMounted.current) {
          setPaymentDetails(response.data);
          if (response.data.status !== "CANCELLED") {
            throw new Error(
              `Payment is not canceled. Current status: ${response.data.status}`
            );
          }
        }
      } else {
        throw new Error("Failed to retrieve payment status.");
      }
    } catch (e) {
      if (e.name !== "AbortError" && isMounted.current) {
        setError(
          e.message || "An error occurred while checking payment status."
        );
        setShowError(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    isMounted.current = true;

    if (paymentCode && subscriptionId) {
      fetchPaymentStatus("CANCELLED");
    } else {
      setError("Invalid payment or subscription details.");
      setShowError(true);
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, []);

  const handleCloseError = () => {
    setShowError(false);
  };

  const LoadingSkeleton = () => (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 3 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent sx={{ p: 4 }}>
            <Skeleton variant="text" sx={{ fontSize: "2rem", mb: 2 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="50%" />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );

  if (loading) return <LoadingSkeleton />;

  if (error || !paymentDetails) {
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
            Payment Error
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate(`/booking-services/checkout/${packageId}`)}
            size="large"
            sx={{ borderRadius: 2, mr: 2 }}
          >
            Retry Payment
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate("/services")}
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Back to Services
          </Button>
        </Paper>
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
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="lg" sx={{ py: 3, pt: "100px" }}>
        <Card sx={{ borderRadius: 4, overflow: "hidden", mb: 4, boxShadow: 4 }}>
          <Box
            sx={{
              height: 200,
              background:
                "linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #ef5350 100%)",
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
                color: "white",
              }}
            >
              <Warning
                sx={{
                  fontSize: 60,
                  animation: "pulse 1.5s infinite",
                  "@keyframes pulse": {
                    "0%": { transform: "scale(1)", opacity: 1 },
                    "50%": { transform: "scale(1.2)", opacity: 0.7 },
                    "100%": { transform: "scale(1)", opacity: 1 },
                  },
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Payment Canceled
                </Typography>
                <Typography variant="h6">
                  Your payment for {paymentDetails.PackageName} was not
                  completed.
                </Typography>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#d32f2f"
            >
              Payment Details
            </Typography>
            <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 3, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant="body1">
                  <strong>Payment ID:</strong> {paymentDetails.paymentId}
                </Typography>
                <Typography variant="body1">
                  <strong>Package:</strong> {paymentDetails.packageName}
                </Typography>
                <Typography variant="body1">
                  <strong>Amount:</strong>{" "}
                  {paymentDetails.amount.toLocaleString()} VND
                </Typography>
                <Typography variant="body1">
                  <strong>Payment Method:</strong>{" "}
                  {paymentDetails.paymentMethod || "Bank Transfer"}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {paymentDetails.status}
                </Typography>
                <Typography variant="body1">
                  <strong>Cancellation Reason:</strong>{" "}
                  {paymentDetails.cancellationReason || "No reason provided"}
                </Typography>
                <Typography variant="body1">
                  <strong>Trainer:</strong> {paymentDetails.trainerFullName} (
                  {paymentDetails.trainerEmail})
                </Typography>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() =>
                navigate(`/booking-services/checkout/${packageId}`)
              }
              sx={{ borderRadius: 1, mr: 2 }}
            >
              Retry Payment
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={() => navigate("/services")}
              sx={{ borderRadius: 1 }}
            >
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </Container>

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

export default CancelPage;
