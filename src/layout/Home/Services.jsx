import React from "react";

const services = [
  {
    title: "Nutrition Counseling",
    description:
      "Nutrition Counseling was given on your lifestyle, dietary habits, health goals, and medical conditions.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fbc0a38eb9ce4134711f_fi_14795645.png",
    link: "/services/nutrition-counseling-44135",
  },
  {
    title: "Meal Planning",
    description:
      "Weekly or monthly meal plans with recipes and shopping lists to fit with the goals you want to achieve.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fc3634bb1be5a0ed546b_service-icon-2.png",
    link: "/services/nutrition-counseling-1727d",
  },
  {
    title: "Weight Management",
    description:
      "Programs focused on sustainable weight loss or maintenance through balanced eating and workout.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fcad3897207fb3f534d4_service-icon-3.png",
    link: "/services/nutrition-counseling-70ecb",
  },
];

const Services = () => {
  return (
    <section className="service-section">
      <div className="container">
        <div className="service-layout">
          {/* Section Header */}
          <div className="section-head is-service-head">
            <div className="section-title-block">
              <div className="badge">Services</div>
              <h2 className="h2 font-600">
                The Essential Support of A Nutritionist
              </h2>
            </div>
          </div>

          {/* Service Cards */}
          <div className="service-widget-wrapper">
            <div className="row g-4">
              {services.map((service, index) => (
                <div className="col-md-4" key={index}>
                  <a
                    href={service.link}
                    className="service-widget d-block text-decoration-none"
                  >
                    <div className="service-card-icon-three-wrap">
                      <img
                        src={service.icon}
                        alt={service.title}
                        className="service-card-icon-three"
                        loading="lazy"
                      />
                    </div>
                    <div className="service-card-body">
                      <div className="title-dark">
                        <h4 className="h4 font-600">{service.title}</h4>
                      </div>
                      <div className="text-lg">{service.description}</div>
                    </div>
                    <div className="service-button">
                      <div className="service-button-text-wrap">
                        <div className="service-button-text">View Details</div>
                        <img
                          src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675992b5bc21f90656177dd5_arrow-icon.svg"
                          alt="Arrow Icon"
                          className="service-button-icon-one"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
