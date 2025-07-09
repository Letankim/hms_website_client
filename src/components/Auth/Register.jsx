import { useState, useContext, useEffect } from "react";
import {
  Eye,
  EyeSlash,
  Home2,
  ArrowLeft,
  ArrowRight,
  User,
  Activity,
  Information,
  Shield,
  Smallcaps,
  Heart,
  Milk,
  Apple,
  Wallet,
  Clock,
} from "iconsax-react";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Dumbbell,
  Utensils,
  ClipboardList,
  Trophy,
  NutIcon,
  LucideOctagonPause,
  Flame,
  Square,
  Footprints,
  UtensilsCrossed,
  Leaf,
  Sprout,
  Fish,
  Drumstick,
  Droplet,
  Salad,
  Ban,
  StretchHorizontal,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";
import AuthContext from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  showErrorFetchAPI,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import { Restaurant } from "@mui/icons-material";
import "./Register.css";
import apiAuthService from "services/apiAuthService";
import Swal from "sweetalert2";
import apiProfileService from "services/apiProfileService";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 8,
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

const ErrorMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  return (
    <div className={`error-message ${type}`}>
      <span className="error-text">{message}</span>
    </div>
  );
};

const Register = () => {
  const { register, googleLogin, facebookLogin, loading, user } =
    useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    goals: [],
    bodyFatPercentage: "",
    activityLevel: "",
    dietaryPreference: "",
    fitnessGoal: "",
    birthDate: "",
    gender: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 11;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    if (user) {
      showInfoMessage("You are already logged in!");
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

  const handleToggle = (field, item) => {
    setFormData((prev) => {
      const currentItems = prev[field];
      const newItems = currentItems.includes(item)
        ? currentItems.filter((i) => i !== item)
        : [...currentItems, item];
      return { ...prev, [field]: newItems };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (currentStep) {
      case 0: // Name
        if (!formData.firstName.trim()) {
          newErrors.firstName =
            "Your name is required to personalize your experience";
          isValid = false;
        } else if (formData.firstName.length < 2) {
          newErrors.firstName =
            "Please enter at least 2 characters for your name";
          isValid = false;
        } else if (formData.firstName.length > 50) {
          newErrors.firstName = "Name should be less than 50 characters";
          isValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
          newErrors.firstName = "Name should only contain letters and spaces";
          isValid = false;
        }
        break;

      case 1: // Goals
        if (formData.goals.length === 0) {
          newErrors.goals =
            "Please select at least one goal to help us personalize your journey";
          isValid = false;
        } else if (formData.goals.length > 3) {
          newErrors.goals = "Please select up to 3 goals for better focus";
          isValid = false;
        }
        break;

      case 2: // Body Fat
        if (!formData.bodyFatPercentage) {
          newErrors.bodyFatPercentage =
            "Body fat percentage helps us create better recommendations";
          isValid = false;
        } else {
          const bodyFat = Number.parseFloat(formData.bodyFatPercentage);
          if (isNaN(bodyFat)) {
            newErrors.bodyFatPercentage = "Please enter a valid number";
            isValid = false;
          } else if (bodyFat < 0) {
            newErrors.bodyFatPercentage =
              "Please enter a number greater than or equal to 0";
            isValid = false;
          }
        }
        break;

      case 3: // Activity Level
        if (!formData.activityLevel) {
          newErrors.activityLevel =
            "Activity level helps us calculate your daily calorie needs";
          isValid = false;
        }
        break;

      case 4: // Dietary Preference
        if (!formData.dietaryPreference) {
          newErrors.dietaryPreference =
            "Dietary preference helps us suggest suitable meal plans";
          isValid = false;
        }
        break;

      case 5: // Fitness Goal
        if (!formData.fitnessGoal) {
          newErrors.fitnessGoal =
            "Your fitness goal helps us create targeted workout plans";
          isValid = false;
        }
        break;

      case 9: // Personal Info
        if (!formData.birthDate) {
          newErrors.birthDate =
            "Birth date is required to calculate age-appropriate recommendations";
          isValid = false;
        } else {
          const age = calculateAge(formData.birthDate);
          if (age < 13) {
            newErrors.birthDate =
              "You must be at least 13 years old to use our service";
            isValid = false;
          } else if (age > 120) {
            newErrors.birthDate = "Please enter a valid birth date";
            isValid = false;
          }
        }

        if (!formData.gender) {
          newErrors.gender =
            "Gender helps us provide more accurate health calculations";
          isValid = false;
        }

        if (!formData.height) {
          newErrors.height =
            "Height is required for BMI and calorie calculations";
          isValid = false;
        } else {
          const height = Number.parseFloat(formData.height);
          if (isNaN(height) || height < 50 || height > 300) {
            newErrors.height = "Please enter a valid height between 50-300 cm";
            isValid = false;
          }
        }

        if (!formData.weight) {
          newErrors.weight =
            "Weight is required for personalized recommendations";
          isValid = false;
        } else {
          const weight = Number.parseFloat(formData.weight);
          if (isNaN(weight) || weight < 20 || weight > 300) {
            newErrors.weight = "Please enter a valid weight between 20-300 kg";
            isValid = false;
          }
        }
        break;

      case 10: // Account Setup
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
            newErrors.phone =
              "Please enter a valid phone number (10-15 digits)";
            isValid = false;
          }
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else {
      navigate("/login");
    }
  };

  const handleRegister = async () => {
    if (!validateCurrentStep()) return;

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
        fullName: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate,
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

      const heightInMeters = formData.height / 100;
      const weightInKg = formData.weight;
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      const profile = {
        userId: dataRegister?.data?.userId,
        profileId: 0,
        height: Number.parseFloat(formData.height),
        weight: Number.parseFloat(formData.weight),
        bmi: Number(bmi.toFixed(2)),
        bodyFatPercentage: Number.parseFloat(formData.bodyFatPercentage) || 0,
        activityLevel: formData.activityLevel || "Moderate",
        dietaryPreference: formData.dietaryPreference || "Balanced",
        fitnessGoal: formData.fitnessGoal || "Maintain",
      };

      const responseAddProfile = await apiProfileService.registerProfile(
        profile
      );
      if (!responseAddProfile || responseAddProfile.statusCode !== 201) {
        if (
          responseAddProfile?.statusCode === 400 &&
          responseAddProfile.errors
        ) {
          const errorMessages = Object.entries(responseAddProfile.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          throw new Error(`Profile creation failed:\n${errorMessages}`);
        }
        throw new Error("Profile creation failed: Invalid response.");
      }

      Swal.close();
      showSuccessMessage(
        "Your account has been created successfully!. Please check your email to verify your account."
      );

      navigate("/login");
    } catch (error) {
      Swal.close();
      showErrorFetchAPI(error);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const getStepTitle = () => {
    const titles = [
      "Personal Information",
      "Your Goals",
      "Body Composition",
      "Activity Level",
      "Dietary Preference",
      "Fitness Goal",
      "Your Journey",
      "Building Habits",
      "Meal Planning",
      "Physical Details",
      "Create Account",
    ];
    return titles[currentStep] || "Registration";
  };

  const getStepDescription = () => {
    const descriptions = [
      "Let's start with your name to personalize your experience",
      "What health goals are most important to you?",
      "Help us understand your current fitness level",
      "How active are you in a typical week?",
      "What eating style works best for you?",
      "What's your primary fitness objective?",
      "Understanding your motivation",
      "Building sustainable healthy habits",
      "Personalized nutrition planning",
      "Physical details for accurate calculations",
      "Secure your account information",
    ];
    return descriptions[currentStep] || "";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep
            formData={formData}
            handleChange={handleChange}
            error={errors.firstName}
          />
        );
      case 1:
        return (
          <GoalsStep
            formData={formData}
            handleToggle={(goal) => handleToggle("goals", goal)}
            error={errors.goals}
          />
        );
      case 2:
        return (
          <BodyFatStep
            formData={formData}
            handleChange={handleChange}
            error={errors.bodyFatPercentage}
          />
        );
      case 3:
        return (
          <ActivityLevelStep
            formData={formData}
            handleSelect={(level) => handleSelect("activityLevel", level)}
            error={errors.activityLevel}
          />
        );
      case 4:
        return (
          <DietaryPreferenceStep
            formData={formData}
            handleSelect={(preference) =>
              handleSelect("dietaryPreference", preference)
            }
            error={errors.dietaryPreference}
          />
        );
      case 5:
        return (
          <FitnessGoalStep
            formData={formData}
            handleSelect={(goal) => handleSelect("fitnessGoal", goal)}
            error={errors.fitnessGoal}
          />
        );
      case 6:
        return <GoalsInfoStep formData={formData} />;
      case 7:
        return <HabitsInfoStep formData={formData} />;
      case 8:
        return <MealPlansInfoStep formData={formData} />;
      case 9:
        return (
          <PersonalInfoStep
            formData={formData}
            handleChange={handleChange}
            handleSelect={handleSelect}
            errors={errors}
          />
        );
      case 10:
        return (
          <AccountSetupStep
            formData={formData}
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const isFinalStep = currentStep === totalSteps - 1;

  return (
    <div className="auth-container">
      <ParticleBackground />

      {/* Enhanced Decorative Elements */}
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

      <div className={`auth-box multi-step ${isVisible ? "animate-in" : ""}`}>
        {/* Enhanced Progress Header */}
        <div className="step-header">
          <button
            className="auth-home-btn"
            onClick={handleHomeClick}
            type="button"
            aria-label="Go to homepage"
          >
            <Home2 size="20" color="#f47c54" />
            <span>Home</span>
          </button>

          <div className="step-progress">
            <div className="step-counter">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-percentage">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
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
              <span>{currentStep === 0 ? "Login" : "Back"}</span>
            </button>

            <div className="step-indicators">
              {Array.from({ length: totalSteps }, (_, index) => (
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
              onClick={isFinalStep ? handleRegister : handleNextStep}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>{isFinalStep ? "Create Account" : "Continue"}</span>
                  {!isFinalStep && <ArrowRight size="20" color="#fff" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Step Components
const NameStep = ({ formData, handleChange, error }) => {
  return (
    <div className="step-form">
      <div className="step-icon">
        <User size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Welcome to HMS!</h2>
      <p className="step-description">
        Let's start by getting to know you. What should we call you?
      </p>

      <div className="form-group">
        <label htmlFor="firstName">Your Name</label>
        <div className={`input-wrapper ${error ? "error" : ""}`}>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter your full name"
            className={error ? "input-error" : ""}
            maxLength={50}
          />
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={error} />
      </div>

      <div className="step-tip">
        <Information size="16" color="#4F46E5" />
        <p>This helps us personalize your health journey throughout the app.</p>
      </div>
    </div>
  );
};

const GoalsStep = ({ formData, handleToggle, error }) => {
  const goalsOptions = [
    {
      value: "Lose weight",
      icon: TrendingDown,
      description: "Reduce body weight healthily",
    },
    {
      value: "Maintain weight",
      icon: Scale,
      description: "Keep current weight stable",
    },
    {
      value: "Gain weight",
      icon: TrendingUp,
      description: "Increase weight safely",
    },
    {
      value: "Build muscle",
      icon: Dumbbell,
      description: "Increase muscle mass",
    },
    {
      value: "Improve diet",
      icon: Utensils,
      description: "Eat more nutritiously",
    },
    {
      value: "Plan meals",
      icon: ClipboardList,
      description: "Organize meal planning",
    },
    {
      value: "Manage stress",
      icon: LucideOctagonPause,
      description: "Reduce daily stress",
    },
  ];

  return (
    <div className="step-form">
      <div className="step-icon">
        <Trophy size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Your Health Goals</h2>
      <p className="step-description">
        Hello {formData.firstName || "there"}! Select up to 3 goals that matter
        most to you.
      </p>

      <ErrorMessage message={error} />

      <div className="options-grid enhanced">
        {goalsOptions.map((goal) => (
          <button
            key={goal.value}
            type="button"
            className={`option-card enhanced ${
              formData.goals.includes(goal.value) ? "selected" : ""
            }`}
            onClick={() => handleToggle(goal.value)}
          >
            <div className="option-icon">
              <goal.icon size={24} color="#4F46E5" />
            </div>
            <span className="option-text">{goal.value}</span>
            <span className="option-description">{goal.description}</span>
            <div
              className={`option-check ${
                formData.goals.includes(goal.value) ? "checked" : ""
              }`}
            >
              {formData.goals.includes(goal.value) && "✓"}
            </div>
          </button>
        ))}
      </div>

      <div className="selection-summary">
        <div className="selection-count">
          {formData.goals.length}/3 goals selected
        </div>
        {formData.goals.length > 0 && (
          <div className="selected-goals">
            <strong>Selected:</strong> {formData.goals.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};

const BodyFatStep = ({ formData, handleChange, error }) => {
  const getBodyFatCategory = (percentage) => {
    const value = Number.parseFloat(percentage);
    if (isNaN(value)) return "";
    if (value < 10) return "Very Low";
    if (value < 15) return "Low";
    if (value < 20) return "Normal";
    if (value < 25) return "Moderate";
    return "High";
  };

  return (
    <div className="step-form">
      <div className="step-icon">
        <Activity size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Body Composition</h2>
      <p className="step-description">
        Enter your body fat percentage to help us create personalized
        recommendations.
      </p>

      <div className="form-group">
        <label htmlFor="bodyFatPercentage">Body Fat Percentage</label>
        <div className={`input-wrapper unit-input ${error ? "error" : ""}`}>
          <input
            type="number"
            id="bodyFatPercentage"
            name="bodyFatPercentage"
            value={formData.bodyFatPercentage}
            onChange={(e) => handleChange("bodyFatPercentage", e.target.value)}
            placeholder="Enter percentage"
            className={error ? "input-error" : ""}
            min="0"
            step="0.1"
          />
          <span className="unit-label">%</span>
          <div className="input-shine"></div>
        </div>
        <ErrorMessage message={error} />
        {formData.bodyFatPercentage && !error && (
          <div className="body-fat-info">
            <span className="category">
              Category: {getBodyFatCategory(formData.bodyFatPercentage)}
            </span>
          </div>
        )}
      </div>

      <div className="info-card enhanced">
        <Information size="20" color="#4F46E5" />
        <div>
          <h4>Don't know your body fat percentage?</h4>
          <p>You can estimate it or use these average values:</p>
          <ul>
            <li>Men: 15-20%</li>
            <li>Women: 20-25%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ActivityLevelStep = ({ formData, handleSelect, error }) => {
  const activityLevels = [
    {
      value: "Sedentary",
      description: "Little or no exercise, desk job",
      icon: Smallcaps,
      details: "Mostly sitting, minimal physical activity",
    },
    {
      value: "Lightly Active",
      description: "Light exercise 1-3 days/week",
      icon: Footprints,
      details: "Light workouts or walks occasionally",
    },
    {
      value: "Very Active",
      description: "Hard exercise 6-7 days/week",
      icon: Dumbbell,
      details: "Intense workouts almost daily",
    },
    {
      value: "Extremely Active",
      description: "Very hard exercise, physical job or training twice a day",
      icon: Flame,
      details: "Professional athlete level activity",
    },
  ];

  return (
    <div className="step-form">
      <div className="step-icon">
        <Activity size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Activity Level</h2>
      <p className="step-description">
        Select the option that best describes your typical weekly activity
        level.
      </p>

      <ErrorMessage message={error} />

      <div className="options-list enhanced">
        {activityLevels.map((level) => (
          <button
            key={level.value}
            type="button"
            className={`option-card list-style enhanced ${
              formData.activityLevel === level.value ? "selected" : ""
            }`}
            onClick={() => handleSelect(level.value)}
          >
            <div className="option-icon">
              <level.icon size={24} color="#4F46E5" />
            </div>
            <div className="option-content">
              <span className="option-title">{level.value}</span>
              <span className="option-description">{level.description}</span>
              <span className="option-details">{level.details}</span>
            </div>
            <div
              className={`option-check ${
                formData.activityLevel === level.value ? "checked" : ""
              }`}
            >
              {formData.activityLevel === level.value && "✓"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const DietaryPreferenceStep = ({ formData, handleSelect, error }) => {
  const dietaryPreferences = [
    {
      value: "Standard",
      icon: UtensilsCrossed,
      description: "No specific restrictions",
    },
    {
      value: "Vegetarian",
      icon: Leaf,
      description: "No meat, includes dairy & eggs",
    },
    {
      value: "Vegan",
      icon: Sprout,
      description: "Plant-based only",
    },
    {
      value: "Pescatarian",
      icon: Fish,
      description: "Fish and seafood included",
    },
    {
      value: "Paleo",
      icon: Drumstick,
      description: "Whole foods, no processed",
    },
    {
      value: "Keto",
      icon: Droplet,
      description: "High fat, low carb",
    },
    {
      value: "Mediterranean",
      icon: Heart,
      description: "Heart-healthy, balanced",
    },
    {
      value: "Low-carb",
      icon: Salad,
      description: "Reduced carbohydrates",
    },
    {
      value: "Gluten-free",
      icon: Ban,
      description: "No gluten-containing foods",
    },
    {
      value: "Dairy-free",
      icon: Milk,
      description: "No dairy products",
    },
  ];

  return (
    <div className="step-form">
      <div className="step-icon">
        <NutIcon size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Dietary Preference</h2>
      <p className="step-description">
        Select the eating pattern that best describes your dietary preferences.
      </p>

      <ErrorMessage message={error} />

      <div className="options-grid compact enhanced">
        {dietaryPreferences.map((preference) => (
          <button
            key={preference.value}
            type="button"
            className={`option-card compact enhanced ${
              formData.dietaryPreference === preference.value ? "selected" : ""
            }`}
            onClick={() => handleSelect(preference.value)}
          >
            <div className="option-icon">
              <preference.icon size={24} color="#4F46E5" />
            </div>
            <span className="option-text">{preference.value}</span>
            <span className="option-description">{preference.description}</span>
            {formData.dietaryPreference === preference.value && (
              <div className="option-check checked">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const FitnessGoalStep = ({ formData, handleSelect, error }) => {
  const fitnessGoals = [
    {
      value: "Weight Loss",
      icon: TrendingDown,
      description: "Reduce body weight",
    },
    {
      value: "Maintain",
      icon: Scale,
      description: "Keep current weight",
    },
    {
      value: "Muscle Gain",
      icon: Dumbbell,
      description: "Build muscle mass",
    },
    {
      value: "Increase Strength",
      icon: Flame,
      description: "Get stronger",
    },
    {
      value: "Improve Flexibility",
      icon: StretchHorizontal,
      description: "Better mobility",
    },
  ];

  return (
    <div className="step-form">
      <div className="step-icon">
        <Trophy size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Fitness Goal</h2>
      <p className="step-description">What is your primary fitness goal?</p>

      <ErrorMessage message={error} />

      <div className="options-grid enhanced">
        {fitnessGoals.map((goal) => (
          <button
            key={goal.value}
            type="button"
            className={`option-card icon-card enhanced ${
              formData.fitnessGoal === goal.value ? "selected" : ""
            }`}
            onClick={() => handleSelect(goal.value)}
          >
            <div className="option-icon">
              <goal.icon size={24} color="#4F46E5" />
            </div>
            <span className="option-text">{goal.value}</span>
            <span className="option-description">{goal.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const GoalsInfoStep = ({ formData }) => {
  return (
    <div className="step-form info-step">
      <div className="step-icon">
        <Trophy size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Your Goals Matter</h2>
      <p className="step-description">
        We understand, {formData.firstName || "there"}. A busy lifestyle can get
        in the way of achieving your health goals.
      </p>

      <div className="info-card large enhanced">
        <Trophy size="40" color="#4F46E5" />
        <h3>We've helped millions overcome obstacles</h3>
        <p>
          Our personalized approach has helped people just like you achieve
          their health goals despite busy schedules and other challenges.
        </p>
      </div>

      <div className="bullet-points">
        <div className="bullet-point">
          <span className="bullet-icon">
            <CheckCircle size={20} color="#4F46E5" />
          </span>
          <span>Personalized guidance tailored to you</span>
        </div>
        <div className="bullet-point">
          <span className="bullet-icon">
            <CheckCircle size={20} color="#4F46E5" />
          </span>
          <span>Realistic, achievable goals</span>
        </div>
        <div className="bullet-point">
          <span className="bullet-icon">
            <CheckCircle size={20} color="#4F46E5" />
          </span>
          <span>24/7 support when you need it</span>
        </div>
      </div>
    </div>
  );
};

const HabitsInfoStep = ({ formData }) => {
  return (
    <div className="step-form info-step">
      <div className="step-icon">
        <Activity size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Small Habits, Big Impact</h2>
      <p className="step-description">
        Great choices, {formData.firstName || "there"}! Your selections will
        help us create a personalized health plan.
      </p>

      <div className="info-card large enhanced">
        <Activity size="40" color="#4F46E5" />
        <h3>Building Sustainable Habits</h3>
        <p>
          We'll guide you to small wins that add up to big results over time.
          Our approach focuses on consistency rather than perfection.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card enhanced">
          <span className="stat-number">87%</span>
          <span className="stat-label">
            of users report improved habits within 30 days
          </span>
        </div>
        <div className="stat-card enhanced">
          <span className="stat-number">92%</span>
          <span className="stat-label">
            say our approach is easier to maintain long-term
          </span>
        </div>
      </div>
    </div>
  );
};

const MealPlansInfoStep = ({ formData }) => {
  return (
    <div className="step-form info-step">
      <div className="step-icon">
        <Restaurant size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Your Kitchen, Your Rules </h2>
      <p className="step-description">
        We can simplify your life with customized, flexible meal plans that fit
        your lifestyle.
      </p>

      <div className="info-card large enhanced">
        <Restaurant size="40" color="#4F46E5" />
        <h3>Personalized Meal Planning</h3>
        <p>
          Our meal plans adapt to your preferences, dietary needs, and schedule.
          You'll save time while eating healthier.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-item">
          <span className="feature-icon">
            <Clock size={20} color="#4F46E5" />
          </span>
          <span>Save time planning</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">
            <Wallet size={20} color="#4F46E5" />
          </span>
          <span>Reduce food waste</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">
            <Apple size={20} color="#4F46E5" />
          </span>
          <span>Balanced nutrition</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">
            <RefreshCcw size={20} color="#4F46E5" />
          </span>
          <span>Flexible options</span>
        </div>
      </div>
    </div>
  );
};

const PersonalInfoStep = ({ formData, handleChange, handleSelect, errors }) => {
  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInM = Number.parseFloat(formData.height) / 100;
      const weight = Number.parseFloat(formData.weight);
      const bmi = weight / (heightInM * heightInM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const bmi = calculateBMI();

  return (
    <div className="step-form">
      <div className="step-icon">
        <User size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Physical Details 📏</h2>
      <p className="step-description">
        This helps us personalize your experience and calculate your nutritional
        needs accurately.
      </p>

      <div className="form-row">
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
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="height">Height</label>
          <div
            className={`input-wrapper unit-input ${
              errors.height ? "error" : ""
            }`}
          >
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={(e) => handleChange("height", e.target.value)}
              placeholder="Enter height"
              className={errors.height ? "input-error" : ""}
              min="50"
              max="300"
            />
            <span className="unit-label">cm</span>
            <div className="input-shine"></div>
          </div>
          <ErrorMessage message={errors.height} />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight</label>
          <div
            className={`input-wrapper unit-input ${
              errors.weight ? "error" : ""
            }`}
          >
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="Enter weight"
              className={errors.weight ? "input-error" : ""}
              min="20"
              max="300"
            />
            <span className="unit-label">kg</span>
            <div className="input-shine"></div>
          </div>
          <ErrorMessage message={errors.weight} />
        </div>
      </div>

      {bmi && (
        <div className="bmi-info">
          <div className="bmi-card">
            <h4>Your BMI: {bmi}</h4>
            <span className="bmi-category">
              Category: {getBMICategory(Number.parseFloat(bmi))}
            </span>
          </div>
        </div>
      )}

      <div className="info-card enhanced">
        <Shield size="20" color="#4F46E5" />
        <p>
          Your information is secure and encrypted. We only use it to
          personalize your health experience.
        </p>
      </div>
    </div>
  );
};

const AccountSetupStep = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors,
}) => {
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

  return (
    <div className="step-form">
      <div className="step-icon">
        <Shield size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Create Your Account</h2>
      <p className="step-description">
        You're almost done! Set up your secure account to save your progress.
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
                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
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
        <Information size="16" color="#4F46E5" />
        <p>
          By registering, you agree to our{" "}
          <a href="terms-and-conditions" className="terms-link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="privacy-policy" className="terms-link">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
