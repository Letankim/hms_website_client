import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield } from "iconsax-react";
import apiAuthService from "services/apiAuthService";
import AuthContext from "contexts/AuthContext";
import "./changePassword.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Redirect if user is not authenticated
  if (!user || !user.username) {
    return (
      <div className="change-password-error-container">
        <div className="change-password-container-wrapper">
          <div className="change-password-error-alert">
            <Shield size={24} />
            <span>Unauthorized access or missing user information.</span>
          </div>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (otpSent && !formData.otpCode) {
      errors.otpCode = "OTP code is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOTP = async () => {
    setOtpLoading(true);
    setError(null);
    try {
      await apiAuthService.changePassword(user.username);
      setOtpSent(true);
      showSuccessMessage(
        "An OTP has been sent to your email. Please check your inbox."
      );
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const resetData = {
        email: user.username,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword,
      };
      await apiAuthService.resetPassword(resetData);
      showSuccessMessage("Your password has been updated successfully.");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      showErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="change-password-container">
      <div className="change-password-container-wrapper">
        {/* Header Section */}
        <div className="change-password-header">
          <div className="change-password-header-content">
            <Lock size={40} className="change-password-header-icon" />
            <h1 className="change-password-header-title">Change Password</h1>
          </div>
          <p className="change-password-header-subtitle">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Form Card */}
        <div className="change-password-form-card">
          <div className="change-password-form-content">
            {error && (
              <div className="change-password-error-alert">
                <Shield size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="change-password-form-grid">
              <div className="change-password-form-group">
                <label className="change-password-form-label">
                  New Password
                </label>
                <div className="change-password-input-wrapper">
                  <Lock
                    size={20}
                    className="change-password-input-icon"
                    color="#1f2937"
                  />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className={`change-password-input ${
                      formErrors.newPassword
                        ? "change-password-input-error"
                        : ""
                    }`}
                    placeholder="Enter new password"
                  />
                </div>
                {formErrors.newPassword && (
                  <span className="change-password-error-text">
                    {formErrors.newPassword}
                  </span>
                )}
              </div>

              <div className="change-password-form-group">
                <label className="change-password-form-label">
                  Confirm Password
                </label>
                <div className="change-password-input-wrapper">
                  <Lock
                    size={20}
                    className="change-password-input-icon"
                    color="#1f2937"
                  />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`change-password-input ${
                      formErrors.confirmPassword
                        ? "change-password-input-error"
                        : ""
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <span className="change-password-error-text">
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>

              {otpSent && (
                <div className="change-password-form-group">
                  <label className="change-password-form-label">OTP Code</label>
                  <div className="change-password-input-wrapper">
                    <Shield size={20} className="change-password-input-icon" />
                    <input
                      type="text"
                      value={formData.otpCode}
                      onChange={(e) =>
                        setFormData({ ...formData, otpCode: e.target.value })
                      }
                      className={`change-password-input ${
                        formErrors.otpCode ? "change-password-input-error" : ""
                      }`}
                      placeholder="Enter OTP code"
                    />
                  </div>
                  {formErrors.otpCode && (
                    <span className="change-password-error-text">
                      {formErrors.otpCode}
                    </span>
                  )}
                </div>
              )}

              <div className="change-password-form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="change-password-btn change-password-btn-cancel"
                >
                  Cancel
                </button>
                <div className="change-password-action-buttons">
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || loading}
                      className="change-password-btn change-password-btn-otp"
                    >
                      {otpLoading ? (
                        <>
                          <div className="change-password-btn-spinner"></div>
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || otpLoading || !otpSent}
                    className="change-password-btn change-password-btn-submit"
                  >
                    {loading ? (
                      <>
                        <div className="change-password-btn-spinner"></div>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snackbar */}
        {snackbar.open && (
          <div
            className={`change-password-snackbar ${
              snackbar.severity === "success"
                ? "change-password-snackbar-success"
                : "change-password-snackbar-error"
            }`}
          >
            <span>{snackbar.message}</span>
            <button
              onClick={handleCloseSnackbar}
              className="change-password-snackbar-close"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
