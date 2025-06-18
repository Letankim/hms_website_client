import React from "react";
import { NavLink } from "react-router-dom";

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        <div className="about-content-layout row align-items-center">
          {/* Image Block */}
          <div className="about-image-block col-md-6">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759a7ff2b1cc5e8dd2afc2a_about-img.webp"
              alt="About Nutrizen"
              className="about-image img-fluid"
              loading="lazy"
            />
          </div>

          {/* Content Block */}
          <div className="about-content-block col-md-6">
            <div className="content-title-block">
              <div className="badge">Your Health, Our Mission</div>
              <h2 className="h2 font-600">
                Nutrizen, <br /> Your Partner in Wellness
              </h2>
            </div>
            <div className="row-gap-40">
              <div className="row-gap-24">
                <p className="text-lg">
                  Hi, I’m Nutrizen! As a Certified Nutritionist, I specialize in
                  helping individuals overcome challenges related to weight
                  management, digestive health, and achieving a balanced,
                  nutritious lifestyle. I’ve worked with people from all walks
                  of life who were tired of fad diets and one-size-fits-all
                  approaches to health.
                </p>
                <p className="text-lg">
                  Together, we’ll uncover the root causes of your health
                  concerns and create a step-by-step, personalized plan that
                  works for your unique needs, preferences, and goals. Ready to
                  take the first step toward feeling your best?
                </p>
              </div>
              <div className="primary-fill-button-wrap">
                <NavLink to="/contact" className="primary-fill-button">
                  Book Appointment
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="about-background"></div>
    </section>
  );
};

export default About;
