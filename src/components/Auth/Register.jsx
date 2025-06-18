import React, { useState, useContext } from "react";
import { Eye, EyeSlash, Home2 } from "iconsax-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import "./Register.css";
import AuthContext from "contexts/AuthContext";

const GOOGLE_CLIENT_ID =
  "336337631794-cil4f7sd9oj7dcsqflf6u7buambcsukk.apps.googleusercontent.com";

const Register = () => {
  const { register, googleLogin, facebookLogin, loading } =
    useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (fullName.length > 100) {
      errors.fullName = "Full name cannot exceed 100 characters.";
    }
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.email = "Invalid email format.";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be 10 digits.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    } else if (password.length > 100) {
      errors.password = "Password cannot exceed 100 characters.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const registerData = {
      username: email,
      password,
      roles: ["User"],
      fullName,
      email,
      phone,
    };
    const result = await register(registerData);
    if (result.success) {
      navigate("/login");
    } else {
      showError(result.message || "Register failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      navigate("/");
    } else {
      showError(result.message || "Google login failed");
    }
  };
  const handleGoogleFailure = () => {
    setError("Google login failed");
  };

  const handleFacebookSuccess = async (response) => {
    if (!response.accessToken) return;
    const result = await facebookLogin(response.accessToken);
    if (result.success) {
      navigate("/");
    } else {
      showError(result.message || "Facebook login failed");
    }
  };
  const handleFacebookFailure = () => {
    setError("Facebook login failed");
  };

  const showError = (msg) => {
    setSnackbar({ open: true, message: msg });
    setTimeout(() => setSnackbar({ open: false, message: "" }), 5000);
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
            <span className="auth-title-dot"></span>Sign Up
          </h2>
          <p className="auth-desc">Create your account to get started</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              className={`auth-input ${
                inputErrors.fullName ? "input-error" : ""
              }`}
            />
            {inputErrors.fullName && (
              <div
                className="auth-error"
                style={{ color: "#F44336", marginBottom: 4 }}
              >
                {inputErrors.fullName}
              </div>
            )}
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className={inputErrors.email ? "input-error" : ""}
            />
            {inputErrors.email && (
              <div
                className="auth-error"
                style={{ color: "#F44336", marginBottom: 4 }}
              >
                {inputErrors.email}
              </div>
            )}
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
              className={`auth-input ${inputErrors.phone ? "input-error" : ""}`}
            />
            {inputErrors.phone && (
              <div
                className="auth-error"
                style={{ color: "#F44336", marginBottom: 4 }}
              >
                {inputErrors.phone}
              </div>
            )}
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className={inputErrors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Show/Hide password"
              >
                {showPassword ? (
                  <EyeSlash size={22} color="#F47C54" />
                ) : (
                  <Eye size={22} color="#F47C54" />
                )}
              </button>
            </div>
            {inputErrors.password && (
              <div
                className="auth-error"
                style={{ color: "#F44336", marginBottom: 4 }}
              >
                {inputErrors.password}
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}
            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
          <div className="auth-divider">
            <span>Or Continue With</span>
          </div>
          <div className="auth-social-row">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                width="100%"
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </GoogleOAuthProvider>
            <FacebookLogin
              appId="1669047477285810"
              callback={handleFacebookSuccess}
              onFailure={handleFacebookFailure}
              autoLoad={false}
              fields="name,email"
              render={(renderProps) => (
                <button
                  className="auth-social-btn facebook"
                  type="button"
                  onClick={renderProps.onClick}
                  style={{
                    backgroundColor: "#4267b2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "16px",
                    width: "100%",
                    marginTop: 8,
                  }}
                >
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                    alt="Facebook"
                    style={{
                      width: 22,
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  Facebook
                </button>
              )}
            />
          </div>
          <div className="auth-bottom-row">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Log in
            </Link>
          </div>
        </div>
        <div className="auth-image-block register-image"></div>
      </div>
      {/* Snackbar hiển thị lỗi */}
      {snackbar.open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            top: 24,
            background: "#F44336",
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
            onClick={() => setSnackbar({ open: false, message: "" })}
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

export default Register;
