import "./notFound.css";
import { useNavigate } from "react-router-dom";
import { ArrowBack, ErrorOutline, Home, Search } from "@mui/icons-material";
import { Rocket } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="not-found-container">
      <div className="background-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="content-wrapper">
        {/* Animated 404 Text */}
        <div className="error-number">
          <span className="number-text">4</span>
          <div className="rocket-container">
            <Rocket className="rocket-icon" />
          </div>
          <span className="number-text">4</span>
        </div>

        {/* Error Icon */}
        <div className="error-icon-container">
          <ErrorOutline className="error-icon" />
          <div className="icon-pulse"></div>
        </div>

        {/* Title */}
        <h1 className="error-title">Oops! Page Not Found</h1>

        {/* Description */}
        <p className="error-description">
          The page you're looking for seems to have taken a trip to outer space.
          Don't worry, our rocket will help you navigate back to safety!
        </p>

        {/* Action Buttons */}
        <div className="button-container">
          <button className="btn btn-primary" onClick={handleGoBack}>
            <ArrowBack className="btn-icon" />
            Go Back
          </button>
          <button className="btn btn-secondary" onClick={handleGoHome}>
            <Home className="btn-icon" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
