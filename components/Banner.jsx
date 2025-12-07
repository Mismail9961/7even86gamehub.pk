import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between md:pl-12 lg:pl-20 py-8 min-[375px]:py-10 sm:py-14 md:py-0 
      bg-gradient-to-r from-[#003049] via-[#8a1a13] to-[#003049] 
      overflow-hidden my-8 min-[375px]:my-10 sm:my-12 lg:my-16">

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#8a1a1320_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_#00304920_0%,_transparent_50%)]"></div>

      <Image
        className="w-40 min-[375px]:w-48 sm:w-56 md:w-64 relative z-10"
        src={assets.jbl_soundbox_image}
        alt="jbl_soundbox_image"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-3 min-[375px]:space-y-4 px-4 sm:px-6 md:px-0 relative z-10">
        <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold 
          max-w-[280px] min-[375px]:max-w-[290px] sm:max-w-[350px] md:max-w-[400px] 
          text-white leading-tight">
          Level Up Your Gaming Experience
        </h2>

        <p className="text-xs min-[375px]:text-sm sm:text-base 
          max-w-[300px] min-[375px]:max-w-[343px] sm:max-w-[400px] md:max-w-[450px] 
          font-medium text-gray-200">
          From immersive sound to precise controls—everything you need to win
        </p>

        <button className="group flex items-center justify-center gap-2 
          px-6 min-[375px]:px-8 py-2.5 min-[375px]:py-3 
          text-sm min-[375px]:text-base 
          bg-[#8a1a13] hover:bg-[#70130f] 
          text-white font-semibold 
          transition-all duration-300 
          hover:shadow-lg hover:shadow-[#8a1a13]/50">
          Buy now
          <Image
            className="group-hover:translate-x-1 transition-transform w-4 h-4"
            src={assets.arrow_icon_white}
            alt="arrow_icon_white"
          />
        </button>
      </div>

      <Image
        className="hidden md:block w-64 lg:w-80 relative z-10"
        src={assets.md_controller_image}
        alt="md_controller_image"
      />
      <Image
        className="md:hidden w-48 min-[375px]:w-56 sm:w-64 relative z-10 mt-6 sm:mt-8"
        src={assets.sm_controller_image}
        alt="sm_controller_image"
      />
    </div>
  );
};

export default Banner;
