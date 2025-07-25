import styles from "./PrivacyPolicy.module.css";
import { useState } from "react";

const PrivacyItem = ({ title, content, isOpen, onToggle }) => {
  return (
    <div
      className={`${styles["privacy-item"]} ${
        isOpen ? styles["privacy-item-open"] : ""
      }`}
    >
      <button className={styles["privacy-question"]} onClick={onToggle}>
        <span>{title}</span>
        <span className={styles["privacy-icon"]}>{isOpen ? "−" : "+"}</span>
      </button>
      <div className={styles["privacy-answer"]}>
        <div className={styles["privacy-answer-content"]}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

const PrivacySection = ({ title, policies, badge }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className={styles["privacy-section"]}>
      <div className={styles["container"]}>
        <div className={styles["section-header"]}>
          <div className={styles["badge"]}>{badge}</div>
          <h2 className={styles["section-title"]}>{title}</h2>
        </div>
        <div className={styles["privacy-list"]}>
          {policies.map((policy, index) => (
            <PrivacyItem
              key={index}
              title={policy.title}
              content={policy.content}
              isOpen={openItems[index]}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const dataCollectionPolicies = [
  {
    title: "Information We Collect",
    content: `
      <p>We collect several types of information to provide and improve our health management services:</p>
      <h4>Personal Information:</h4>
      <ul>
        <li>Name, email address, phone number</li>
        <li>Date of birth, gender, location</li>
        <li>Profile photos and preferences</li>
        <li>Account credentials and security information</li>
      </ul>
      <h4>Health Data:</h4>
      <ul>
        <li>Physical measurements (height, weight, BMI)</li>
        <li>Fitness activity and exercise data</li>
        <li>Nutritional intake and meal photos</li>
        <li>Sleep patterns and wellness metrics</li>
        <li>Health goals and progress tracking</li>
      </ul>
      <h4>Device and Usage Data:</h4>
      <ul>
        <li>Device information and operating system</li>
        <li>App usage patterns and feature interactions</li>
        <li>Location data (with your permission)</li>
        <li>Camera and photo data for food recognition</li>
      </ul>
    `,
  },
  {
    title: "How We Collect Your Information",
    content: `
      <p>We collect information through various methods to ensure comprehensive health tracking:</p>
      <h4>Direct Collection:</h4>
      <ul>
        <li>Information you provide during registration</li>
        <li>Data you enter manually in the app</li>
        <li>Photos you take for food recognition</li>
        <li>Feedback and communications with our support team</li>
      </ul>
      <h4>Automatic Collection:</h4>
      <ul>
        <li>Wearable device integrations (Fitbit, Apple Watch, etc.)</li>
        <li>Health app synchronization (Apple Health, Google Fit)</li>
        <li>Usage analytics and app performance data</li>
        <li>Location services (when enabled)</li>
      </ul>
      <h4>Third-Party Sources:</h4>
      <ul>
        <li>Social media login information (with consent)</li>
        <li>Healthcare provider integrations (with authorization)</li>
        <li>Nutrition databases and food information</li>
      </ul>
    `,
  },
  {
    title: "Legal Basis for Processing",
    content: `
      <p>We process your personal data based on the following legal grounds:</p>
      <h4>Consent:</h4>
      <ul>
        <li>You have given clear consent for specific processing activities</li>
        <li>Marketing communications and promotional content</li>
        <li>Optional features like location tracking</li>
      </ul>
      <h4>Contract Performance:</h4>
      <ul>
        <li>Processing necessary to provide our health services</li>
        <li>Account management and subscription billing</li>
        <li>AI-powered recommendations and analysis</li>
      </ul>
      <h4>Legitimate Interest:</h4>
      <ul>
        <li>Improving our services and user experience</li>
        <li>Security and fraud prevention</li>
        <li>Analytics for service optimization</li>
      </ul>
      <h4>Legal Compliance:</h4>
      <ul>
        <li>Compliance with healthcare regulations</li>
        <li>Tax and accounting requirements</li>
        <li>Response to legal requests</li>
      </ul>
    `,
  },
];

const dataUsagePolicies = [
  {
    title: "How We Use Your Information",
    content: `
      <p>Your information is used to provide personalized health services and improve your wellness journey:</p>
      <h4>Service Provision:</h4>
      <ul>
        <li>AI-powered food recognition and nutritional analysis</li>
        <li>Personalized meal plans and dietary recommendations</li>
        <li>Fitness tracking and exercise suggestions</li>
        <li>Progress monitoring and goal achievement tracking</li>
      </ul>
      <h4>Personalization:</h4>
      <ul>
        <li>Customized health insights based on your data</li>
        <li>Tailored content and feature recommendations</li>
        <li>Adaptive AI learning from your preferences</li>
      </ul>
      <h4>Communication:</h4>
      <ul>
        <li>Service updates and important notifications</li>
        <li>Health reminders and motivation messages</li>
        <li>Customer support and technical assistance</li>
        <li>Marketing communications (with consent)</li>
      </ul>
      <h4>Research and Development:</h4>
      <ul>
        <li>Improving AI accuracy and algorithms</li>
        <li>Developing new health features</li>
        <li>Anonymized research for health insights</li>
      </ul>
    `,
  },
  {
    title: "AI and Machine Learning",
    content: `
      <p>Our AI technology processes your data to provide intelligent health recommendations:</p>
      <h4>Food Recognition AI:</h4>
      <ul>
        <li>Analyzes meal photos to identify food items</li>
        <li>Estimates nutritional content and portion sizes</li>
        <li>Learns from corrections to improve accuracy</li>
        <li>Processes images locally when possible for privacy</li>
      </ul>
      <h4>Health Analytics:</h4>
      <ul>
        <li>Identifies patterns in your health data</li>
        <li>Predicts trends and potential health insights</li>
        <li>Provides personalized recommendations</li>
        <li>Adapts to your changing health goals</li>
      </ul>
      <h4>Privacy-Preserving AI:</h4>
      <ul>
        <li>Data minimization - only necessary data is processed</li>
        <li>Anonymization for research and improvement</li>
        <li>Local processing when technically feasible</li>
        <li>Regular algorithm audits for bias and accuracy</li>
      </ul>
    `,
  },
  {
    title: "Data Sharing and Disclosure",
    content: `
      <p>We are committed to protecting your privacy and only share data in specific circumstances:</p>
      <h4 style="color: #f47c54;">We DO NOT sell your personal health data to third parties.</h4>
      <h4>Limited Sharing Scenarios:</h4>
      <ul>
        <li><strong>Healthcare Providers:</strong> Only with your explicit consent</li>
        <li><strong>Service Providers:</strong> Trusted partners who help operate our service</li>
        <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
        <li><strong>Emergency Situations:</strong> To protect health and safety</li>
      </ul>
      <h4>Third-Party Integrations:</h4>
      <ul>
        <li>Wearable device manufacturers (for data sync)</li>
        <li>Payment processors (for subscription billing)</li>
        <li>Cloud service providers (for secure data storage)</li>
        <li>Analytics providers (with anonymized data only)</li>
      </ul>
      <h4>Data Protection Measures:</h4>
      <ul>
        <li>All third parties sign strict data protection agreements</li>
        <li>Regular security audits of partner systems</li>
        <li>Minimal data sharing - only what's necessary</li>
        <li>Right to revoke sharing permissions at any time</li>
      </ul>
    `,
  },
];

const rightsAndSecurityPolicies = [
  {
    title: "Your Privacy Rights",
    content: `
      <p>You have comprehensive rights regarding your personal data:</p>
      <h4>Access Rights:</h4>
      <ul>
        <li>Request a copy of all personal data we hold about you</li>
        <li>View how your data is being processed</li>
        <li>Access your data processing history</li>
      </ul>
      <h4>Control Rights:</h4>
      <ul>
        <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
        <li><strong>Erasure:</strong> Request deletion of your personal data</li>
        <li><strong>Portability:</strong> Export your data in a standard format</li>
        <li><strong>Restriction:</strong> Limit how we process your data</li>
      </ul>
      <h4>Consent Management:</h4>
      <ul>
        <li>Withdraw consent for data processing at any time</li>
        <li>Opt-out of marketing communications</li>
        <li>Control third-party data sharing permissions</li>
        <li>Manage cookie and tracking preferences</li>
      </ul>
      <h4>How to Exercise Your Rights:</h4>
      <ul>
        <li>Use in-app privacy settings for immediate control</li>
        <li>Contact our privacy team at privacy@healthplatform.com</li>
        <li>Submit requests through our privacy portal</li>
        <li>Response time: Within 30 days of verified request</li>
      </ul>
    `,
  },
  {
    title: "Data Security and Protection",
    content: `
      <p>We implement comprehensive security measures to protect your health information:</p>
      <h4>Technical Safeguards:</h4>
      <ul>
        <li><strong>Encryption:</strong> AES-256 encryption for data at rest and in transit</li>
        <li><strong>Access Controls:</strong> Multi-factor authentication and role-based access</li>
        <li><strong>Network Security:</strong> Firewalls, intrusion detection, and monitoring</li>
        <li><strong>Regular Updates:</strong> Security patches and system updates</li>
      </ul>
      <h4>Organizational Measures:</h4>
      <ul>
        <li>Employee security training and background checks</li>
        <li>Data handling policies and procedures</li>
        <li>Regular security audits and penetration testing</li>
        <li>Incident response and breach notification procedures</li>
      </ul>
      <h4>Compliance Standards:</h4>
      <ul>
        <li>HIPAA compliance for health information protection</li>
        <li>GDPR compliance for EU users</li>
        <li>SOC 2 Type II certification</li>
        <li>ISO 27001 information security management</li>
      </ul>
      <h4>Data Breach Response:</h4>
      <ul>
        <li>Immediate containment and assessment procedures</li>
        <li>Notification to affected users within 72 hours</li>
        <li>Cooperation with regulatory authorities</li>
        <li>Free credit monitoring if financial data is involved</li>
      </ul>
    `,
  },
  {
    title: "Data Retention and Deletion",
    content: `
      <p>We retain your data only as long as necessary for legitimate purposes:</p>
      <h4>Retention Periods:</h4>
      <ul>
        <li><strong>Active Accounts:</strong> Data retained while account is active</li>
        <li><strong>Inactive Accounts:</strong> 12 months after last login</li>
        <li><strong>Health Data:</strong> 7 years for medical record compliance</li>
        <li><strong>Financial Data:</strong> 7 years for tax and accounting purposes</li>
      </ul>
      <h4>Deletion Process:</h4>
      <ul>
        <li>Secure deletion using industry-standard methods</li>
        <li>Multiple-pass overwriting of storage media</li>
        <li>Destruction of backup copies within 90 days</li>
        <li>Certificate of destruction for sensitive data</li>
      </ul>
      <h4>Exceptions to Deletion:</h4>
      <ul>
        <li>Legal hold requirements</li>
        <li>Ongoing legal proceedings</li>
        <li>Regulatory compliance obligations</li>
        <li>Anonymized data for research (non-identifiable)</li>
      </ul>
      <h4>User-Initiated Deletion:</h4>
      <ul>
        <li>Account deletion available in app settings</li>
        <li>Immediate removal of personal identifiers</li>
        <li>Complete data deletion within 30 days</li>
        <li>Confirmation email upon completion</li>
      </ul>
    `,
  },
  {
    title: "International Data Transfers",
    content: `
      <p>We may transfer your data internationally with appropriate safeguards:</p>
      <h4>Transfer Scenarios:</h4>
      <ul>
        <li>Cloud storage and processing services</li>
        <li>Customer support operations</li>
        <li>AI model training and improvement</li>
        <li>Business continuity and disaster recovery</li>
      </ul>
      <h4>Protection Measures:</h4>
      <ul>
        <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection</li>
        <li><strong>Standard Contractual Clauses:</strong> EU-approved data transfer agreements</li>
        <li><strong>Binding Corporate Rules:</strong> Internal data protection standards</li>
        <li><strong>Certification Programs:</strong> Privacy Shield and similar frameworks</li>
      </ul>
      <h4>Your Rights for International Transfers:</h4>
      <ul>
        <li>Right to be informed about transfer destinations</li>
        <li>Right to object to transfers to specific countries</li>
        <li>Right to request local data processing (where feasible)</li>
        <li>Right to additional safeguards for sensitive data</li>
      </ul>
    `,
  },
  {
    title: "Contact Information and Updates",
    content: `
      <p>Stay informed about privacy matters and contact us with questions:</p>
      <h4>Privacy Contact Information:</h4>
      <ul>
        <li><strong>Email:</strong> privacy@healthplatform.com</li>
        <li><strong>Phone:</strong> +1 (555) 123-4567 ext. 2</li>
        <li><strong>Address:</strong> Privacy Officer, 123 Health Street, Wellness City, WC 12345</li>
        <li><strong>Response Time:</strong> Within 5 business days</li>
      </ul>
      <h4>Data Protection Officer:</h4>
      <ul>
        <li><strong>Email:</strong> dpo@healthplatform.com</li>
        <li><strong>Role:</strong> Independent oversight of data protection practices</li>
        <li><strong>Availability:</strong> For complex privacy matters and complaints</li>
      </ul>
      <h4>Policy Updates:</h4>
      <ul>
        <li>We review and update this policy annually</li>
        <li>Material changes require 30 days advance notice</li>
        <li>Notification via email and in-app announcements</li>
        <li>Continued use constitutes acceptance of updates</li>
      </ul>
      <h4>Regulatory Authorities:</h4>
      <ul>
        <li>Right to lodge complaints with data protection authorities</li>
        <li>EU users: Contact your local Data Protection Authority</li>
        <li>US users: Federal Trade Commission and state attorneys general</li>
      </ul>
      <p><strong>Last Updated:</strong> January 15, 2024</p>
    `,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className={styles["privacy-page"]}>
      <section className={styles["hero-section"]}>
        <div className={styles["container"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["badge"]}>Privacy Protection</div>
            <h1 className={styles["hero-title"]}>Privacy Policy</h1>
            <p className={styles["hero-description"]}>
              Your privacy is fundamental to our mission. Learn how we collect,
              use, and protect your health information while providing
              personalized AI-powered wellness services.
            </p>
          </div>
        </div>
      </section>

      <PrivacySection
        title="Data Collection & Legal Basis"
        policies={dataCollectionPolicies}
        badge="Information Gathering"
      />
      <PrivacySection
        title="Data Usage & AI Processing"
        policies={dataUsagePolicies}
        badge="How We Use Data"
      />
      <PrivacySection
        title="Your Rights & Data Security"
        policies={rightsAndSecurityPolicies}
        badge="Protection & Control"
      />

      <section className={styles["contact-section"]}>
        <div className={styles["container"]}>
          <div className={styles["contact-content"]}>
            <h2 className={styles["contact-title"]}>
              Privacy Questions or Concerns?
            </h2>
            <p className={styles["contact-description"]}>
              Our privacy team is dedicated to protecting your health
              information and ensuring transparency in our data practices.
              Contact us anytime.
            </p>
            <div className={styles["contact-buttons"]}>
              <a
                href="mailto:privacy@healthplatform.com"
                className={styles["primary-button"]}
              >
                Contact Privacy Team
              </a>
              <a
                href="/terms-and-conditions"
                className={styles["secondary-button"]}
              >
                View Terms of Service
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
