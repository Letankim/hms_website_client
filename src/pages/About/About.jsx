import styles from "./About.module.css";

const Team = () => {
  const teamMembers = [
    {
      name: "Le Tan Kim",
      role: "Chief Medical Officer",
      description:
        "15+ years in preventive medicine and digital health innovation",
      image: "/kim.png",
      expertise: "Medical Research",
    },
    {
      name: "Đặng Phước Ân",
      role: "AI Technology Lead",
      description:
        "Expert in computer vision and machine learning for health applications",
      image: "/an.jpg",
      expertise: "AI & Machine Learning",
    },
    {
      name: "Bùi Chí Cường",
      role: "Nutrition Director",
      description:
        "Certified nutritionist with expertise in personalized dietary planning",
      image: "/cuong.jpg",
      expertise: "Nutrition Science",
    },
    {
      name: "Trương Văn Thắng",
      role: "Fitness Technology Specialist",
      description:
        "Former Olympic trainer specializing in wearable device integration",
      image: "/thang.jpg",
      expertise: "Fitness Technology",
    },
  ];

  return (
    <section className={styles["team-section"]}>
      <div className={styles["container"]}>
        <div className={styles["section-header"]}>
          <div className={styles["badge"]}>Our Expert Team</div>
          <h2 className={styles["section-title"]}>
            Meet the Minds Behind Your Health Journey
          </h2>
          <p className={styles["section-description"]}>
            Our diverse team of medical professionals, AI specialists, and
            wellness experts work together to create the most comprehensive
            health management platform.
          </p>
        </div>
        <div className={styles["team-grid"]}>
          {teamMembers.map((member, index) => (
            <div className={styles["team-card"]} key={index}>
              <div className={styles["team-image"]}>
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  loading="lazy"
                />
                <div className={styles["team-overlay"]}>
                  <span className={styles["team-expertise"]}>
                    {member.expertise}
                  </span>
                </div>
              </div>
              <div className={styles["team-content"]}>
                <h4 className={styles["team-name"]}>{member.name}</h4>
                <p className={styles["team-role"]}>{member.role}</p>
                <p className={styles["team-description"]}>
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Mission Component
const Mission = () => {
  return (
    <section className={styles["mission-section"]}>
      <div className={styles["container"]}>
        <div className={styles["mission-layout"]}>
          <div className={styles["mission-content"]}>
            <div className={styles["section-header"]}>
              <div className={styles["badge"]}>Our Mission</div>
              <h2 className={styles["section-title"]}>
                Revolutionizing Health Management Through AI Innovation
              </h2>
            </div>
            <div className={styles["mission-text"]}>
              <p>
                In today's fast-paced world, managing your health shouldn't
                require juggling multiple apps and manual data entry. We believe
                everyone deserves access to comprehensive, intelligent health
                management tools that make wellness achievable and sustainable.
              </p>
              <p>
                Our mission is to eliminate the fragmentation in health tracking
                by providing a single, AI-powered platform that understands your
                complete health picture. Through cutting-edge food recognition
                technology and seamless wearable integration, we're making
                health management effortless and accurate.
              </p>
            </div>
            <div className={styles["mission-stats"]}>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-number"]}>50K+</span>
                <span className={styles["stat-label"]}>Active Users</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-number"]}>95%</span>
                <span className={styles["stat-label"]}>Accuracy Rate</span>
              </div>
              <div className={styles["stat-item"]}>
                <span className={styles["stat-number"]}>24/7</span>
                <span className={styles["stat-label"]}>AI Monitoring</span>
              </div>
            </div>
          </div>
          <div className={styles["mission-image"]}>
            <img src="/home.jpg" alt="Health Technology" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Technology Component
const Technology = () => {
  const technologies = [
    {
      title: "YOLO Food Recognition",
      description:
        "Advanced computer vision technology that instantly identifies food items from photos with 95% accuracy",
      icon: "🔍",
      features: [
        "Real-time detection",
        "Multi-food recognition",
        "Portion estimation",
      ],
    },
    {
      title: "CNN Nutritional Analysis",
      description:
        "Deep learning networks that analyze nutritional content and provide detailed macro and micronutrient breakdowns",
      icon: "🧠",
      features: [
        "Nutrient calculation",
        "Calorie estimation",
        "Dietary insights",
      ],
    },
    {
      title: "Wearable Integration",
      description:
        "Seamless connection with popular fitness trackers and health monitors for comprehensive data collection",
      icon: "⌚",
      features: ["Heart rate monitoring", "Sleep tracking", "Activity logging"],
    },
    {
      title: "AI Personalization",
      description:
        "Machine learning algorithms that adapt recommendations based on your unique health profile and goals",
      icon: "🎯",
      features: [
        "Custom meal plans",
        "Exercise recommendations",
        "Health predictions",
      ],
    },
  ];

  return (
    <section className={styles["technology-section"]}>
      <div className={styles["container"]}>
        <div className={styles["section-header"]}>
          <div className={styles["badge"]}>Cutting-Edge Technology</div>
          <h2 className={styles["section-title"]}>
            The AI Power Behind Your Health Journey
          </h2>
          <p className={styles["section-description"]}>
            Our platform leverages the latest advances in artificial
            intelligence and computer vision to provide you with the most
            accurate and personalized health insights.
          </p>
        </div>
        <div className={styles["technology-grid"]}>
          {technologies.map((tech, index) => (
            <div className={styles["tech-card"]} key={index}>
              <div className={styles["tech-icon"]}>
                <span className={styles["tech-emoji"]}>{tech.icon}</span>
              </div>
              <div className={styles["tech-content"]}>
                <h4 className={styles["tech-title"]}>{tech.title}</h4>
                <p className={styles["tech-description"]}>{tech.description}</p>
                <ul className={styles["tech-features"]}>
                  {tech.features.map((feature, idx) => (
                    <li key={idx} className={styles["tech-feature"]}>
                      <span className={styles["feature-check"]}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Story Component
const Story = () => {
  return (
    <section className={styles["story-section"]}>
      <div className={styles["container"]}>
        <div className={styles["story-layout"]}>
          <div className={styles["story-image"]}>
            <img src="/logo_loading.png" alt="Our Story" loading="lazy" />
          </div>
          <div className={styles["story-content"]}>
            <div className={styles["section-header"]}>
              <div className={styles["badge"]}>Our Story</div>
              <h2 className={styles["section-title"]}>
                From Frustration to Innovation
              </h2>
            </div>
            <div className={styles["story-text"]}>
              <p>
                Our journey began when our founder, struggling to manage
                multiple health apps, realized there had to be a better way. The
                constant switching between nutrition trackers, fitness apps, and
                health monitors was not only frustrating but also prevented a
                complete understanding of overall wellness.
              </p>
              <p>
                We assembled a team of medical professionals, AI researchers,
                and wellness experts to create a solution that would
                revolutionize how people approach health management. Our
                breakthrough came with the development of advanced food
                recognition technology that eliminates the tedious process of
                manual food logging.
              </p>
              <p>
                Today, we're proud to serve thousands of users worldwide,
                helping them achieve their health goals through intelligent,
                personalized, and comprehensive health management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main About Component
const About = () => {
  return (
    <div className={styles["about-page"]}>
      <section className={styles["hero-section"]}>
        <div className={styles["container"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["badge"]}>About Our Platform</div>
            <h1 className={styles["hero-title"]}>
              Transforming Health Management Through AI Innovation
            </h1>
            <p className={styles["hero-description"]}>
              We're on a mission to revolutionize how people manage their health
              by combining cutting-edge AI technology with comprehensive
              wellness tracking in one unified platform.
            </p>
          </div>
        </div>
      </section>
      <Story />
      <Mission />
      <Technology />
      <Team />
    </div>
  );
};

export default About;
