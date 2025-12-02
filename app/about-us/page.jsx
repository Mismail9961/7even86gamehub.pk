// app/about/page.js (Next.js 13+ App Router)

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | 7even86gamehub",
  description:
    "Learn more about 7even86gamehub, our mission, vision, and the values that drive us to provide the best online shopping experience in Pakistan.",
};

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12 md:py-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#EA580C] mb-4 sm:mb-6">
          About 7even86gamehub
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8">
          Welcome to <span className="font-semibold">7even86gamehub</span> — a
          next-generation e-commerce destination built for the modern shopper.
          We combine cutting-edge technology with a passion for customer
          satisfaction to deliver a seamless, secure, and enjoyable online
          shopping experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-12">
          {/* Mission */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#EA580C] mb-3 sm:mb-4">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              At 7even86gamehub, our mission is simple: to make online shopping
              effortless and accessible for everyone. From fashion and
              electronics to everyday essentials, we aim to bring quality
              products to your doorstep with speed, security, and convenience.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#EA580C] mb-3 sm:mb-4">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We envision a digital marketplace where innovation meets trust.
              7even86gamehub is more than a store — it's a community of shoppers who
              value authenticity, affordability, and an exceptional user
              experience.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-10 sm:mt-12 md:mt-16 bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#EA580C] mb-4 sm:mb-6">
            Our Core Values
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
            <li className="flex items-start gap-2">
              <div>
                <span className="font-medium text-[#EA580C]">Customer First</span>
                {" "}– every decision we make starts with you.
              </div>
            </li>
            <li className="flex items-start gap-2">

              <div>
                <span className="font-medium text-[#EA580C]">Quality & Trust</span>
                {" "}– only the best, reliable products make it to our store.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div>
                <span className="font-medium text-[#EA580C]">Innovation</span>
                {" "}– harnessing the latest tech to improve your shopping journey.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div>
                <span className="font-medium text-[#EA580C]">Sustainability</span>
                {" "}– committed to eco-friendly practices and conscious commerce.
              </div>
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 sm:mt-16 md:mt-20 text-center bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl p-6 sm:p-8 md:p-10 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Join the 7even86gamehub Experience
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            From your first click to the final checkout, 7even86gamehub is here to
            make shopping smarter, faster, and better. Explore our collections
            today and discover why thousands of customers trust us.
          </p>
          <a
            href="/all-products"
            className="inline-block bg-white text-[#EA580C] px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition transform hover:scale-105 font-medium text-sm sm:text-base"
          >
            Start Shopping
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}