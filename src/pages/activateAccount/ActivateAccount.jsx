import styles from "./ActivateAccount.module.css";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Home,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import apiAuthService from "services/apiAuthService";

const ActivateAccount = () => {
  const [status, setStatus] = useState("loading");
  const [title, setTitle] = useState("Activating Your Account");
  const [message, setMessage] = useState(
    "Please wait while we verify and activate your account..."
  );
  const [countdown, setCountdown] = useState(8);
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const confettiRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userId = query.get("userId");
    const token = query.get("token");

    if (!userId || !token) {
      setStatus("error");
      setTitle("Invalid Activation Link");
      setMessage(
        "The activation link is invalid or has expired. Please request a new activation email."
      );
      return;
    }

    const activateAccount = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await apiAuthService.activate(userId, token);
        setStatus("success");
        setTitle("Welcome to HMS!");
        setMessage(
          "Your account has been successfully activated. You're now part of our healthy community!"
        );
        setShowSuccess(true);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      } catch (error) {
        setStatus("error");
        setTitle("Activation Failed");
        setMessage(
          error.message ||
            "We couldn't activate your account. Please try again or contact our support team for assistance."
        );
      }
    };

    activateAccount();
  }, [location, navigate]);

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className={styles["status-icon"]} />,
          className: "success",
          bgColor: "success-bg",
        };
      case "error":
        return {
          icon: <XCircle className={styles["status-icon"]} />,
          className: "error",
          bgColor: "error-bg",
        };
      default:
        return {
          icon: (
            <Loader2
              className={styles["status-icon"] + " " + styles["spinning"]}
            />
          ),
          className: "loading",
          bgColor: "loading-bg",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${styles["activate-page"]} ${styles[config.bgColor]}`}>
      <div className={styles["animated-background"]}>
        <div className={styles["shape"] + " " + styles["shape-1"]}></div>
        <div className={styles["shape"] + " " + styles["shape-2"]}></div>
        <div className={styles["shape"] + " " + styles["shape-3"]}></div>
        <div className={styles["shape"] + " " + styles["shape-4"]}></div>
        <div className={styles["shape"] + " " + styles["shape-5"]}></div>
      </div>

      {/* Main Content */}
      <div className={styles["main-content"]}>
        <div
          className={`${styles["activation-card"]} ${styles[config.className]}`}
        >
          {/* Header */}
          <div className={styles["card-header"]}>
            <div className={styles["icon-wrapper"]}>
              {config.icon}
              {status === "success" && (
                <div className={styles["success-ring"]}>
                  <div className={styles["success-ring-inner"]}></div>
                </div>
              )}
            </div>
            <h1 className={styles["card-title"]}>{title}</h1>
            <p className={styles["card-message"]}>{message}</p>
          </div>

          {/* Loading Progress */}
          {status === "loading" && (
            <div className={styles["loading-section"]}>
              <div className={styles["progress-wrapper"]}>
                <div className={styles["progress-bar"]}>
                  <div className={styles["progress-fill"]}></div>
                </div>
                <div className={styles["progress-dots"]}>
                  <span
                    className={styles["dot"] + " " + styles["dot-1"]}
                  ></span>
                  <span
                    className={styles["dot"] + " " + styles["dot-2"]}
                  ></span>
                  <span
                    className={styles["dot"] + " " + styles["dot-3"]}
                  ></span>
                </div>
              </div>
              <p className={styles["loading-text"]}>
                Verifying your information...
              </p>
            </div>
          )}

          {/* Success Content */}
          {status === "success" && (
            <div className={styles["success-section"]}>
              <div className={styles["countdown-section"]}>
                <p className={styles["countdown-text"]}>
                  Redirecting to login page in{" "}
                  <span className={styles["countdown-number"]}>
                    {countdown}
                  </span>{" "}
                  seconds
                </p>
                <div className={styles["countdown-bar"]}>
                  <div
                    className={styles["countdown-fill"]}
                    style={{ animationDuration: `${countdown}s` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles["action-section"]}>
            {status === "error" && (
              <button
                onClick={() => window.location.reload()}
                className={styles["btn"] + " " + styles["btn-secondary"]}
              >
                <RefreshCw className={styles["btn-icon"]} />
                Try Again
              </button>
            )}
            <a href="/" className={styles["btn"] + " " + styles["btn-primary"]}>
              <Home className={styles["btn-icon"]} />
              {status === "success" ? "Go to login" : "Back to Home"}
            </a>
          </div>
        </div>
      </div>

      {/* Success Confetti Effect */}
      {showSuccess && (
        <div ref={confettiRef} className={styles["confetti-container"]}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles["confetti-piece"]}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ["#f47c54", "#45653a", "#28a745", "#1976d2"][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivateAccount;
