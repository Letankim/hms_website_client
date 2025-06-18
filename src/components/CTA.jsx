import { useState } from "react";

const CTA = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-layout">
          {/* Section Header */}
          <div className="section-head is-cta">
            <div className="section-title-block">
              <div className="badge">Discover tailored plans</div>
              <h2 className="display-2 font-berkshire">
                Reach Health Goals with Nutrition
              </h2>
            </div>
          </div>

          {/* Button with Hover State */}
          <div className="primary-fill-button-wrap text-center">
            <a
              href="/contact"
              className="primary-fill-button"
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              Book An Appointment
            </a>
          </div>

          {/* Decorative Images with Conditional Class for Hover Animation */}
          <div
            className={`cta-eclipse-block ${
              isButtonHovered ? "button-hovered" : ""
            }`}
          >
            <div className="decorative-image">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6770c1a33f51743692ff64b6_avocado-slice-isolated-white%201.webp"
                alt="Avocado"
                loading="lazy"
              />
            </div>

            <div className="decorative-image-particle-2-hovered">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675983f20b549bc94731c2d5_strawberry.webp"
                alt="Strawberry Hovered"
                loading="lazy"
              />
            </div>

            <div className="decorative-leaf-particle">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
                alt="Leaf Particle 1"
                loading="lazy"
              />
            </div>
            <div className="decorative-leaf-particle-2">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987f592aad76387d7f61a_hero-eclipse-3.svg"
                alt="Leaf Particle 2"
                loading="lazy"
              />
            </div>
            <div className="decorative-leaf-particle-3">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675986d998aec26d74c31788_top-view-frame-with-green%202.svg"
                alt="Leaf Particle 3"
                loading="lazy"
              />
            </div>
            <div className="decorative-leaf-particle-4">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e3f784913c7fea9abd_hero-eclipse-5.svg"
                alt="Leaf Particle 4"
                loading="lazy"
              />
            </div>
            <div className="decorative-image-particle-5">
              <img
                src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e45cfdde83519d1baa_hero-eclipse-6.svg"
                alt="Decorative Particle 5"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
