import { FormEvent } from "react";

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter form submitted");
  };

  return (
    <section className="footer-section">
      <div className="container">
        <div className="footer-content-wrap row">
          <div className="footer-company-description-block col-md-3">
            <div className="footer-about-content-wrapper">
              <a href="/" className="footer-logo d-inline-block">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/676aa9bd495e6916741ac182_footer-logo.svg"
                  alt="Nutrizen Logo"
                  loading="lazy"
                />
              </a>
              <div className="text-lg">
                Empowering your health journey with science-backed nutrition.
              </div>
            </div>
          </div>
          {/* Add other footer sections here */}
        </div>
        <div className="footer-copyright-block row">
          <div className="footer-copyright-text-wrap col-md-6">
            <div className="text-default">
              © Copyright 2025, All Rights Reserved by{" "}
              <a
                href="https://www.uimile.com/"
                target="_blank"
                className="text-color-primary"
              >
                UiMile
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
