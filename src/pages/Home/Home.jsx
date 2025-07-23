import styles from "./Home.module.css";
import { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  AlarmClock,
  Users,
  Dumbbell,
  Utensils,
  LineChart,
} from "lucide-react";

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

// Particle Background Component
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
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
    <div className={styles["particle-background"]}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles["particle"]}
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

const Hero = () => {
  const [heroRef, heroInView] = useIntersectionObserver({ threshold: 0.1 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className={styles["hero-section"]} ref={heroRef}>
      <ParticleBackground />

      {/* Parallax Background */}
      <div
        className={styles["hero-parallax-bg"]}
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${
            mousePosition.y * 0.02
          }px)`,
        }}
      />

      <div
        className={`${styles["hero-content-block"]} ${
          heroInView ? styles["animate-in"] : ""
        }`}
      >
        <div className={styles["hero-title-block"]}>
          <div className={styles["hero-title-wrap"]}>
            <h1 className={styles["hero-title"]}>
              Transform Your Health with Smart Tracking
            </h1>
          </div>
          <div className={styles["hero-text-wrap"]}>
            <p className={styles["hero-description"]}>
              Complete health management platform with food logging, exercise
              tracking, smart reminders, and community support. Join our
              trainer-guided journey to achieve your wellness goals.
            </p>
          </div>
        </div>
        <a href="/experience" className={styles["primary-button"]}>
          <span className={styles["button-text"]}>Experience Our System</span>
          <div className={styles["button-ripple"]} />
        </a>
      </div>

      {/* Decorative Elements */}
      <div className={styles["hero-decorative-elements"]}>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-1"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${
              mousePosition.y * 0.01
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67597df37a4d2ed3e8663b94_lemon.webp"
            alt="Lemon"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-2"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.015}px, ${
              mousePosition.y * 0.015
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675983f20b549bc94731c2d5_strawberry.webp"
            alt="Strawberry"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-3"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${
              mousePosition.y * 0.02
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
            alt="Eclipse 1"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-4"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.012}px, ${
              mousePosition.y * 0.012
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759864e5f6bae487081d4ef_top-view-frame-with-green-leaves%201.svg"
            alt="Leaves 1"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-5"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.018}px, ${
              mousePosition.y * 0.018
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987f592aad76387d7f61a_hero-eclipse-3.svg"
            alt="Eclipse 3"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-6"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.014}px, ${
              mousePosition.y * 0.014
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675986d998aec26d74c31788_top-view-frame-with-green%202.svg"
            alt="Leaves 2"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-7"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.016}px, ${
              mousePosition.y * 0.016
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e3f784913c7fea9abd_hero-eclipse-5.svg"
            alt="Eclipse 5"
            loading="lazy"
          />
        </div>
        <div
          className={
            styles["hero-decorative"] + " " + styles["hero-decorative-8"]
          }
          style={{
            transform: `translate(${mousePosition.x * 0.013}px, ${
              mousePosition.y * 0.013
            }px)`,
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e45cfdde83519d1baa_hero-eclipse-6.svg"
            alt="Eclipse 6"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

// Services Component
const Services = () => {
  const [servicesRef, servicesInView] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      title: "Smart Food & Exercise Logging",
      description:
        "Easily track your daily meals, snacks, and workouts with our intuitive logging system. Get detailed nutritional insights and exercise analytics.",
      icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fbc0a38eb9ce4134711f_fi_14795645.png",
      link: "/services/food-exercise-logging",
    },
    {
      title: "Intelligent Reminders & Scheduling",
      description:
        "Never miss a meal or workout with our smart reminder system. Customize your schedule and get timely notifications for optimal health habits.",
      icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fc3634bb1be5a0ed546b_service-icon-2.png",
      link: "/services/smart-reminders",
    },
    {
      title: "Community & Trainer Support",
      description:
        "Connect with like-minded individuals, share your progress, and get guidance from certified trainers. Access personalized food and drink recommendations.",
      icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fcad3897207fb3f534d4_service-icon-3.png",
      link: "/services/community-trainer-support",
    },
  ];

  return (
    <section className={styles["services-section"]} ref={servicesRef}>
      <div className={styles["container"]}>
        <div
          className={`${styles["section-header"]} ${
            servicesInView ? styles["animate-in"] : ""
          }`}
        >
          <div className={styles["badge"]}>Core Features</div>
          <h2 className={styles["section-title"]}>
            Complete Health Management in One Platform
          </h2>
        </div>
        <div className={styles["services-grid"]}>
          {services.map((service, index) => (
            <div
              className={`${styles["service-card"]} ${
                servicesInView ? styles["animate-in"] : ""
              }`}
              key={index}
              style={{ animationDelay: `${index * 0.2}s` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <a className={styles["service-link"]}>
                <div className={styles["service-icon"]}>
                  <img
                    src={service.icon || "/placeholder.svg"}
                    alt={service.title}
                    loading="lazy"
                  />
                  <div className={styles["icon-glow"]} />
                </div>
                <div className={styles["service-content"]}>
                  <h4 className={styles["service-title"]}>{service.title}</h4>
                  <p className={styles["service-description"]}>
                    {service.description}
                  </p>
                </div>
                <div className={styles["card-shine"]} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Component
const Features = () => {
  const [featuresRef, featuresInView] = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <section className={styles["features-section"]} ref={featuresRef}>
      <div className={styles["container"]}>
        <div className={styles["features-layout"]}>
          <div
            className={`${styles["features-image"]} ${
              featuresInView ? styles["slide-in-left"] : ""
            }`}
          >
            <div className={styles["image-container"]}>
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/676f999d267ac329382730ff_Mask%20group.webp"
                alt="Features"
                loading="lazy"
              />
              <div className={styles["image-overlay"]} />
              <div className={styles["floating-stats"]}>
                <div className={styles["stat-bubble"]}>
                  <span className={styles["stat-number"]}>95%</span>
                  <span className={styles["stat-label"]}>Accuracy</span>
                </div>
                <div className={styles["stat-bubble"]}>
                  <span className={styles["stat-number"]}>50K+</span>
                  <span className={styles["stat-label"]}>Users</span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${styles["features-content"]} ${
              featuresInView ? styles["slide-in-right"] : ""
            }`}
          >
            <div className={styles["section-header"]}>
              <div className={styles["badge"]}>Advanced Technology</div>
              <h2 className={styles["section-title"]}>
                Your Personal Health Assistant
              </h2>
              <p className={styles["section-description"]}>
                Our comprehensive platform combines intelligent tracking,
                community support, and professional guidance to create a
                complete health management experience.
              </p>
            </div>
            <div className={styles["features-list"]}>
              <div className={styles["feature-item"]}>
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759c39ac353440c5aafc505_feature-widget-icon.svg"
                  alt="Feature Icon"
                  className={styles["feature-icon"]}
                  loading="lazy"
                />
                <div className={styles["feature-content"]}>
                  <h5 className={styles["feature-title"]}>
                    Comprehensive Logging System
                  </h5>
                  <p className={styles["feature-description"]}>
                    Track meals, exercises, water intake, and more with our
                    easy-to-use logging interface. Get detailed analytics and
                    progress reports.
                  </p>
                </div>
              </div>
              <div className={styles["feature-item"]}>
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759c5989238c4e4c8cbe34c_feature-widget-icon-2.svg"
                  alt="Feature Icon"
                  className={styles["feature-icon"]}
                  loading="lazy"
                />
                <div className={styles["feature-content"]}>
                  <h5 className={styles["feature-title"]}>
                    Smart Recommendations
                  </h5>
                  <p className={styles["feature-description"]}>
                    Receive personalized food and drink suggestions based on
                    your goals, preferences, and dietary restrictions from our
                    expert trainers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Benefits Component
const Benefits = () => {
  const [benefitsRef, benefitsInView] = useIntersectionObserver({
    threshold: 0.1,
  });

  const benefits = [
    {
      title: "Effortless Food & Exercise Tracking",
      description:
        "Log your meals and workouts in seconds with our intuitive interface. Barcode scanning and exercise library make tracking effortless.",
      icon: Smartphone,
      stats: "Quick & Easy Logging",
      color: "benefit-card-blue",
    },
    {
      title: "Never Miss Your Health Goals",
      description:
        "Smart reminders keep you on track with personalized notifications for meals, workouts, water intake, and medication schedules.",
      icon: AlarmClock,
      stats: "Intelligent Scheduling",
      color: "benefit-card-green",
    },
    {
      title: "Vibrant Health Community",
      description:
        "Share your journey, get motivated by others, and celebrate achievements together in our supportive community.",
      icon: Users,
      stats: "Community Support",
      color: "benefit-card-orange",
    },
    {
      title: "Expert Trainer Guidance",
      description:
        "Access certified trainers for personalized advice, workout plans, and nutrition guidance tailored to your goals.",
      icon: Dumbbell,
      stats: "Professional Support",
      color: "benefit-card-purple",
    },
    {
      title: "Personalized Food Recommendations",
      description:
        "Get smart suggestions for healthy meals and snacks based on your preferences, goals, and dietary requirements.",
      icon: Utensils,
      stats: "Smart Suggestions",
      color: "benefit-card-red",
    },
    {
      title: "Complete Progress Analytics",
      description:
        "Detailed insights into your health journey with charts, trends, and achievements to keep you motivated.",
      icon: LineChart,
      stats: "Data-Driven Insights",
      color: "benefit-card-teal",
    },
  ];

  return (
    <section className={styles["benefits-section"]} ref={benefitsRef}>
      <div className={styles["container"]}>
        <div
          className={`${styles["section-header"]} ${
            benefitsInView ? styles["animate-in"] : ""
          }`}
        >
          <div className={styles["badge"]}>Why Choose Our Platform</div>
          <h2 className={styles["section-title"]}>
            Everything You Need for Health Success
          </h2>
          <p className={styles["section-description"]}>
            Discover how our comprehensive health management platform helps you
            build lasting healthy habits with the support you need to succeed.
          </p>
        </div>
        <div className={styles["benefits-grid"]}>
          {benefits.map((benefit, index) => (
            <div
              className={`benefit-card ${benefit.color} ${
                styles["benefit-card"]
              } ${benefitsInView ? styles["animate-in"] : ""}`}
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles["benefit-icon"]}>
                <benefit.icon className={styles["benefit-icon-svg"]} />
                <div className={styles["icon-pulse"]} />
              </div>
              <div className={styles["benefit-content"]}>
                <h4 className={styles["benefit-title"]}>{benefit.title}</h4>
                <p className={styles["benefit-description"]}>
                  {benefit.description}
                </p>
                <div className={styles["benefit-stats"]}>{benefit.stats}</div>
              </div>
              <div className={styles["card-shine"]} />
            </div>
          ))}
        </div>
        <div className={styles["benefits-cta"]}>
          <a href="/experience" className={styles["primary-button"]}>
            <span className={styles["button-text"]}>
              Start Your Health Journey
            </span>
            <div className={styles["button-ripple"]} />
          </a>
        </div>
      </div>
    </section>
  );
};

// CTA Component
const CTA = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [ctaRef, ctaInView] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className={styles["cta-section"]} ref={ctaRef}>
      <div className={styles["container"]}>
        <div
          className={`${styles["cta-content"]} ${
            ctaInView ? styles["animate-in"] : ""
          }`}
        >
          <div className={styles["section-header"]}>
            <div className={styles["badge"] + " " + styles["cta-badge"]}>
              Start Your Journey Today
            </div>
            <h2 className={styles["section-title"] + " " + styles["cta-title"]}>
              Ready to Transform Your Health?
            </h2>
            <div className={styles["cta-description-container"]}>
              <p className={styles["cta-description"]}>
                Join thousands of users who have already transformed their lives
                with our comprehensive health management platform. Start
                tracking, get support, and achieve your wellness goals today.
              </p>
            </div>
          </div>
          <div className={styles["cta-button-wrap"]}>
            <a
              href="/services"
              className={styles["primary-button"] + " " + styles["cta-button"]}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <span className={styles["button-text"]}>
                Experience Our System
              </span>
              <div className={styles["button-ripple"]} />
            </a>
            <p className={styles["cta-note"]}>
              Free 14-day trial • No credit card required • Full access to all
              features
            </p>
          </div>
          <div className={styles["cta-features"]}>
            <div className={styles["cta-feature-item"]}>
              <span className={styles["cta-feature-icon"]}>✓</span>
              <span className={styles["cta-feature-text"]}>
                Food & Exercise Logging
              </span>
            </div>
            <div className={styles["cta-feature-item"]}>
              <span className={styles["cta-feature-icon"]}>✓</span>
              <span className={styles["cta-feature-text"]}>
                Smart Reminders
              </span>
            </div>
            <div className={styles["cta-feature-item"]}>
              <span className={styles["cta-feature-icon"]}>✓</span>
              <span className={styles["cta-feature-text"]}>
                Community Support
              </span>
            </div>
            <div className={styles["cta-feature-item"]}>
              <span className={styles["cta-feature-icon"]}>✓</span>
              <span className={styles["cta-feature-text"]}>
                Trainer Guidance
              </span>
            </div>
          </div>
          <div className={`cta-decorative ${isButtonHovered ? "hovered" : ""}`}>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-1"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6770c1a33f51743692ff64b6_avocado-slice-isolated-white%201.webp"
                alt="Avocado"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-2"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675983f20b549bc94731c2d5_strawberry.webp"
                alt="Strawberry"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-3"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
                alt="Leaf Particle"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-4"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987f592aad76387d7f61a_hero-eclipse-3.svg"
                alt="Leaf Particle"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-5"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675986d998aec26d74c31788_top-view-frame-with-green%202.svg"
                alt="Leaf Particle"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-6"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e3f784913c7fea9abd_hero-eclipse-5.svg"
                alt="Leaf Particle"
                loading="lazy"
              />
            </div>
            <div
              className={
                styles["cta-decorative-item"] + " " + styles["cta-decorative-7"]
              }
            >
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e45cfdde83519d1baa_hero-eclipse-6.svg"
                alt="Decorative Particle"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Home Component
const Home = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className={styles["home-page"]}>
      <Hero />
      <Services />
      <Features />
      <Benefits />
      <CTA />
    </div>
  );
};

export default Home;
