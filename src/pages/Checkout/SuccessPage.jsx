import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Sparkles, Dumbbell, Target, View } from "lucide-react";
import styles from "./SuccessPage.module.css";
import apiUserPaymentService from "services/apiUserPaymentService";
import AuthContext from "contexts/AuthContext";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

const SuccessPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

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
        setTimeout(() => setShowConfetti(true), 500);
      } else {
        throw new Error("Failed to retrieve payment status.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setError(e.message);
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
    <div className={styles["loading-container"]}>
      <div className={styles["container"]}>
        <div className={styles["loading-card"]}>
          <div className={styles["skeleton-header"]}></div>
          <div className={styles["skeleton-content"]}>
            <div className={styles["skeleton-title"]}></div>
            <div className={styles["skeleton-line"]}></div>
            <div className={styles["skeleton-line"]}></div>
            <div
              className={
                styles["skeleton-line"] + " " + styles["skeleton-line-short"]
              }
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (!error || !paymentDetails) {
    return (
      <div className={styles["error-container"]}>
        <div className={styles["error-paper"]}>
          <div className={styles["error-icon-wrapper"]}>
            <CheckCircle className={styles["error-icon"]} />
          </div>
          <h1 className={styles["error-title"]}>Payment Error</h1>
          <p className={styles["error-message"]}>{error}</p>
          <div className={styles["error-actions"]}>
            <button
              className={styles["btn"] + " " + styles["btn-primary"]}
              onClick={() => navigate(`/checkout/${packageId}`)}
            >
              Retry Payment
            </button>
            <button
              className={styles["btn"] + " " + styles["btn-secondary"]}
              onClick={() => navigate("/services")}
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["success-page"]}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div ref={confettiRef} className={styles["confetti-container"]}>
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className={styles["confetti-piece"]}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: [
                  "#2e7d32",
                  "#4caf50",
                  "#66bb6a",
                  "#81c784",
                  "#a5d6a7",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <div className={styles["container"]}>
        <div className={styles["success-card"]}>
          <div className={styles["success-header"]}>
            <div className={styles["header-content"]}>
              <CheckCircle className={styles["success-icon"]} />
              <div className={styles["header-text"]}>
                <h1 className={styles["main-title"]}>Payment Successful!</h1>
                <p className={styles["main-subtitle"]}>
                  Thank you for subscribing to {paymentDetails?.packageName}
                </p>
              </div>
            </div>
          </div>

          <div className={styles["success-content"]}>
            <h2 className={styles["section-title"]}>Payment Details</h2>
            <div className={styles["details-paper"]}>
              <div className={styles["details-stack"]}>
                <div className={styles["detail-item"]}>
                  <strong>Payment ID:</strong> {paymentDetails?.paymentId}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Package:</strong> {paymentDetails?.packageName}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Amount:</strong>{" "}
                  {paymentDetails?.amount.toLocaleString()} VND
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Payment Method:</strong>{" "}
                  {paymentDetails?.paymentMethod || "Bank Transfer"}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Transaction Reference:</strong>{" "}
                  {paymentDetails?.transactions[0]?.reference}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Payment Date:</strong>{" "}
                  {new Date(paymentDetails?.createdAt).toLocaleString()}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Status:</strong> {paymentDetails?.status}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Trainer:</strong> {paymentDetails?.trainerFullName} (
                  {paymentDetails?.trainerEmail})
                </div>
              </div>
            </div>

            {/* Success Features */}
            <div className={styles["success-features"]}>
              <div className={styles["feature-item"]}>
                <Target className={styles["feature-icon"]} />
                <div className={styles["feature-content"]}>
                  <h4>Access Granted</h4>
                  <p>Your subscription is now active</p>
                </div>
              </div>

              <div className={styles["feature-item"]}>
                <Dumbbell className={styles["feature-icon"]} />
                <div className={styles["feature-content"]}>
                  <h4>Expert Training</h4>
                  <p>Connect with your assigned trainer</p>
                </div>
              </div>
            </div>

            <div className={styles["action-buttons"]}>
              <button
                className={styles["btn"] + " " + styles["btn-primary"]}
                onClick={() => navigate("/services")}
              >
                <Sparkles className={styles["btn-icon"]} />
                Explore More Services
              </button>
              <button
                className={styles["btn"] + " " + styles["btn-secondary"]}
                onClick={() => {
                  navigate(
                    `/my-subscriptions?subscriptionId=${paymentDetails?.subscriptionId}&open=true`
                  );
                }}
              >
                <View className={styles["btn-icon"]} />
                View Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Celebration Card */}
        <div className={styles["celebration-card"]}>
          <div className={styles["celebration-header"]}>
            <Sparkles className={styles["celebration-icon"]} />
            <h3>Welcome to Your Fitness Journey!</h3>
          </div>
          <p className={styles["celebration-text"]}>
            You're now part of our premium fitness community. Get ready to
            achieve your health and wellness goals with expert guidance and
            personalized training programs.
          </p>
          <div className={styles["celebration-stats"]}>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-number"]}>24/7</span>
              <span className={styles["stat-label"]}>Support Available</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-number"]}>100+</span>
              <span className={styles["stat-label"]}>Workout Programs</span>
            </div>
            <div className={styles["stat-item"]}>
              <span className={styles["stat-number"]}>50+</span>
              <span className={styles["stat-label"]}>Expert Trainers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
