import React from "react";
import Hero from "components/Hero";
import Services from "layout/Home/Services";
import About from "layout/Home/About";
import Benefit from "layout/Home/Benefit";
import Features from "layout/Home/Features";
import Testimonials from "layout/Home/Testimonials";
import Blog from "layout/Home/Blog";
import CTA from "components/CTA";

const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <About />
      <Benefit />
      <Features />
      <Testimonials />
      <Blog />
      <CTA />
    </div>
  );
};

export default Home;
