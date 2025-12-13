"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";

const HomeProducts = () => {
  const { router } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/product/list");
        if (res.data.success && res.data.data) {
          const validProducts = res.data.data.filter(
            (product) => product && product._id && product.name
          );
          setProducts(validProducts);
        } else {
          console.error("Failed to fetch products: Invalid response", res.data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category NAME (not the whole category object)
  const groupedProducts = products.reduce((acc, product) => {
    // Extract category name properly
    let categoryName = 'Uncategorized';
    
    if (product.category) {
      if (typeof product.category === 'string') {
        categoryName = product.category;
        console.warn(`Product ${product._id} has category as string: ${categoryName}`);
      } else if (typeof product.category === 'object' && product.category.name) {
        categoryName = product.category.name;
      }
    }
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  // Get categories array
  const categories = Object.keys(groupedProducts);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#003049]">
        <div className="w-12 h-12 border-4 border-[#9d0208] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#003049]">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category} className="mb-12 sm:mb-16 lg:mb-20">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                {category}
              </h2>
              <button
                onClick={() => router.push(`/all-products?category=${category}`)}
                className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                View All
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {groupedProducts[category].slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 py-10">No products available.</p>
      )}

      {/* See All Products Button */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <button
          onClick={() => router.push("/all-products")}
          className="px-8 sm:px-12 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-white/5 border border-white/20 hover:bg-[#9d0208] hover:border-[#9d0208] transition-all duration-300"
        >
          See All Products
        </button>
      </div>
    </div>
  );
};

export default HomeProducts;