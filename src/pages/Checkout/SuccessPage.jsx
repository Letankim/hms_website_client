import React, { useContext, useEffect, useState } from "react";
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
import { CheckCircle, Celebration } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import apiUserPaymentService from "services/apiUserPaymentService";
import AuthContext from "contexts/AuthContext";

const SuccessPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const paymentCode = queryParams.get("paymentCode");
  const packageId = queryParams.get("packageId");
  const subscriptionId = queryParams.get("subscription");

  const fetchPaymentStatus = async () => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Please login to view payment status.");
      }
      const response = await apiUserPaymentService.checkPaymentStatus(
        paymentCode,
        subscriptionId,
        "PAID"
      );
      if (response.statusCode === 200 && response.data) {
        setPaymentDetails(response.data);
        if (response.data.status !== "PAID") {
          throw new Error(
            "Payment is not successful. Current status: " + response.data.status
          );
        }
      } else {
        throw new Error("Failed to retrieve payment status.");
      }
    } catch (e) {
      setError(e.message || "An error occurred while checking payment status.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentCode, subscriptionId]);

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
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={250}
      />
      <Container maxWidth="lg" sx={{ py: 3, pt: "100px" }}>
        <Card sx={{ borderRadius: 4, overflow: "hidden", mb: 4, boxShadow: 4 }}>
          <Box
            sx={{
              height: 200,
              background:
                "linear-gradient(135deg, #2e7d32 0%, #1b5e20 50%, #4caf50 100%)",
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
              <CheckCircle sx={{ fontSize: 60 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Payment Successful!
                </Typography>
                <Typography variant="h6">
                  Thank you for subscribing to {paymentDetails.packageName}
                </Typography>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="#2e7d32"
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
                  <strong>Transaction Reference:</strong>{" "}
                  {paymentDetails.transactions[0].reference}
                </Typography>
                <Typography variant="body1">
                  <strong>Payment Date:</strong>{" "}
                  {new Date(paymentDetails.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {paymentDetails.status}
                </Typography>
                <Typography variant="body1">
                  <strong>Trainer:</strong> {paymentDetails.trainerFullName} (
                  {paymentDetails.trainerEmail})
                </Typography>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/services")}
              sx={{
                background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
                },
                borderRadius: 1,
              }}
            >
              Explore More Services
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

export default SuccessPage;
