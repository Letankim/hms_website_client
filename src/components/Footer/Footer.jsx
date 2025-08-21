import { Phone, Mail, MapPin } from "lucide-react";
import "./index.css";
import FloatingHealthChat from "components/FloatingHealthChat/FloatingHealthChat";

const CompanyDescription = () => (
  <div className="company-description">
    <a href="https://hms-client-psi.vercel.app" className="footer-logo-link">
      <img
        src="/logo_loading.png"
        alt="3DO TEAM Logo"
        className="footer-logo"
      />
    </a>
    <p className="company-text">
      Empowering your fitness journey with innovative solutions and
      community-driven support for a healthier lifestyle.
    </p>
  </div>
);

const ContactMenu = () => (
  <div className="contact-section">
    <div className="contact-group">
      <h3 className="section-title">
        Contact Us
        <div className="title-underline"></div>
      </h3>
      <div className="contact-items">
        <a href="tel:+84865341745" className="contact-item">
          <div className="contact-icon">
            <Phone size={16} />
          </div>
          <span>+84 865341745</span>
        </a>
        <a href="mailto:3docorp@gmail.com" className="contact-item">
          <div className="contact-icon">
            <Mail size={16} />
          </div>
          <span>3docorp@gmail.com</span>
        </a>
      </div>
    </div>

    <div className="contact-group">
      <h3 className="section-title">
        Visit Us
        <div className="title-underline"></div>
      </h3>
      <a
        href="https://maps.app.goo.gl/6agFt6y7NKV4ViKj9"
        className="contact-item address-item"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="contact-icon">
          <MapPin size={16} />
        </div>
        <span>600 Nguyễn Văn Cừ, An Bình, Ninh Kiều, Cần Thơ</span>
      </a>
    </div>
  </div>
);

const CompanyMenu = () => {
  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/experience", label: "Experiences" },
    { href: "/chat", label: "AI Support" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <div className="company-menu">
      <h3 className="section-title">
        Company
        <div className="title-underline"></div>
      </h3>
      <nav className="menu-nav">
        {menuItems.map(({ href, label }) => (
          <a key={href} href={href} className="menu-link">
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
};

const AppDownload = () => (
  <div className="app-download">
    <h3 className="section-title">
      Download Our App
      <div className="title-underline"></div>
    </h3>
    <p className="app-description">
      Get the HMS app for a seamless fitness experience on the go!
    </p>
    <div className="app-links">
      <a
        href="https://apps.apple.com/app/hms-3do/id6749509672"
        target="_blank"
        rel="noopener noreferrer"
        className="app-link"
      >
        <img
          src="/appstore.png"
          alt="Download on the App Store"
          className="app-image"
        />
      </a>
    </div>
  </div>
);

const Copyright = () => (
  <div className="copyright-section">
    <div className="copyright-content">
      <div className="copyright-text">
        <p>
          © Copyright 2025, All Rights Reserved by{" "}
          <a
            href="https://hms-client-psi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="brand-link"
          >
            3DO TEAM
          </a>
          .
        </p>
        <p>
          Powered By{" "}
          <a
            href="https://hms-client-psi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="brand-link"
          >
            3DO TEAM
          </a>
        </p>
      </div>
      <div className="copyright-links">
        <a href="/privacy-policy" className="copyright-link">
          Privacy Policy
        </a>
        <a href="/terms-and-conditions" className="copyright-link">
          Terms & Conditions
        </a>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <>
    <footer className="footer">
      {/* Background Pattern */}
      <div className="footer-background">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          <div className="grid-item">
            <CompanyDescription />
          </div>
          <div className="grid-item">
            <ContactMenu />
          </div>
          <div className="grid-item">
            <CompanyMenu />
          </div>
          <div className="grid-item">
            <AppDownload />
          </div>
        </div>
        <Copyright />
      </div>
    </footer>
    <FloatingHealthChat />
  </>
);

export default Footer;
