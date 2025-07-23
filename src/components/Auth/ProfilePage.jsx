import { useState, useEffect } from "react";
import {
  Home2,
  ArrowLeft,
  ArrowRight,
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
import { useNavigate } from "react-router-dom";
import { Restaurant } from "@mui/icons-material";
import apiProfileService from "services/apiProfileService";
import Swal from "sweetalert2";
import "./Register.css";

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

const ProfilePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goals: [],
    bodyFatPercentage: "",
    activityLevel: "",
    dietaryPreference: "",
    fitnessGoal: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
  });
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.accessToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "Please log in to complete your profile.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
      return;
    }
    const isProfileCompleted = localStorage.getItem("isProfileCompleted");
    if (isProfileCompleted === "true" || isProfileCompleted === undefined) {
      navigate("/");
    }

    return () => clearTimeout(timer);
  }, [navigate]);

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

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (formData.goals.length === 0) {
          newErrors.goals =
            "Please select at least one goal to personalize your journey";
          isValid = false;
        } else if (formData.goals.length > 3) {
          newErrors.goals = "Please select up to 3 goals for better focus";
          isValid = false;
        }
        break;

      case 1:
        if (!formData.bodyFatPercentage) {
          newErrors.bodyFatPercentage =
            "Body fat percentage is required for personalized recommendations";
          isValid = false;
        } else {
          const bodyFat = Number.parseFloat(formData.bodyFatPercentage);
          if (isNaN(bodyFat)) {
            newErrors.bodyFatPercentage = "Please enter a valid number";
            isValid = false;
          } else if (bodyFat < 0 || bodyFat > 100) {
            newErrors.bodyFatPercentage =
              "Body fat percentage must be between 0 and 100";
            isValid = false;
          }
        }
        break;

      case 2:
        if (!formData.activityLevel) {
          newErrors.activityLevel =
            "Activity level is required to calculate your calorie needs";
          isValid = false;
        }
        break;

      case 3:
        if (!formData.dietaryPreference) {
          newErrors.dietaryPreference =
            "Dietary preference is required for suitable meal plans";
          isValid = false;
        }
        break;

      case 4:
        if (!formData.fitnessGoal) {
          newErrors.fitnessGoal =
            "Fitness goal is required for targeted workout plans";
          isValid = false;
        }
        break;

      case 8:
        if (!formData.height) {
          newErrors.height =
            "Height is required for BMI and calorie calculations";
          isValid = false;
        } else {
          const height = Number.parseFloat(formData.height);
          if (isNaN(height) || height < 50 || height > 300) {
            newErrors.height =
              "Please enter a valid height between 50 and 300 cm";
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
            newErrors.weight =
              "Please enter a valid weight between 20 and 300 kg";
            isValid = false;
          }
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = async () => {
    if (validateCurrentStep()) {
      if (currentStep === totalSteps - 1) {
        try {
          Swal.fire({
            title: "Saving Profile...",
            text: "Please wait while we save your profile.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const heightInMeters = Number.parseFloat(formData.height) / 100;
          const weightInKg = Number.parseFloat(formData.weight);
          const bmi =
            heightInMeters && weightInKg
              ? Number(
                  (weightInKg / (heightInMeters * heightInMeters)).toFixed(2)
                )
              : 0;

          const profileData = {
            userId:
              JSON.parse(localStorage.getItem("user") || "{}")?.userId || 0,
            profileId: 0,
            height: Number.parseFloat(formData.height) || 0,
            weight: Number.parseFloat(formData.weight) || 0,
            bmi: bmi,
            bodyFatPercentage:
              Number.parseFloat(formData.bodyFatPercentage) || 0,
            activityLevel: formData.activityLevel || "Moderate",
            dietaryPreference: formData.dietaryPreference || "Balanced",
            fitnessGoal: formData.fitnessGoal || "Maintain",
          };

          const response = await apiProfileService.registerProfile(profileData);
          if (response.statusCode !== 201) {
            throw new Error(
              response.errors
                ? Object.entries(response.errors)
                    .map(
                      ([field, messages]) => `${field}: ${messages.join(", ")}`
                    )
                    .join("\n")
                : "Profile creation failed"
            );
          }

          localStorage.setItem("isProfileCompleted", "true");
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Profile Saved!",
            text: "Your profile has been successfully saved.",
            timer: 2000,
            showConfirmButton: false,
          });

          setTimeout(() => {
            localStorage.removeItem("isProfileCompleted");
            navigate("/");
          }, 2000);
        } catch (error) {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Failed to save profile. Please try again.",
          });
        }
      } else {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
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

  const handleHomeClick = () => {
    navigate("/");
  };

  const getStepTitle = () => {
    const titles = [
      "Your Goals",
      "Body Composition",
      "Activity Level",
      "Dietary Preference",
      "Fitness Goal",
      "Your Journey",
      "Building Habits",
      "Meal Planning",
      "Physical Details",
    ];
    return titles[currentStep] || "Profile Setup";
  };

  const getStepDescription = () => {
    const descriptions = [
      "What health goals are most important to you?",
      "Help us understand your current fitness level",
      "How active are you in a typical week?",
      "What eating style works best for you?",
      "What's your primary fitness objective?",
      "Understanding your motivation",
      "Building sustainable healthy habits",
      "Personalized nutrition planning",
      "Physical details for accurate calculations",
    ];
    return descriptions[currentStep] || "";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GoalsStep
            formData={formData}
            handleToggle={(goal) => handleToggle("goals", goal)}
            error={errors.goals}
          />
        );
      case 1:
        return (
          <BodyFatStep
            formData={formData}
            handleChange={handleChange}
            error={errors.bodyFatPercentage}
          />
        );
      case 2:
        return (
          <ActivityLevelStep
            formData={formData}
            handleSelect={(level) => handleSelect("activityLevel", level)}
            error={errors.activityLevel}
          />
        );
      case 3:
        return (
          <DietaryPreferenceStep
            formData={formData}
            handleSelect={(preference) =>
              handleSelect("dietaryPreference", preference)
            }
            error={errors.dietaryPreference}
          />
        );
      case 4:
        return (
          <FitnessGoalStep
            formData={formData}
            handleSelect={(goal) => handleSelect("fitnessGoal", goal)}
            error={errors.fitnessGoal}
          />
        );
      case 5:
        return <GoalsInfoStep formData={formData} />;
      case 6:
        return <HabitsInfoStep formData={formData} />;
      case 7:
        return <MealPlansInfoStep formData={formData} />;
      case 8:
        return (
          <PhysicalDetailsStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <ParticleBackground />
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
              onClick={handleNextStep}
              type="button"
            >
              <span>
                {currentStep === totalSteps - 1 ? "Save Profile" : "Continue"}
              </span>
              <ArrowRight size="20" color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
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
        Select up to 3 goals that matter most to you.
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
            max="100"
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
            {formData.fitnessGoal === goal.value && (
              <div className="option-check checked">✓</div>
            )}
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
        Your goals are important to us. A busy lifestyle can get in the way, but
        we're here to help.
      </p>
      <div className="info-card large enhanced">
        <Trophy size="40" color="#4F46E5" />
        <h3>We've helped millions overcome obstacles</h3>
        <p>
          Our personalized approach has helped people achieve their health goals
          despite busy schedules and other challenges.
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
        Great choices! Your selections will help us create a personalized health
        plan.
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
      <h2 className="step-subtitle">Your Kitchen, Your Rules</h2>
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

const PhysicalDetailsStep = ({ formData, handleChange, errors }) => {
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
        <Shield size="48" color="#4F46E5" />
      </div>
      <h2 className="step-subtitle">Physical Details</h2>
      <p className="step-description">
        Enter your height and weight to calculate your nutritional needs
        accurately.
      </p>
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
              step="0.1"
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
              step="0.1"
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

export default ProfilePage;
