import React from "react";
import { NavLink } from "react-router-dom";

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
  {
    title: "Sports Nutrition",
    description:
      "Fuel your performance with tailored sports nutrition plans designed to meet the demands of your training.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fd0ce9014b5afbbf419f_service-icon-4.png",
    link: "/services/nutrition-counseling-2ca76",
  },
  {
    title: "Digestive Wellness",
    description:
      "Improve your digestive health with tailored plans that restore gut balance and address issues like IBS.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fd48e8faad5fb9956254_service-icon-5.png",
    link: "/services/nutrition-counseling-0f2c5",
  },
  {
    title: "Plant Based Nutrition",
    description:
      "Explore the benefits of plant-based eating, whether you’re vegan, vegetarian, or simply plant curious.",
    icon: "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760fddc79f9b04bbad7d5e8_service-icon-6.png",
    link: "/services/nutrition-counseling",
  },
];

const Services = () => {
  return (
    <>
      {/* Introductory Section */}
      <section className="introductory-section">
        <div className="container">
          <div className="introductory-content-block">
            <div className="introductory-head">
              <div className="breadcrumb">
                <div className="button-text-lg font-600">Home / </div>
                <div className="button-text-lg font-600">Service</div>
              </div>
              <div className="introductory-title-block">
                <div className="introductory-title-wrap">
                  <h1 className="h1 font-berkshire">Our Services</h1>
                </div>
                <div className="introductory-text-wrap">
                  <p className="text-xl">
                    At NutriZen, we offer a comprehensive range of nutrition
                    counseling services designed to meet your unique health and
                    wellness goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="introductory-decorative-group">
          <div className="introductory-decorative-one">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/6759864e5f6bae487081d4ef_top-view-frame-with-green-leaves%201.svg"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="introductory-decorative-two">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675987e3f784913c7fea9abd_hero-eclipse-5.svg"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="introductory-decorative-three">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675986d998aec26d74c31788_top-view-frame-with-green%202.svg"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="introductory-decorative-four">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675d01bb3c445d932b103362_Introductory%20shape-4.svg"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="introductory-decorative-five">
            <img
              src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/67598aa92c61e78ae0e8ceec_hero-eclipse-1.webp"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Service Section */}
      <section className="service-section">
        <div className="container">
          <div className="service-layout">
            <div className="service-widget-wrapper">
              {services.map((service, index) => (
                <NavLink
                  key={index}
                  to={service.link}
                  className="service-widget"
                >
                  <div className="service-card-icon-three-wrap">
                    <img
                      src={service.icon}
                      alt={`${service.title} Icon`}
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
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
