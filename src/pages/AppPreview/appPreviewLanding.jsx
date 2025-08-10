import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Download,
  Star,
  Users,
  X,
  BarChart3,
  Heart,
  Target,
  Zap,
  Clock,
  Camera,
  MessageCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Wifi,
} from "lucide-react";
import "./appPreviewLanding.css";

const appScreenshots = [
  {
    id: 1,
    title: "Smart Dashboard",
    subtitle: "Your Health at a Glance",
    description:
      "Gain an immediate overview of your health status with real-time metrics, including categories, tracking, and insights, presented through an intuitive interface.",
    image: "/home.jpg",
    category: "Dashboard",
    color: "#3b82f6",
    features: [
      "Real-time Metrics",
      "Category Overview",
      "Tracking Insights",
      "Quick Navigation",
    ],
    stats: "95% accuracy",
  },
  {
    id: 2,
    title: "AI Food Scanner",
    subtitle: "Instant Nutrition Analysis",
    description:
      "Capture images of meals to receive instant nutritional analysis, including calorie counts and quality assessments, with options to log or retake scans.",
    image: "/detect.jpg",
    category: "Food Tracking",
    color: "#10b981",
    features: [
      "Camera Recognition",
      "Calorie Estimation",
      "Quality Assessment",
      "Log Functionality",
    ],
    stats: "2M+ foods recognized",
  },
  {
    id: 3,
    title: "Leaderboard",
    subtitle: "Track Your Rankings",
    description:
      "View and compare your ranking among peers, track experience points, levels, and activity streaks, and engage in a competitive health community.",
    image: "/leaderboard.jpg",
    category: "Social",
    color: "#f59e0b",
    features: [
      "Rank Display",
      "Experience Tracking",
      "Level Monitoring",
      "Streak Overview",
    ],
    stats: "54 total users",
  },
  {
    id: 4,
    title: "Nutrition Analytics",
    subtitle: "Detailed Nutrient Insights",
    description:
      "Analyze detailed nutrient statistics, including daily, weekly, and monthly trends, with pie charts and breakdowns of carbs, protein, and fats.",
    image: "/statis.jpg",
    category: "Analytics",
    color: "#8b5cf6",
    features: [
      "Nutrient Breakdown",
      "Trend Analysis",
      "Period Selection",
      "Chart Visualization",
    ],
    stats: "Advanced AI insights",
  },
  {
    id: 5,
    title: "Community Hub",
    subtitle: "Connect & Motivate",
    description:
      "Engage with a network of health enthusiasts through public groups, join challenges, and view leaderboards to share and celebrate achievements.",
    image: "/commynity.jpg",
    category: "Social",
    color: "#06b6d4",
    features: [
      "Group Participation",
      "Challenge Engagement",
      "Leaderboard Display",
      "Achievement Sharing",
    ],
    stats: "500K+ active users",
  },
  {
    id: 6,
    title: "Health Analytics",
    subtitle: "Deep Insights",
    description:
      "Analyze essential metrics such as dietary energy, intake, water consumption, and active energy, with detailed nutrient distribution and trends over selected periods.",
    image: "/ana.jpg",
    category: "Analytics",
    color: "#6366f1",
    features: [
      "Nutrient Analysis",
      "Trend Tracking",
      "Distribution Charts",
      "Period Selection",
    ],
    stats: "Advanced AI insights",
  },
];

const features = [
  {
    icon: Camera,
    title: "AI-Powered Recognition",
    description:
      "Scan any food instantly with 99% accuracy using advanced computer vision technology.",
    color: "#3b82f6",
    stats: "2M+ foods",
  },
  {
    icon: Target,
    title: "Smart Goal Setting",
    description:
      "Personalized goals that adapt to your progress and lifestyle for sustainable results.",
    color: "#8b5cf6",
    stats: "85% success rate",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Beautiful charts and insights that make understanding your health data effortless.",
    color: "#10b981",
    stats: "Real-time data",
  },
  {
    icon: MessageCircle,
    title: "Expert Guidance",
    description:
      "24/7 access to certified nutritionists and trainers for personalized support.",
    color: "#f59e0b",
    stats: "24/7 support",
  },
];

const stats = [
  { number: "500K+", label: "Happy Users", icon: Users, color: "#3b82f6" },
  { number: "4.9", label: "App Store Rating", icon: Star, color: "#f59e0b" },
  { number: "99%", label: "Accuracy Rate", icon: Target, color: "#10b981" },
  { number: "24/7", label: "Expert Support", icon: Clock, color: "#8b5cf6" },
];

const VideoModal = ({ isOpen, onClose, videoId }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="video-container">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title="App Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

const AppPreview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const intervalRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    setShowHints(false);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    setDragOffset(diff * 0.8);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    const threshold = 60;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragOffset(0);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    setShowHints(false);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    setDragOffset(diff * 0.8);
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;
    const threshold = 60;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragOffset(0);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const nextSlide = useCallback(() => {
    setIsAutoPlaying(false);

    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % appScreenshots.length;
      return nextIndex;
    });

    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, []);

  const prevSlide = useCallback(() => {
    setIsAutoPlaying(false);

    setCurrentIndex((prev) => {
      const prevIndex =
        (prev - 1 + appScreenshots.length) % appScreenshots.length;
      return prevIndex;
    });

    setTimeout(() => setIsAutoPlaying(true), 3000);
  }, []);

  const goToSlide = (index) => {
    if (index === currentIndex) return;

    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  useEffect(() => {
    if (isAutoPlaying && !isDragging) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % appScreenshots.length;
          return nextIndex;
        });
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlaying, isDragging]);

  const currentScreen = appScreenshots[currentIndex];

  return (
    <>
      <section className="app-preview-section">
        <div className="container">
          <div className="preview-header">
            <div className="badge-enhanced">
              <Sparkles size={16} />
              Interactive Experience
            </div>
            <h2 className="section-title-enhanced">
              Experience Our App
              <span className="gradient-text"> In Action</span>
            </h2>
            <p className="section-description-enhanced">
              Swipe through real app screens and discover how we're
              revolutionizing health tracking with beautiful design and
              intelligent features.
            </p>
          </div>

          <div className="demo-container">
            <div className="phone-section">
              <div className="phone-mockup">
                <div className="phone-frame">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div
                      className="screenshot-area"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <div
                        className="screenshot-slider"
                        style={{
                          transform: `translateX(calc(-${
                            currentIndex * 100
                          }% + ${dragOffset}px))`,
                          transition: isDragging
                            ? "none"
                            : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                      >
                        {appScreenshots.map((screenshot, index) => (
                          <div key={screenshot.id} className="screenshot-slide">
                            <div
                              className="screenshot-bg"
                              style={{ backgroundColor: "#fff" }}
                            >
                              <img
                                src={screenshot.image || "/placeholder.svg"}
                                alt={screenshot.title}
                                className="screenshot-image"
                                draggable={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Drag indicator */}
                      {isDragging && (
                        <div className="drag-feedback">
                          <div className="drag-icon">
                            {dragOffset > 20 ? (
                              <ArrowLeft size={20} />
                            ) : dragOffset < -20 ? (
                              <ArrowRight size={20} />
                            ) : (
                              "↔"
                            )}
                          </div>
                          <span className="drag-text">
                            {dragOffset > 20
                              ? "Go Back"
                              : dragOffset < -20
                              ? "Go Forward"
                              : "Keep dragging"}
                          </span>
                        </div>
                      )}

                      {/* Swipe hints */}
                      {showHints && !isDragging && (
                        <div className="swipe-hints">
                          <div className="swipe-hint left">
                            <ArrowLeft size={16} />
                          </div>
                          <div className="swipe-hint right">
                            <ArrowRight size={16} />
                          </div>
                          <div className="swipe-text">Swipe to explore</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="navigation-controls">
                <button className="nav-button prev" onClick={prevSlide}>
                  <ArrowLeft size={20} />
                </button>
                <span className="slide-counter">
                  {currentIndex + 1} / {appScreenshots.length}
                </span>
                <button className="nav-button next" onClick={nextSlide}>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="info-section">
              <div className="screen-info">
                <div className="screen-header">
                  <div
                    className="category-badge"
                    style={{ backgroundColor: currentScreen.color }}
                  >
                    {currentScreen.category}
                  </div>
                  <div className="screen-stats">{currentScreen.stats}</div>
                </div>
                <h3 className="screen-title">{currentScreen.title}</h3>
                <p className="screen-subtitle">{currentScreen.subtitle}</p>
                <p className="screen-description">
                  {currentScreen.description}
                </p>
                <div className="features-grid">
                  {currentScreen.features.map((feature, index) => (
                    <div key={index} className="feature-tag">
                      <CheckCircle size={14} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="action-section">
                <h4 className="action-title">Ready to get started?</h4>
                <p className="action-subtitle">
                  Join thousands of users transforming their health
                </p>
                <div className="action-buttons">
                  <button className="btn-primary">
                    <Download size={18} />
                    Download Free
                  </button>
                  <button
                    className="btn-secondary"
                    sx={{
                      color: "#000",
                    }}
                    onClick={() => setVideoModalOpen(true)}
                  >
                    <Play size={18} color="#000" />
                    Watch Demo
                  </button>
                </div>
                <div className="action-note">
                  <CheckCircle size={14} />
                  <span>Free forever • No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoId="dQw4w9WgXcQ"
      />
    </>
  );
};

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="container">
        <div className="section-header">
          <div className="badge-enhanced">
            <Zap size={16} />
            Powerful Features
          </div>
          <h2 className="section-title-enhanced">
            Everything You Need for
            <span className="gradient-text"> Perfect Health</span>
          </h2>
          <p className="section-description-enhanced">
            Discover the powerful features that make our app the #1 choice for
            health enthusiasts worldwide.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ backgroundColor: feature.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-stat">{feature.stats}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="badge-enhanced hero-badge">
              <Heart size={16} />
              #1 Health Tracking App
            </div>
            <h1 className="hero-title">
              Transform Your Health with
              <span className="gradient-text"> Smart Technology</span>
            </h1>
            <p className="hero-description">
              Join over 500,000 users who have revolutionized their wellness
              journey with our AI-powered health tracking platform. Beautiful,
              intuitive, and incredibly effective.
            </p>
            <div className="hero-actions">
              <button className="btn-primary large">
                <Download size={20} />
                Start Free Trial
              </button>
              <button
                className="btn-secondary large"
                onClick={() => setVideoModalOpen(true)}
              >
                <Play size={20} />
                Watch Demo
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>14-day free trial</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>No credit card required</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoId="dQw4w9WgXcQ"
      />
    </>
  );
};

export default function AppPreviewLanding() {
  return (
    <div className="app-landing">
      <Hero />
      <StatsSection />
      <AppPreview />
      <FeaturesSection />
    </div>
  );
}
