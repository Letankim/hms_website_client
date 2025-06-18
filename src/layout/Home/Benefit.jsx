import React from "react";
import { NavLink } from "react-router-dom";

const Benefit = () => {
  return (
    <section className="benefit-section">
      <div className="container">
        <div className="benefit-content-layout row align-items-center">
          {/* Content Block */}
          <div className="benefit-content-block col-md-6">
            <div className="content-head is-benefit">
              <div className="content-title-block">
                <div className="badge">Why Nutrizen</div>
                <h2 className="h2 font-600">
                  Choose Nutrizen, Transform Your Health
                </h2>
              </div>
              <p className="text-lg">
                At Nutrizen, we believe that true health is more than just what
                you eat—it’s about creating a balanced lifestyle that works for
                you. Here’s why Nutrizen is the right choice for your
                personalized.
              </p>
            </div>
            <div className="benefit-list">
              <div className="benefit-list-item">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759b6819391be6243638b76_tick-01.svg"
                  alt="Tick Icon"
                  loading="lazy"
                />
                <div className="text-lg">Personalized Nutrition Plans</div>
              </div>
              <div className="benefit-list-item">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759b6819391be6243638b76_tick-01.svg"
                  alt="Tick Icon"
                  loading="lazy"
                />
                <div className="text-lg">Expert Guidance and Support</div>
              </div>
              <div className="benefit-list-item">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759b6819391be6243638b76_tick-01.svg"
                  alt="Tick Icon"
                  loading="lazy"
                />
                <div className="text-lg">Improved Health Outcomes</div>
              </div>
            </div>
            <div className="primary-fill-button-wrap">
              <NavLink to="/about" className="primary-fill-button">
                Know more
              </NavLink>
            </div>
          </div>

          {/* Image Block */}
          <div className="benefit-image-block col-md-6">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759b8b4ac2c12f7e0735f3b_benefit-img-1.webp"
              alt="Benefit Image 1"
              className="benefit-image-1 img-fluid"
              loading="lazy"
            />
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759b8b40a7bdf696cf002e8_benefit-img-2.webp"
              alt="Benefit Image 2"
              className="benefit-image img-fluid"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="benefit-background"></div>
    </section>
  );
};

export default Benefit;
