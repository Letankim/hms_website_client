import React from "react";

const Features = () => {
  return (
    <section className="features-section">
      <div className="container">
        <div className="features-content-layout row align-items-center">
          {/* Image Block */}
          <div className="features-image-block col-md-6">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/676f999d267ac329382730ff_Mask%20group.webp"
              alt="Features Image"
              className="img-fluid"
              loading="lazy"
            />
          </div>

          {/* Content Block */}
          <div className="features-content-block col-md-6">
            <div className="content-head is-features">
              <div className="content-title-block">
                <div className="badge">Science Backed Nutrition</div>
                <h2 className="h2 font-600">
                  Personalized Nutrition for Every Stage of Life
                </h2>
              </div>
              <p className="text-lg">
                With science-backed methods and a personalized touch, we create
                solutions that adapt to your life, ensuring long-term success.
              </p>
            </div>
            <div className="features-widget-wrapper">
              <div className="features-widget">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759c39ac353440c5aafc505_feature-widget-icon.svg"
                  alt="Feature Icon 1"
                  className="features-widget-icon"
                  loading="lazy"
                />
                <div className="features-widget-body">
                  <div className="title-dark">
                    <h5 className="h5 font-600">Tailored Meal Plans</h5>
                  </div>
                  <div className="text-default">
                    Custom nutrition strategies designed for your unique
                    lifestyle and goals.
                  </div>
                </div>
              </div>
              <div className="features-widget">
                <img
                  src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759c5989238c4e4c8cbe34c_feature-widget-icon-2.svg"
                  alt="Feature Icon 2"
                  className="features-widget-icon"
                  loading="lazy"
                />
                <div className="features-widget-body">
                  <div className="title-dark">
                    <h5 className="h5 font-600">Holistic Wellness</h5>
                  </div>
                  <div className="text-default">
                    Our programs include guidance on exercise, mental
                    well-being, and habits.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
