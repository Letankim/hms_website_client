import { useState, useContext, useEffect } from "react";
import { Eye, EyeSlash, ArrowLeft, Shield, User } from "iconsax-react";
import AuthContext from "contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  showErrorFetchAPI,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import "./Register.css";
import apiAuthService from "services/apiAuthService";
import apiProfileService from "services/apiProfileService";
import Swal from "sweetalert2";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const ErrorMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  return (
    <div className={`error-message-register ${type}`}>
      <span className="error-text">{message}</span>
    </div>
  );
};

const Register = () => {
  const { register, loading, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: "",
    gender: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const profileData = location.state?.profileData || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    if (user) {
      showSuccessMessage("You are already logged in!");
      navigate("/");
    }
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (currentStep === 0) {
      // Validate Personal Info Step
      if (!formData.firstName.trim()) {
        newErrors.firstName =
          "Your name is required to personalize your account";
        isValid = false;
      } else if (formData.firstName.length < 2) {
        newErrors.firstName = "Name must be at least 2 characters";
        isValid = false;
      } else if (formData.firstName.length > 50) {
        newErrors.firstName = "Name should be less than 50 characters";
        isValid = false;
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
        newErrors.firstName = "Name should only contain letters and spaces";
        isValid = false;
      }

      if (!formData.gender) {
        newErrors.gender = "Gender is required";
        isValid = false;
      }

      if (!formData.birthDate) {
        newErrors.birthDate = "Birth date is required";
        isValid = false;
      } else {
        const age = calculateAge(formData.birthDate);
        if (age < 13) {
          newErrors.birthDate = "You must be at least 13 years old";
          isValid = false;
        } else if (age > 120) {
          newErrors.birthDate = "Please enter a valid birth date";
          isValid = false;
        }
      }
    } else if (currentStep === 1) {
      // Validate Account Details Step
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        newErrors.email = "Email address is required to create your account";
        isValid = false;
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email =
          "Please enter a valid email address (e.g., user@example.com)";
        isValid = false;
      }

      if (!formData.password) {
        newErrors.password = "Password is required to secure your account";
        isValid = false;
      } else if (formData.password.length < 8) {
        newErrors.password =
          "Password must be at least 8 characters for better security";
        isValid = false;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password =
          "Password should contain uppercase, lowercase, and numbers";
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword =
          "Passwords don't match. Please check and try again";
        isValid = false;
      }

      if (!formData.phone) {
        newErrors.phone = "Phone number helps us send important updates";
        isValid = false;
      } else {
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
          newErrors.phone = "Please enter a valid phone number (10-15 digits)";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      Swal.fire({
        title: "Registering...",
        text: "Please wait while we create your account.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const registerData = {
        username: formData.email,
        password: formData.password,
        roles: ["User"],
        fullName: formData.firstName || profileData.firstName || "",
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender || profileData.gender || "",
        birthDate: formData.birthDate || profileData.birthDate || "",
      };

      const dataRegister = await apiAuthService.register(registerData);
      if (!dataRegister || dataRegister.statusCode !== 200) {
        if (dataRegister?.statusCode === 400 && dataRegister.errors) {
          const errorMessages = Object.entries(dataRegister.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          throw new Error(`Registration failed:\n${errorMessages}`);
        }
        throw new Error("Registration failed: Invalid user data returned.");
      }

      Swal.close();
      showSuccessMessage(
        "Your account has been created successfully! Please check your email to verify your account."
      );

      navigate("/login");
    } catch (error) {
      Swal.close();
      showErrorFetchAPI(error);
    }
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep(1);
      setErrors({});
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 0) {
      navigate("/login");
    } else {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthTexts = {
      0: "",
      1: "Very Weak",
      2: "Weak",
      3: "Fair",
      4: "Good",
      5: "Strong",
    };

    return { strength, text: strengthTexts[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <AccountDetailsStep
            formData={formData}
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            errors={errors}
            passwordStrength={passwordStrength}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    return currentStep === 0 ? "Personal Information" : "Create Account";
  };

  const getStepDescription = () => {
    return currentStep === 0
      ? "Let's start with your personal details."
      : "Set up your secure account to save your progress.";
  };

  return (
    <div className="auth-container">
      <div className={`auth-box multi-step ${isVisible ? "animate-in" : ""}`}>
        <div className="step-header">
          <div className="step-progress">
            <div className="step-counter">
              <span>Step {currentStep + 1} of 2</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${((currentStep + 1) / 2) * 100}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-percentage">
              {Math.round(((currentStep + 1) / 2) * 100)}%
            </div>
          </div>
        </div>
        <div className="step-content-wrapper">
          <div className="step-title-section">
            <h1 className="step-title">{getStepTitle()}</h1>
            <p className="step-description">{getStepDescription()}</p>
          </div>
          <div className="step-content">{renderStepContent()}</div>
          <div className="step-navigation">
            <button
              className="step-nav-btn prev-btn"
              onClick={handlePreviousStep}
              type="button"
            >
              <ArrowLeft size="20" color="#6b7280" />
              <span>{currentStep === 0 ? "Back to login" : "Back"}</span>
            </button>
            <div className="step-indicators">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className={`step-dot ${
                    index <= currentStep ? "active" : ""
                  } ${index === currentStep ? "current" : ""}`}
                />
              ))}
            </div>
            <button
              className="step-nav-btn next-btn"
              onClick={currentStep === 0 ? handleNextStep : handleRegister}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>{currentStep === 0 ? "Continue" : "Create Account"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalInfoStep = ({ formData, handleChange, errors }) => {
  return (
    <div className="step-form">
      <div className="step-icon">
        <User size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Personal Details</h2>
      <p className="step-description">
        Enter your personal information to get started.
      </p>
      <div className="form-group">
        <label htmlFor="firstName">Full Name</label>
        <div className={`input-wrapper ${errors.firstName ? "error" : ""}`}>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter your full name"
            className={errors.firstName ? "input-error" : ""}
            maxLength={50}
          />
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.firstName} />
      </div>
      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <div className={`input-wrapper ${errors.gender ? "error" : ""}`}>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className={errors.gender ? "input-error" : ""}
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.gender} />
      </div>
      <div className="form-group">
        <label htmlFor="birthDate">Birth Date</label>
        <div className={`input-wrapper ${errors.birthDate ? "error" : ""}`}>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={(e) => handleChange("birthDate", e.target.value)}
            className={errors.birthDate ? "input-error" : ""}
            max={new Date().toISOString().split("T")[0]}
          />
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.birthDate} />
      </div>
    </div>
  );
};

const AccountDetailsStep = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors,
  passwordStrength,
}) => {
  return (
    <div className="step-form">
      <div className="step-icon">
        <Shield size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Create Your Account</h2>
      <p className="step-description">
        Enter your account details to complete registration.
      </p>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className={`input-wrapper ${errors.email ? "error" : ""}`}>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter your email address"
            className={errors.email ? "input-error" : ""}
            autoComplete="username"
          />
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.email} />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <div className={`input-wrapper ${errors.phone ? "error" : ""}`}>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter your phone number"
            className={errors.phone ? "input-error" : ""}
            maxLength={15}
          />
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.phone} />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div
          className={`input-wrapper password-wrapper ${
            errors.password ? "error" : ""
          }`}
        >
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Create a strong password"
            className={errors.password ? "input-error" : ""}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlash size={20} color="#f47c54" />
            ) : (
              <Eye size={20} color="#f47c54" />
            )}
          </button>
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.password} />
        {formData.password && (
          <div className="password-strength">
            <div className="strength-bar">
              <div
                className={`strength-fill strength-${passwordStrength.strength}`}
                style={{
                  width: `${(passwordStrength.strength / 5) * 100}%`,
                }}
              ></div>
            </div>
            <span className="strength-text">{passwordStrength.text}</span>
          </div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div
          className={`input-wrapper password-wrapper ${
            errors.confirmPassword ? "error" : ""
          }`}
        >
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Confirm your password"
            className={errors.confirmPassword ? "input-error" : ""}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeSlash size={20} color="#f47c54" />
            ) : (
              <Eye size={20} color="#f47c54" />
            )}
          </button>
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={errors.confirmPassword} />
      </div>
      <div className="terms-notice enhanced">
        <Shield size="16" color="#4F46E5" />
        <p>
          By registering, you agree to our{" "}
          <a
            href="/terms-and-conditions"
            target="_blank"
            className="terms-link"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="terms-link">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
