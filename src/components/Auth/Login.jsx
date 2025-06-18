import React, { useState, useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import { Eye, EyeSlash, Home2 } from "iconsax-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import "./Login.css";

const GOOGLE_CLIENT_ID =
  "336337631794-cil4f7sd9oj7dcsqflf6u7buambcsukk.apps.googleusercontent.com";

const Login = () => {
  const { login, googleLogin, facebookLogin, loading, user } =
    useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (!result.success) {
      showError(result.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    await googleLogin(credentialResponse.credential);
  };
  const handleGoogleFailure = () => {
    showError("Google login failed");
  };

  const handleFacebookSuccess = async (response) => {
    if (!response.accessToken) return;
    await facebookLogin(response.accessToken);
  };
  const handleFacebookFailure = () => {
    showError("Facebook login failed");
  };

  const showError = (msg) => {
    setSnackbar({ open: true, message: msg });
    setTimeout(() => setSnackbar({ open: false, message: "" }), 3000);
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
            <span className="auth-title-dot"></span>Log In
          </h2>
          <p className="auth-desc">Welcome back! Please enter your details</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Show/Hide password"
              >
                <span className="auth-eye-icon">
                  {showPassword ? (
                    <EyeSlash size={22} color="#F47C54" />
                  ) : (
                    <Eye size={22} color="#F47C54" />
                  )}
                </span>
              </button>
            </div>
            <div className="auth-link-row">
              <Link to="/forgot" className="auth-link">
                Forgot password ?
              </Link>
            </div>
            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{ marginBottom: 18, marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 50 50"
                    style={{ marginRight: 8 }}
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="5"
                      strokeDasharray="31.415, 31.415"
                      transform="rotate(72.0001 25 25)"
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
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
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
                locale="en"
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
            Don't have account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </div>
        </div>
        <div className="auth-image-block login-image"></div>
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

export default Login;
