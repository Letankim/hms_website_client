import React from "react";
import { NavLink } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-content-block text-center">
        <div className="hero-title-block">
          <div className="hero-title-wrap">
            <h1 className="display-1 fw-bold text-dark mb-4">
              Fuel Your Life with Nutrition
            </h1>
          </div>
          <div className="hero-text-wrap">
            <p className="text-xl text-muted mb-5 mx-auto">
              Our nutrition counseling helps you make lasting, healthy changes.
              Boost energy, manage weight, and feel better with our guidance.
            </p>
          </div>
        </div>
        <NavLink to="/contact" className="primary-fill-button">
          Book Appointment
        </NavLink>
      </div>

      {/* Decorative Elements */}
      <div className="hero-eclipse-group">
        <div className="hero-decorative-one">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67597df37a4d2ed3e8663b94_lemon.webp"
            loading="lazy"
            alt="Lemon"
          />
        </div>
        <div className="hero-decorative-two">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675983f20b549bc94731c2d5_strawberry.webp"
            loading="lazy"
            alt="Strawberry"
          />
        </div>
        <div className="hero-decorative-three">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
            loading="lazy"
            alt="Eclipse 1"
          />
        </div>
        <div className="hero-decorative-four">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759864e5f6bae487081d4ef_top-view-frame-with-green-leaves%201.svg"
            loading="lazy"
            alt="Leaves 1"
          />
        </div>
        <div className="hero-decorative-five">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987f592aad76387d7f61a_hero-eclipse-3.svg"
            loading="lazy"
            alt="Eclipse 3"
          />
        </div>
        <div className="hero-decorative-six">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675986d998aec26d74c31788_top-view-frame-with-green%202.svg"
            loading="lazy"
            alt="Leaves 2"
          />
        </div>
        <div className="hero-decorative-seven">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e3f784913c7fea9abd_hero-eclipse-5.svg"
            loading="lazy"
            alt="Eclipse 5"
          />
        </div>
        <div className="hero-decorative-eight">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e45cfdde83519d1baa_hero-eclipse-6.svg"
            loading="lazy"
            alt="Eclipse 6"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
