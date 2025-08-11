import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Turnstile from "react-turnstile";
import "./Verify.css";

const SITE_KEY =
  process.env.REACT_APP_TURNSTILE_SITE_KEY || "0x4AAAAAABmaPy1RX5bchBmh";

export default function Verify() {
  const [verified, setVerified] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = (token) => {
    localStorage.setItem("turnstile_passed", "true");
    setVerified(true);
    setIsVerifying(false);
  };

  const handleExpire = () => {
    localStorage.removeItem("turnstile_passed");
    setVerified(false);
    setIsVerifying(false);
  };

  const handleError = (error) => {
    localStorage.removeItem("turnstile_passed");
    setVerified(false);
    setIsVerifying(false);
  };

  useEffect(() => {
    if (verified === true) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [verified, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <h1 className="verify-title">Security Check</h1>
          <p className="verify-description">
            Please complete the security check to proceed. This helps us ensure
            you are not a robot.
          </p>
        </div>
        <div className="verify-content">
          {isVerifying && (
            <div className="verify-status verifying">
              <div className="verify-status spinner"></div>
              <span className="status-text">Verifying...</span>
            </div>
          )}
          {verified === true && !isVerifying && (
            <div className="verify-status success">
              <span className="verify-status status-icon">✔</span>
              <span className="status-text">
                Verification successful! Redirecting...
              </span>
            </div>
          )}
          {verified === false && !isVerifying && (
            <div className="verify-status error">
              <span className="verify-status status-icon">✖</span>
              <span className="status-text">
                Verification failed or expired. Please try again.
              </span>
            </div>
          )}
          <div className="verify-turnstile-widget-wrapper">
            <Turnstile
              sitekey={SITE_KEY}
              onSuccess={handleSuccess}
              onExpire={handleExpire}
              onError={handleError}
              options={{ theme: "light", size: "invisible" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
