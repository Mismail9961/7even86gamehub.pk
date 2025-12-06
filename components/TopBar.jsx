import React from "react";

export default function TopBar() {
  return (
    <div
      className="w-full bg-gradient-to-r from-red-600 to-black text-white text-center py-2 text-sm relative flex items-center justify-center overflow-hidden"
    >
      <span className="absolute font-bold left-[520px] top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer select-none">
        &#8249;
      </span>

      <span>We don't offer Cash on Delivery at this time.</span>

      <span className="absolute font-bold right-[520px] top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer select-none">
        &#8250;
      </span>
    </div>
  );
}
