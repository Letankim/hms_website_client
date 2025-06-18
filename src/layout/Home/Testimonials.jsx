import React from "react";

const testimonials = [
  {
    name: "John D., Age 32, Achieved His Goals in Just One Month",
    quote:
      "With just 30 days of personalized nutrition guidance and consistent effort, John D. turned his goals into reality, proving that...",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/676f9617fd73c5458e0b98f0_image.webp",
    link: "/case-study/john-d-age-32-achieved-his-goals-in-just-one-month-80cfa",
  },
  {
    name: "Smith’s Transformation: Two Dress Sizes Smaller and Loving Life Again",
    quote:
      "After years of trying fad diets, I was skeptical about working with a nutritionist. But John’s plan was simple, practical, and...",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6770c39bb48cd7674f4b5c04_Mask%20group%20(1).webp",
    link: "/case-study/smiths-transformation-two-dress-sizes-smaller-and-loving-life-again",
  },
  {
    name: "Mark’s Success: 20 Pounds Down and a New Lifestyle to Match",
    quote:
      "Mark came to me for help with meal planning and improving my fitness. Not only did I lose 20 pounds in 3 months, but I also...",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/676f97caf8f6d5a24f8fe673_image%20(6).webp",
    link: "/case-study/marks-success-20-pounds-down-and-a-new-lifestyle-to-match",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="testimonial-layout">
          {/* Section Header */}
          <div className="section-head">
            <div className="section-title-block">
              <div className="badge">Testimonials</div>
              <h2 className="h2 font-600">
                Success Stories from Our Satisfied Clients
              </h2>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="case-studies-collection-list-wrapper">
            <div className="row g-4">
              {testimonials.map((testimonial, index) => (
                <div className="col-md-4" key={index}>
                  <a
                    href={testimonial.link}
                    className="testimonial-card d-block text-decoration-none"
                  >
                    <div className="testimonial-card-image-block">
                      <div className="testimonial-card-image-wrap">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="testimonial-card-image img-fluid"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="testimonial-card-body">
                      <div className="testimonial-card-title-block">
                        <div className="testimonial-title-dark">
                          <h5 className="h5">{testimonial.name}</h5>
                        </div>
                        <p className="text-default">{testimonial.quote}</p>
                      </div>
                      <div className="view-button">
                        <div className="button-text">View Full Story</div>
                        <img
                          src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/675992b5bc21f90656177dd5_arrow-icon.svg"
                          alt="Arrow Icon"
                          className="testimonial-redirect-icon"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Read All Testimonials Button */}
          <div className="primary-fill-button-wrap text-center mt-4">
            <a href="/successful-stories" className="primary-fill-button">
              Read Our All Testimonials
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
