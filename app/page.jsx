'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton"; // Add this

const Home = () => {
  return (
    <>
      <TopBar />
      <Navbar/>
      <div className="bg-[#003049]">
        <HeaderSlider />
        <HomeProducts />
        <Banner />
        <Footer />
      </div>
      <WhatsAppButton /> {/* Add this */}
    </>
  );
};

export default Home;