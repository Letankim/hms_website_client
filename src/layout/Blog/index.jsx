import { useState } from "react";
import { NavLink } from "react-router-dom";

const blogPosts = [
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
  {
    title: "Top 10 Nutrient-Rich Foods to Boost Your Energy Levels",
    category: "Food",
    date: "September 5, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/676020e21e398a5363d0c19e_blog-thumbnail-4.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-de549",
  },
  {
    title: "From Plate to Performance: Nutrition Tips for Active Lifestyles",
    category: "Fitness",
    date: "August 31, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/67602134889daf3e275aea22_blog-thumbnail-5.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-99d32",
  },
  {
    title: "Eating for Two: Essential Nutritional Tips for Expectant Mothers",
    category: "Nutrition",
    date: "August 28, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/67602176bcb783f2847cce6b_blog-thumbnail-6.webp",
    link: "/blog/10-simple-steps-to-kickstart-a-healthier-eating-habit-c87e8-e4892-a43e5",
  },
  // Add more blog posts for pagination
  {
    title: "Mindful Eating: A Path to Better Health",
    category: "Wellness",
    date: "August 20, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/6760202f10470581a907551e_blog-thumbnail-2.webp",
    link: "/blog/mindful-eating-a-path-to-better-health",
  },
  {
    title: "Superfoods You Should Add to Your Diet Today",
    category: "Nutrition",
    date: "August 15, 2024",
    image:
      "https://cdn.prod.website-files.com/675bd0d0bd1b8a5d457b5df0/676020b09c27483f620bb9f1_blog-thumbnail-3.webp",
    link: "/blog/superfoods-you-should-add-to-your-diet-today",
  },
];

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = blogPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Introductory Section */}
      <section className="introductory-section">
        <div className="container">
          <div className="introductory-content-block">
            <div className="introductory-head">
              <div className="breadcrumb">
                <div className="button-text-lg font-600">Home / </div>
                <div className="button-text-lg font-600">Blog</div>
              </div>
              <div className="introductory-title-block">
                <div className="introductory-title-wrap">
                  <h1 className="h1 font-berkshire">
                    The Food & Wellness Guide
                  </h1>
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

      {/* Blog Section */}
      <section className="blog-section">
        <div className="container">
          <div className="blog-layout">
            <div className="blog-collection-list-wrapper">
              <div className="blog-collection-list">
                {currentPosts.map((post, index) => (
                  <div key={index} className="blog-card">
                    <NavLink to={post.link} className="blog-card-image-block">
                      <img
                        src={post.image}
                        alt={`${post.title} Thumbnail`}
                        className="blog-card-image"
                        loading="lazy"
                      />
                    </NavLink>
                    <div className="courses-card-info">
                      <div className="blog-card-diet-date-block">
                        <NavLink
                          to={`/blog-categories/${post.category.toLowerCase()}`}
                          className="blog-card-category"
                        >
                          <div className="text-default">{post.category}</div>
                        </NavLink>
                        <div className="dot"></div>
                        <div className="text-default">{post.date}</div>
                      </div>
                      <NavLink to={post.link} className="blog-card-title-block">
                        <h4 className="h4">{post.title}</h4>
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <button
                  onClick={handlePrevPage}
                  className="pagination-button"
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  <span>Previous</span>
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <svg
                    className="pagination-next-icon"
                    height="12px"
                    width="12px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    transform="translate(0, 1)"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      fillRule="evenodd"
                      d="M4 2l4 4-4 4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
