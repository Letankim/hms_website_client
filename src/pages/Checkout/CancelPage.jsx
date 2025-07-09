import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileWarningIcon as Warning,
  RefreshCwIcon as Refresh,
  ArrowLeft,
} from "lucide-react";
import apiUserPaymentService from "services/apiUserPaymentService";
import AuthContext from "contexts/AuthContext";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";
import styles from "./CancelPage.module.css";

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
        showErrorFetchAPI(e);
        setError(e.message);
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
      fetchPaymentStatus(abortController.signal);
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

  if (error || !paymentDetails) {
    return (
      <div className={styles["error-container"]}>
        <div className={styles["error-paper"]}>
          <div className={styles["error-icon-wrapper"]}>
            <Warning className={styles["error-icon"]} />
          </div>
          <h1 className={styles["error-title"]}>Payment Error</h1>
          <p className={styles["error-message"]}>{error}</p>
          <div className={styles["error-actions"]}>
            <button
              className={styles["btn"] + " " + styles["btn-primary"]}
              onClick={() =>
                navigate(`/booking-services/checkout/${packageId}`)
              }
            >
              <Refresh className={styles["btn-icon"]} />
              Retry Payment
            </button>
            <button
              className={styles["btn"] + " " + styles["btn-secondary"]}
              onClick={() => navigate("/services")}
            >
              <ArrowLeft className={styles["btn-icon"]} />
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["cancel-page"]}>
      <div className={styles["container"]}>
        <div className={styles["cancel-card"]}>
          <div className={styles["cancel-header"]}>
            <div className={styles["header-content"]}>
              <Warning className={styles["warning-icon"]} />
              <div className={styles["header-text"]}>
                <h1 className={styles["main-title"]}>Payment Canceled</h1>
                <p className={styles["main-subtitle"]}>
                  Your payment for {paymentDetails.packageName} was not
                  completed.
                </p>
              </div>
            </div>
          </div>

          <div className={styles["cancel-content"]}>
            <h2 className={styles["section-title"]}>Payment Details</h2>
            <div className={styles["details-paper"]}>
              <div className={styles["details-stack"]}>
                <div className={styles["detail-item"]}>
                  <strong>Payment ID:</strong> {paymentDetails.paymentId}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Package:</strong> {paymentDetails.packageName}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Amount:</strong>{" "}
                  {paymentDetails.amount.toLocaleString()} VND
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Payment Method:</strong>{" "}
                  {paymentDetails.paymentMethod || "Bank Transfer"}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Status:</strong> {paymentDetails.status}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Cancellation Reason:</strong>{" "}
                  {paymentDetails.cancellationReason || "No reason provided"}
                </div>
                <div className={styles["detail-item"]}>
                  <strong>Trainer:</strong> {paymentDetails.trainerFullName} (
                  {paymentDetails.trainerEmail})
                </div>
              </div>
            </div>
            <div className={styles["action-buttons"]}>
              <button
                className={styles["btn"] + " " + styles["btn-primary"]}
                onClick={() =>
                  navigate(`/booking-services/checkout/${packageId}`)
                }
              >
                <Refresh className={styles["btn-icon"]} />
                Retry Payment
              </button>
              <button
                className={styles["btn"] + " " + styles["btn-secondary"]}
                onClick={() => navigate("/services")}
              >
                <ArrowLeft className={styles["btn-icon"]} />
                Back to Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
