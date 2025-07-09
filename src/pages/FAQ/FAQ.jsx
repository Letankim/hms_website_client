import styles from "./FAQ.module.css";
import { useState } from "react";


const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div
      className={`${styles["faq-item"]} ${
        isOpen ? styles["faq-item-open"] : ""
      }`}
    >
      <button className={styles["faq-question"]} onClick={onToggle}>
        <span>{question}</span>
        <span className={styles["faq-icon"]}>{isOpen ? "−" : "+"}</span>
      </button>
      <div className={styles["faq-answer"]}>
        <div className={styles["faq-answer-content"]}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

// FAQ Section Component
const FAQSection = ({ title, faqs, badge }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className={styles["faq-section"]}>
      <div className={styles["container"]}>
        <div className={styles["section-header"]}>
          <div className={styles["badge"]}>{badge}</div>
          <h2 className={styles["section-title"]}>{title}</h2>
        </div>
        <div className={styles["faq-list"]}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItems[index]}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Main FAQ Component
const FAQ = () => {
  const generalFAQs = [
    {
      question:
        "What makes your health management platform different from other apps?",
      answer:
        "Our platform is the first to integrate advanced AI-powered food recognition using YOLO and CNN technology, allowing you to simply take photos of your meals for instant nutritional analysis. We also provide comprehensive health tracking in one unified platform, eliminating the need for multiple apps.",
    },
    {
      question: "How accurate is the food recognition technology?",
      answer:
        "Our YOLO and CNN-powered food recognition system achieves 95% accuracy in identifying food items and estimating nutritional content. The system continuously learns and improves from user feedback and new data.",
    },
    {
      question: "What devices and wearables are compatible with your platform?",
      answer:
        "We support integration with major fitness trackers and health monitors including Apple Watch, Fitbit, Garmin, Samsung Galaxy Watch, and many others. Our platform can sync heart rate, sleep patterns, activity levels, and other health metrics automatically.",
    },
    {
      question: "Is my health data secure and private?",
      answer:
        "Absolutely. We use enterprise-grade encryption and follow HIPAA compliance standards to protect your health information. Your data is never shared with third parties without your explicit consent, and you maintain full control over your privacy settings.",
    },
    {
      question: "Can healthcare professionals access my data?",
      answer:
        "Only with your permission. Our platform supports multiple user roles including healthcare providers, nutritionists, and fitness trainers. You can choose to share specific health data with your healthcare team to enhance your care.",
    },
  ];

  const featureFAQs = [
    {
      question: "How does the AI food recognition work?",
      answer:
        "Simply take a photo of your meal using our app. Our YOLO algorithm instantly identifies all food items in the image, while our CNN networks analyze nutritional content, portion sizes, and calorie counts. The entire process takes just seconds.",
    },
    {
      question: "Can I track exercise and physical activities?",
      answer:
        "Yes! Our platform automatically syncs with your wearable devices to track workouts, steps, heart rate, and other fitness metrics. You can also manually log activities and receive personalized exercise recommendations based on your goals.",
    },
    {
      question: "What kind of personalized recommendations do I receive?",
      answer:
        "Our AI engine analyzes your complete health profile including nutrition, exercise, sleep, and biometric data to provide personalized meal plans, workout suggestions, and health insights tailored to your specific goals and preferences.",
    },
    {
      question: "Is there a community feature?",
      answer:
        "Yes! Connect with other users on similar health journeys, share progress, participate in challenges, and get motivation from our supportive community. You can also access guidance from certified trainers and nutrition professionals.",
    },
    {
      question: "Can I set health goals and track progress?",
      answer:
        "Absolutely. Set custom goals for weight management, fitness improvement, nutrition targets, or general wellness. Our platform provides detailed progress tracking with charts, trends, and achievement milestones to keep you motivated.",
    },
  ];

  const technicalFAQs = [
    {
      question: "What are the system requirements?",
      answer:
        "Our platform works on iOS 12+, Android 8+, and modern web browsers. For optimal food recognition, we recommend devices with cameras of 8MP or higher. The app requires internet connection for AI processing and data sync.",
    },
    {
      question: "Does the app work offline?",
      answer:
        "Basic logging features work offline, but AI food recognition and real-time recommendations require internet connection. All offline data automatically syncs when you're back online.",
    },
    {
      question: "How often is the app updated?",
      answer:
        "We release updates monthly with new features, improved AI accuracy, and enhanced user experience. Critical security updates are deployed immediately as needed.",
    },
    {
      question: "Can I export my health data?",
      answer:
        "Yes, you can export your complete health data in standard formats (CSV, PDF) at any time. This ensures you always have access to your information and can share it with healthcare providers if needed.",
    },
    {
      question: "What happens if I cancel my subscription?",
      answer:
        "You can continue using basic features with limited AI functionality. Your data remains accessible for 12 months, giving you time to export or reactivate your account. Premium features like advanced AI recommendations require an active subscription.",
    },
  ];

  return (
    <div className={styles["faq-page"]}>
      <section className={styles["hero-section"]}>
        <div className={styles["container"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["badge"]}>Frequently Asked Questions</div>
            <h1 className={styles["hero-title"]}>
              Everything You Need to Know
            </h1>
            <p className={styles["hero-description"]}>
              Find answers to common questions about our AI-powered health
              management platform, features, and how to get the most out of your
              wellness journey.
            </p>
          </div>
        </div>
      </section>

      <FAQSection
        title="General Questions"
        faqs={generalFAQs}
        badge="Getting Started"
      />

      <FAQSection
        title="Features & Functionality"
        faqs={featureFAQs}
        badge="Platform Features"
      />

      <FAQSection
        title="Technical Support"
        faqs={technicalFAQs}
        badge="Technical Details"
      />

      <section className={styles["contact-section"]}>
        <div className={styles["container"]}>
          <div className={styles["contact-content"]}>
            <h2 className={styles["contact-title"]}>Still Have Questions?</h2>
            <p className={styles["contact-description"]}>
              Can't find the answer you're looking for? Our support team is here
              to help you get the most out of your health management journey.
            </p>
            <div className={styles["contact-buttons"]}>
              <a href="/contact" className={styles["primary-button"]}>
                Contact Support
              </a>
              <a href="/experience" className={styles["secondary-button"]}>
                Try Our Platform
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
