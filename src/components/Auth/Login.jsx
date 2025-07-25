import { useState, useContext, useEffect } from "react";
import { Eye, EyeSlash, Home2 } from "iconsax-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import "./Login.css";

const GOOGLE_CLIENT_ID =
  "1005255181896-ms3rp7n4s0p734n2b59dt6ngaf082ep2.apps.googleusercontent.com";

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

const Login = () => {
  const {
    login,
    googleLogin,
    facebookLogin,
    loading,
    user,
    setIsProfileCompleted,
  } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    if (user) {
      const profileCompleted = localStorage.getItem("isProfileCompleted");
      navigate(
        profileCompleted === "true" || profileCompleted == null
          ? "/"
          : "/provide-profile"
      );
    }

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showErrorFetchAPI({ message: "Please fill in all fields" });
      return;
    }

    try {
      const result = await login(email, password);
      if (!result.success) {
        const profileCompleted = result?.data?.isProfileCompleted;
        setIsProfileCompleted(profileCompleted);
        localStorage.setItem("isProfileCompleted", profileCompleted);
        navigate(profileCompleted === true ? "/" : "/provide-profile");
        showErrorFetchAPI(result);
      } else {
        showSuccessMessage("Login successful! Welcome back!");
      }
    } catch (error) {
      showErrorFetchAPI({ message: "An unexpected error occurred" });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      showErrorFetchAPI({ message: "Google authentication failed" });
      return;
    }

    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.status === "Success") {
        if (result?.data) {
          const profileCompleted = result?.data?.isProfileCompleted;
          setIsProfileCompleted(profileCompleted);
          localStorage.setItem("isProfileCompleted", profileCompleted);
          navigate(
            profileCompleted === true || !result?.data.accessToken
              ? "/login"
              : "/provide-profile"
          );
        }
        showSuccessMessage(result.message);
      } else {
        showErrorFetchAPI(result);
      }
    } catch (error) {
      showErrorFetchAPI(error);
    }
  };

  const handleGoogleFailure = () => {
    showErrorMessage("Google login was cancelled or failed");
  };

  const handleFacebookSuccess = async (response) => {
    if (!response.accessToken) {
      showErrorMessage("Facebook authentication failed");
      return;
    }

    try {
      const result = await facebookLogin(response.accessToken);
      if (result.status === "Success") {
        if (result?.data) {
          const profileCompleted = result?.data?.isProfileCompleted;
          setIsProfileCompleted(profileCompleted);
          localStorage.setItem("isProfileCompleted", profileCompleted);
          navigate(
            profileCompleted === true || !result?.data.accessToken
              ? "/login"
              : "/provide-profile"
          );
        }
        showInfoMessage(result.message);
      } else {
        showErrorFetchAPI(result);
      }
    } catch (error) {
      showErrorFetchAPI(error);
    }
  };

  const handleFacebookFailure = () => {
    showErrorMessage("Facebook login was cancelled or failed");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/register");
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
              Welcome Back
            </h1>
            <p className="auth-desc">
              Sign in to continue your healthy journey and track your wellness
              goals
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter your email address"
                  required
                  aria-describedby="email-error"
                  disabled={loading}
                />
                <div className="input-shine" aria-hidden="true"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  aria-describedby="password-error"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlash size={20} color="#f47c54" />
                  ) : (
                    <Eye size={20} color="#f47c54" />
                  )}
                </button>
                <div className="input-shine" aria-hidden="true"></div>
              </div>
            </div>

            <div className="auth-options">
              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading || !email || !password}
            >
              <span className="button-text">
                {loading ? (
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
              <div className="button-ripple" aria-hidden="true"></div>
            </button>
          </form>

          <div
            className="auth-divider"
            role="separator"
            aria-label="Or continue with social login"
          >
            <span>Or continue with</span>
          </div>

          <div className="social-login-section">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="social-btn-wrapper">
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
                  style={{
                    backgroundColor: "#4267b2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  disabled={loading}
                />
              </div>
            </GoogleOAuthProvider>

            <FacebookLogin
              appId="589418934210916"
              onSuccess={handleFacebookSuccess}
              onFail={handleFacebookFailure}
              autoLoad={false}
              fields="name,email,picture"
              render={(renderProps) => (
                <button
                  className="social-btn facebook-btn"
                  type="button"
                  onClick={renderProps.onClick}
                  disabled={loading || renderProps.disabled}
                  aria-label="Continue with Facebook"
                  style={{
                    backgroundColor: "#4267b2",
                    display: "flex",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                    alt=""
                    className="social-icon"
                    aria-hidden="true"
                  />
                  Continue with Facebook
                </button>
              )}
            />
          </div>

          <div className="auth-footer">
            <span>Don't have an account? </span>
            <button
              className="register-link"
              onClick={handleRegister}
              disabled={loading}
              type="button"
            >
              Sign up for free
            </button>
          </div>
        </div>

        <div className="auth-image-block" aria-hidden="true">
          <div className="image-overlay"></div>
          <div className="image-content">
            <h2>Transform Your Wellness Today</h2>
            <p>
              Join a community of health-conscious individuals using AI-powered
              insights to achieve their wellness goals and build lasting healthy
              habits
            </p>
            <div className="health-stats">
              <div className="stat-item">
                <span className="stat-number">100K+</span>
                <span className="stat-label">Lives Changed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
