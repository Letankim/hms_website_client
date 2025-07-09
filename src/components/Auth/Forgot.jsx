import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home2, Sms, Lock, Eye, EyeSlash } from "iconsax-react";
import apiAuthService from "services/apiAuthService";
import {
  showErrorFetchAPI,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";
import "./Forgot.css";

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="particle-background">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const resendInterval = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (resendInterval.current) {
        clearInterval(resendInterval.current);
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "otpCode") setOtpCode(value);
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    if (inputErrors[field]) {
      setInputErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (resetError) setResetError("");
  };

  const validateEmail = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateResetForm = () => {
    const errors = {};
    if (!otpCode.trim()) {
      errors.otpCode = "OTP code is required";
    }
    if (!newPassword) {
      errors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startResendTimer = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      showErrorFetchAPI({ message: "Please fix the errors below" });
      return;
    }

    setLoadingSend(true);
    try {
      await apiAuthService.forgotPassword(email);
      showInfoMessage("Check your email for reset instructions.");
      setShowResetForm(true);
      startResendTimer();
    } catch (err) {
      showErrorFetchAPI({
        message: err?.response?.data?.message || "Failed to send reset link",
      });
    } finally {
      setLoadingSend(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateResetForm()) {
      showErrorFetchAPI({ message: "Please fix the errors below" });
      return;
    }

    setLoadingReset(true);
    try {
      await apiAuthService.resetPassword({ email, otpCode, newPassword });
      showInfoMessage("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      showErrorFetchAPI({
        message: err?.response?.data?.message || "Failed to reset password",
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
      showInfoMessage("OTP resent! Check your email.");
      startResendTimer();
    } catch (err) {
      showErrorFetchAPI({
        message: err?.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="auth-container">
      <ParticleBackground />

      {/* Decorative Elements */}
      <div className="auth-decorative-elements">
        <div className="auth-decorative auth-decorative-1">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67597df37a4d2ed3e8663b94_lemon.webp"
            alt="Healthy lemon decoration"
            loading="lazy"
          />
        </div>
        <div className="auth-decorative auth-decorative-2">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675983f20b549bc94731c2d5_strawberry.webp"
            alt="Fresh strawberry decoration"
            loading="lazy"
          />
        </div>
        <div className="auth-decorative auth-decorative-3">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
            alt="Natural eclipse decoration"
            loading="lazy"
          />
        </div>
        <div className="auth-decorative auth-decorative-4">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759864e5f6bae487081d4ef_top-view-frame-with-green-leaves%201.svg"
            alt="Green leaves decoration"
            loading="lazy"
          />
        </div>
      </div>

      <div className={`auth-box ${isVisible ? "animate-in" : ""}`}>
        <div className="auth-form-block">
          <button
            className="auth-home-btn"
            onClick={handleHomeClick}
            type="button"
            aria-label="Go to homepage"
          >
            <Home2 size="20" color="#f47c54" />
            <span>Home</span>
          </button>

          <div className="auth-header">
            <h1 className="auth-title">
              <span className="auth-title-dot" aria-hidden="true"></span>
              {!showResetForm ? "Forgot Password" : "Reset Password"}
            </h1>
            <p className="auth-desc">
              {!showResetForm
                ? "Enter your email address and we'll send you instructions to reset your password"
                : "Enter the OTP code sent to your email and create a new password"}
            </p>
          </div>

          {!showResetForm ? (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    className={inputErrors.email ? "input-error" : ""}
                    disabled={loadingSend}
                    autoComplete="username"
                    required
                  />
                  <div className="input-shine" aria-hidden="true"></div>
                </div>
                {inputErrors.email && (
                  <span className="error-message">{inputErrors.email}</span>
                )}
              </div>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loadingSend || !email}
              >
                <span className="button-text">
                  {loadingSend ? (
                    <>
                      <svg
                        className="loading-spinner"
                        viewBox="0 0 50 50"
                        aria-hidden="true"
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeDasharray="31.415, 31.415"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 25 25"
                            to="360 25 25"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                      Sending instructions...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </span>
                <div className="button-ripple" aria-hidden="true"></div>
              </button>
            </form>
          ) : (
            <form
              className="auth-form"
              onSubmit={handleResetPassword}
              noValidate
            >
              <div className="form-group">
                <label htmlFor="otpCode">Verification Code</label>
                <div className="otp-input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="otpCode"
                      name="otpCode"
                      value={otpCode}
                      onChange={(e) =>
                        handleInputChange("otpCode", e.target.value)
                      }
                      placeholder="Enter 6-digit code"
                      className={inputErrors.otpCode ? "input-error" : ""}
                      disabled={loadingReset}
                      maxLength={6}
                      required
                    />
                    <div className="input-shine" aria-hidden="true"></div>
                  </div>
                  <button
                    type="button"
                    className={`resend-btn ${
                      resendTimer > 0 || resendLoading ? "disabled" : ""
                    }`}
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || resendLoading}
                  >
                    {resendLoading ? (
                      <>
                        <svg
                          className="loading-spinner-small"
                          viewBox="0 0 50 50"
                          aria-hidden="true"
                        >
                          <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="5"
                            strokeDasharray="31.415, 31.415"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              from="0 25 25"
                              to="360 25 25"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                        Sending...
                      </>
                    ) : resendTimer > 0 ? (
                      formatTime(resendTimer)
                    ) : (
                      "Resend"
                    )}
                  </button>
                </div>
                {inputErrors.otpCode && (
                  <span className="error-message">{inputErrors.otpCode}</span>
                )}
                <p className="otp-help-text">
                  Check your email for the 6-digit verification code
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper password-wrapper">
                  <Lock size="18" color="#64748B" className="input-icon" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Create a new password"
                    className={inputErrors.newPassword ? "input-error" : ""}
                    disabled={loadingReset}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    disabled={loadingReset}
                  >
                    {showNewPassword ? (
                      <EyeSlash size={20} color="#f47c54" />
                    ) : (
                      <Eye size={20} color="#f47c54" />
                    )}
                  </button>
                  <div className="input-shine" aria-hidden="true"></div>
                </div>
                {inputErrors.newPassword && (
                  <span className="error-message">
                    {inputErrors.newPassword}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper password-wrapper">
                  <Lock size="18" color="#64748B" className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your new password"
                    className={inputErrors.confirmPassword ? "input-error" : ""}
                    disabled={loadingReset}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    disabled={loadingReset}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} color="#f47c54" />
                    ) : (
                      <Eye size={20} color="#f47c54" />
                    )}
                  </button>
                  <div className="input-shine" aria-hidden="true"></div>
                </div>
                {inputErrors.confirmPassword && (
                  <span className="error-message">
                    {inputErrors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loadingReset}
              >
                <span className="button-text">
                  {loadingReset ? (
                    <>
                      <svg
                        className="loading-spinner"
                        viewBox="0 0 50 50"
                        aria-hidden="true"
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeDasharray="31.415, 31.415"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 25 25"
                            to="360 25 25"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </span>
                <div className="button-ripple" aria-hidden="true"></div>
              </button>
            </form>
          )}

          <div className="auth-footer">
            <span>Remember your password? </span>
            <Link to="/login" className="register-link">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="auth-image-block" aria-hidden="true">
          <div className="image-overlay"></div>
          <div className="image-content">
            <h2>{!showResetForm ? "Reset Your Password" : "Almost There!"}</h2>
            <p>
              {!showResetForm
                ? "Don't worry! It happens to everyone. We'll help you get back to your wellness journey in just a few simple steps."
                : "Create a new secure password and get back to tracking your health goals and achieving your wellness milestones."}
            </p>
            <div className="health-stats">
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2 Min</span>
                <span className="stat-label">Average Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
