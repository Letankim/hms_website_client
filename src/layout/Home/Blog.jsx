import React from "react";
import { NavLink } from "react-router-dom";

const blogs = [
  {
    title: "10 Simple Steps to Kickstart a Healthier Eating Habit",
    category: "Diet",
    date: "September 15, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/67601f10bdb99ed7bb6df382_67601c776fa5126b688e6b09_675d2474bf09953dd00ade8e_675d21312d9234c7634fd28d_blog-thumbnail.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-11254",
  },
  {
    title: "The Connection Between Nutrition and Mental Health",
    category: "Food",
    date: "September 11, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760202f10470581a907551e_blog-thumbnail-2.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-3d933",
  },
  {
    title: "The Evolution of Fitness: Exploring Historical Trends",
    category: "Fitness",
    date: "September 9, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/676020b09c27483f620bb9f1_blog-thumbnail-3.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-7391f",
  },
];

const Blog = () => {
  return (
    <section className="blog-section">
      <div className="container">
        <div className="blog-layout">
          {/* Section Header */}
          <div className="section-head">
            <div className="section-title-block">
              <div className="badge">Nutrition Journal</div>
              <h2 className="h2 font-600">The Food & Wellness Guide</h2>
            </div>
            <p className="text-lg">
              Stay informed with expert tips, nutrition hacks, and inspiring
              success stories to support your healthier lifestyle journey.
            </p>
          </div>

          {/* Blog Cards */}
          <div className="blog-collection-list-wrapper">
            <div className="row g-4">
              {blogs.map((blog, index) => (
                <div className="col-md-4" key={index}>
                  <div className="blog-card">
                    <NavLink
                      to={blog.link}
                      className="blog-card-image-block d-block"
                    >
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="blog-card-image img-fluid"
                        loading="lazy"
                      />
                    </NavLink>
                    <div className="courses-card-info">
                      <div className="blog-card-diet-date-block">
                        <NavLink
                          to={`/blog-categories/${blog.category.toLowerCase()}`}
                          className="blog-card-category"
                        >
                          <div className="text-default">{blog.category}</div>
                        </NavLink>
                        <div className="dot"></div>
                        <div className="text-default">{blog.date}</div>
                      </div>
                      <NavLink
                        to={blog.link}
                        className="blog-card-title-block d-block text-decoration-none"
                      >
                        <h4 className="h4">{blog.title}</h4>
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
