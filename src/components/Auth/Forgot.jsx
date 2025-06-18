import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Forgot.css";
import apiAuthService from "services/apiAuthService";
import { Home2 } from "iconsax-react";

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "#F44336",
  });
  const [showResetForm, setShowResetForm] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const resendInterval = useRef(null);
  const [resendTimer, setResendTimer] = useState(0);

  const showError = (msg) => {
    setSnackbar({ open: true, message: msg, color: "#F44336" });
    setTimeout(
      () => setSnackbar({ open: false, message: "", color: "#F44336" }),
      3000
    );
  };
  const showSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, color: "#43A047" });
    setTimeout(
      () => setSnackbar({ open: false, message: "", color: "#43A047" }),
      3000
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoadingSend(true);
    try {
      await apiAuthService.forgotPassword(email);
      showSuccess("Check your email for reset instructions.");
      setShowResetForm(true);
      setResendTimer(120);
      if (resendInterval.current) clearInterval(resendInterval.current);
      resendInterval.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(resendInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to send reset link",
        color: "#F44336",
      });
    } finally {
      setLoadingSend(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    if (!otpCode.trim()) {
      setResetError("OTP code is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setLoadingReset(true);
    try {
      await apiAuthService.resetPassword({ email, otpCode, newPassword });
      showSuccess("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to send reset link",
        color: "#F44336",
      });
    } finally {
      setLoadingReset(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await apiAuthService.forgotPassword(email);
      showSuccess("OTP resent! Check your email.");
      setResendTimer(120);
      if (resendInterval.current) clearInterval(resendInterval.current);
      resendInterval.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(resendInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      showError(err?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-form-block">
          <Link to="/" className="auth-home-btn">
            <Home2 size="20" color="#FF8A65" />
            <span>Home</span>
          </Link>
          <h2 className="auth-title">
            <span className="auth-title-dot"></span>Forgot Password
          </h2>
          <p className="auth-desc">Enter your email to reset your password</p>
          {!showResetForm ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="auth-input"
              />
              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loadingSend}
              >
                {loadingSend ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="spinner"
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid #fff",
                        borderTop: "2px solid #F47C54",
                        borderRadius: "50%",
                        marginRight: 8,
                        animation: "spin 1s linear infinite",
                      }}
                    ></span>
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <label htmlFor="otpCode">OTP Code</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  className="auth-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{
                    padding: "0.7rem 1.2rem",
                    minWidth: 120,
                    fontSize: 14,
                    height: 44,
                    margin: 0,
                    background:
                      resendTimer > 0 || resendLoading ? "#ccc" : "#F47C54",
                    color: resendTimer > 0 || resendLoading ? "#888" : "#fff",
                    cursor:
                      resendTimer > 0 || resendLoading
                        ? "not-allowed"
                        : "pointer",
                    position: "relative",
                  }}
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resendLoading}
                >
                  {resendLoading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="spinner"
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid #fff",
                          borderTop: "2px solid #F47C54",
                          borderRadius: "50%",
                          marginRight: 8,
                          animation: "spin 1s linear infinite",
                        }}
                      ></span>
                      Đang gửi...
                    </span>
                  ) : resendTimer > 0 ? (
                    `${resendTimer}s`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="auth-input"
              />
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
              />
              {resetError && (
                <div
                  className="auth-error"
                  style={{ color: "#F44336", marginBottom: 4 }}
                >
                  {resetError}
                </div>
              )}
              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loadingReset}
              >
                {loadingReset ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="spinner"
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid #fff",
                        borderTop: "2px solid #F47C54",
                        borderRadius: "50%",
                        marginRight: 8,
                        animation: "spin 1s linear infinite",
                      }}
                    ></span>
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
          <div className="auth-bottom-row">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Log in
            </Link>
          </div>
        </div>
        <div className="auth-image-block forgot-image"></div>
      </div>
      {snackbar.open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            top: 24,
            background: snackbar.color,
            color: "#fff",
            padding: "14px 32px 14px 20px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 16,
            boxShadow: "0 4px 24px #0002",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            minWidth: 220,
            maxWidth: "90vw",
          }}
          role="alert"
        >
          <span style={{ flex: 1 }}>{snackbar.message}</span>
          <button
            onClick={() =>
              setSnackbar({ open: false, message: "", color: snackbar.color })
            }
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              marginLeft: 16,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Forgot;

/* CSS Spinner animation (add to Forgot.css if chưa có):
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/
