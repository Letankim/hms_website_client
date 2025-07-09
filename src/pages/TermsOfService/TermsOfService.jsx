"use client";

import styles from "./TermsOfService.module.css";
import { useState } from "react";

const TermsItem = ({ title, content, isOpen, onToggle }) => {
  return (
    <div
      className={`${styles["terms-item"]} ${
        isOpen ? styles["terms-item-open"] : ""
      }`}
    >
      <button className={styles["terms-question"]} onClick={onToggle}>
        <span>{title}</span>
        <span className={styles["terms-icon"]}>{isOpen ? "−" : "+"}</span>
      </button>
      <div className={styles["terms-answer"]}>
        <div className={styles["terms-answer-content"]}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

// Terms Section Component
const TermsSection = ({ title, terms, badge }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className={styles["terms-section"]}>
      <div className={styles["container"]}>
        <div className={styles["section-header"]}>
          <div className={styles["badge"]}>{badge}</div>
          <h2 className={styles["section-title"]}>{title}</h2>
        </div>
        <div className={styles["terms-list"]}>
          {terms.map((term, index) => (
            <TermsItem
              key={index}
              title={term.title}
              content={term.content}
              isOpen={openItems[index]}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const generalTerms = [
  {
    title: "Acceptance of Terms",
    content: `
      <p>By accessing and using our health management platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
      <p>If you do not agree to abide by the above, please do not use this service. These Terms of Service may be updated from time to time, and we will notify you of any material changes.</p>
      <ul>
        <li>You must be at least 18 years old to use our Service</li>
        <li>You are responsible for maintaining the confidentiality of your account</li>
        <li>You agree to provide accurate and complete information</li>
      </ul>
    `,
  },
  {
    title: "User Accounts and Registration",
    content: `
      <p>To access certain features of our Service, you must register for an account. When you register, you agree to:</p>
      <ul>
        <li>Provide accurate, current, and complete information about yourself</li>
        <li>Maintain and promptly update your registration information</li>
        <li>Maintain the security of your password and account</li>
        <li>Accept all risks of unauthorized access to your account</li>
      </ul>
      <p>You are responsible for all activities that occur under your account, whether or not you authorized such activities.</p>
    `,
  },
  {
    title: "Health Information and Medical Disclaimer",
    content: `
      <p><strong>Important Medical Disclaimer:</strong> Our Service is not intended to replace professional medical advice, diagnosis, or treatment.</p>
      <ul>
        <li>Always seek the advice of your physician or other qualified health provider</li>
        <li>Never disregard professional medical advice because of information from our Service</li>
        <li>Our AI recommendations are for informational purposes only</li>
        <li>Individual results may vary and are not guaranteed</li>
      </ul>
      <p>If you have a medical emergency, call your doctor or emergency services immediately.</p>
    `,
  },
  {
    title: "Acceptable Use Policy",
    content: `
      <p>You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or to solicit unlawful activity</li>
        <li>Share false, misleading, or harmful health information</li>
        <li>Attempt to gain unauthorized access to other users' accounts</li>
        <li>Upload viruses or malicious code</li>
        <li>Harass, abuse, or harm other users</li>
        <li>Violate any applicable laws or regulations</li>
      </ul>
      <p>We reserve the right to terminate accounts that violate these policies.</p>
    `,
  },
  {
    title: "Data and Privacy",
    content: `
      <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy.</p>
      <ul>
        <li>We collect health data to provide personalized recommendations</li>
        <li>Your data is encrypted and stored securely</li>
        <li>We do not sell your personal health information</li>
        <li>You can request data deletion at any time</li>
      </ul>
      <p>By using our Service, you consent to the collection and use of information as outlined in our Privacy Policy.</p>
    `,
  },
];

const serviceTerms = [
  {
    title: "AI Technology and Accuracy",
    content: `
      <p>Our Service uses artificial intelligence for food recognition and health recommendations. Please understand:</p>
      <ul>
        <li>AI accuracy is approximately 95% but not 100% guaranteed</li>
        <li>Nutritional estimates may vary from actual values</li>
        <li>Always verify important nutritional information independently</li>
        <li>Our AI continuously learns and improves over time</li>
      </ul>
      <p>We are not liable for decisions made based solely on AI recommendations.</p>
    `,
  },
  {
    title: "Subscription and Payment Terms",
    content: `
      <p>Our Service offers both free and premium subscription tiers:</p>
      <ul>
        <li>Free accounts have limited features and AI functionality</li>
        <li>Premium subscriptions are billed monthly or annually</li>
        <li>All fees are non-refundable except as required by law</li>
        <li>You can cancel your subscription at any time</li>
        <li>Price changes will be communicated 30 days in advance</li>
      </ul>
      <p>Failure to pay subscription fees may result in service suspension.</p>
    `,
  },
  {
    title: "Intellectual Property Rights",
    content: `
      <p>The Service and its original content, features, and functionality are owned by us and are protected by copyright, trademark, and other laws.</p>
      <ul>
        <li>You may not copy, modify, or distribute our content without permission</li>
        <li>Our AI algorithms and technology are proprietary</li>
        <li>User-generated content remains your property</li>
        <li>You grant us license to use your content to improve our Service</li>
      </ul>
      <p>Respect for intellectual property rights is essential for our Service to operate.</p>
    `,
  },
  {
    title: "Third-Party Integrations",
    content: `
      <p>Our Service integrates with various third-party devices and services:</p>
      <ul>
        <li>Fitness trackers and wearable devices</li>
        <li>Health monitoring equipment</li>
        <li>Social media platforms for community features</li>
        <li>Payment processing services</li>
      </ul>
      <p>We are not responsible for the availability, accuracy, or reliability of third-party services.</p>
    `,
  },
  {
    title: "Service Availability and Modifications",
    content: `
      <p>We strive to provide reliable service but cannot guarantee 100% uptime:</p>
      <ul>
        <li>Service may be temporarily unavailable for maintenance</li>
        <li>We may modify or discontinue features with notice</li>
        <li>Emergency maintenance may occur without advance notice</li>
        <li>We are not liable for service interruptions</li>
      </ul>
      <p>We will make reasonable efforts to minimize service disruptions.</p>
    `,
  },
];

const legalTerms = [
  {
    title: "Limitation of Liability",
    content: `
      <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      <ul>
        <li>Our total liability is limited to the amount you paid for the Service</li>
        <li>We are not liable for health decisions made using our Service</li>
        <li>We are not responsible for third-party content or services</li>
        <li>Some jurisdictions do not allow limitation of liability</li>
      </ul>
      <p>This limitation applies even if we have been advised of the possibility of such damages.</p>
    `,
  },
  {
    title: "Indemnification",
    content: `
      <p>You agree to defend, indemnify, and hold us harmless from any claims, damages, or expenses arising from:</p>
      <ul>
        <li>Your use of the Service</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any rights of another party</li>
        <li>Any content you submit to the Service</li>
      </ul>
      <p>This indemnification obligation will survive termination of your account.</p>
    `,
  },
  {
    title: "Governing Law and Disputes",
    content: `
      <p>These Terms shall be governed by and construed in accordance with applicable laws:</p>
      <ul>
        <li>Any disputes will be resolved through binding arbitration</li>
        <li>You waive the right to participate in class action lawsuits</li>
        <li>Small claims court disputes are excluded from arbitration</li>
        <li>Arbitration will be conducted by a neutral arbitrator</li>
      </ul>
      <p>If any provision of these Terms is found unenforceable, the remainder shall remain in effect.</p>
    `,
  },
  {
    title: "Termination",
    content: `
      <p>Either party may terminate this agreement at any time:</p>
      <ul>
        <li>You may delete your account and stop using the Service</li>
        <li>We may terminate accounts that violate these Terms</li>
        <li>Upon termination, your right to use the Service ceases immediately</li>
        <li>Your data will be retained according to our Privacy Policy</li>
      </ul>
      <p>Provisions that should survive termination will remain in effect.</p>
    `,
  },
  {
    title: "Contact Information and Updates",
    content: `
      <p>For questions about these Terms of Service, please contact us:</p>
      <ul>
        <li>Email: legal@healthplatform.com</li>
        <li>Address: 123 Health Street, Wellness City, WC 12345</li>
        <li>Phone: +1 (555) 123-4567</li>
      </ul>
      <p>We may update these Terms from time to time. Continued use of the Service constitutes acceptance of updated Terms.</p>
      <p><strong>Last Updated:</strong> January 15, 2024</p>
    `,
  },
];

export default function TermsOfService() {
  return (
    <div className={styles["terms-page"]}>
      <section className={styles["hero-section"]}>
        <div className={styles["container"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["badge"]}>Legal Agreement</div>
            <h1 className={styles["hero-title"]}>Terms of Service</h1>
            <p className={styles["hero-description"]}>
              Please read these Terms of Service carefully before using our
              AI-powered health management platform. By using our service, you
              agree to be bound by these terms and conditions.
            </p>
          </div>
        </div>
      </section>

      <TermsSection
        title="General Terms & Conditions"
        terms={generalTerms}
        badge="Foundation"
      />
      <TermsSection
        title="Service-Specific Terms"
        terms={serviceTerms}
        badge="Platform Usage"
      />
      <TermsSection
        title="Legal Provisions"
        terms={legalTerms}
        badge="Legal Framework"
      />

      <section className={styles["contact-section"]}>
        <div className={styles["container"]}>
          <div className={styles["contact-content"]}>
            <h2 className={styles["contact-title"]}>
              Questions About Our Terms?
            </h2>
            <p className={styles["contact-description"]}>
              If you have any questions about these Terms of Service or need
              clarification on any provisions, our legal team is here to help.
            </p>
            <div className={styles["contact-buttons"]}>
              <a href="/contact" className={styles["primary-button"]}>
                Contact Legal Team
              </a>
              <a href="/privacy-policy" className={styles["secondary-button"]}>
                View Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
