'use client';

import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";

const AllProducts = () => {
  const { products } = useAppContext();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category/list");
        const data = await res.json();

        if (data.success) {
          setCategories(data.data.map((c) => c.name));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /* ================= HELPER: GET CATEGORY NAME ================= */
  const getCategoryName = (category) => {
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object' && category.name) return category.name;
    return '';
  };

  /* ================= HELPER: CONVERT TO SLUG ================= */
  const convertToSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return products;
    return products.filter((p) => {
      const categoryName = getCategoryName(p.category);
      return selectedCategories.includes(categoryName);
    });
  }, [products, selectedCategories]);

  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return filteredProducts;

    const q = searchQuery.toLowerCase();
    return filteredProducts.filter((p) => {
      const categoryName = getCategoryName(p.category);
      return (
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [filteredProducts, searchQuery]);

  /* ================= HELPERS ================= */
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  const renderCategories = (onClick) => {
    if (loadingCategories) {
      return (
        <p className="text-sm text-gray-400 px-4">
          Loading categories...
        </p>
      );
    }

    if (categories.length === 0) {
      return (
        <p className="text-sm text-gray-500 px-4">
          No categories found
        </p>
      );
    }

    return categories.map((category) => {
      const slug = convertToSlug(category);

      return (
        <Link
          key={category}
          href={`/${slug}`}
          onClick={onClick}
          className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <span>{category}</span>
        </Link>
      );
    });
  };

  /* ================= JSX ================= */
  return (
    <>
      <TopBar />
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Header */}
          <div className="pt-10 pb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              All Products
            </h1>

            {/* Search */}
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208]/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </span>
            </div>
          </div>

          <div className="flex gap-8 pb-20">

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block w-72">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Categories</h3>
                <div className="space-y-1">
                  {renderCategories()}
                </div>

                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-[#9d0208] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </aside>

            {/* MOBILE FILTER BUTTON */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden fixed bottom-6 right-6 z-40 px-6 py-3 bg-[#9d0208] text-white rounded-full shadow-2xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* MOBILE FILTER SIDEBAR */}
            {showFilters && (
              <>
                <div
                  className="lg:hidden fixed inset-0 bg-black/60 z-40"
                  onClick={() => setShowFilters(false)}
                ></div>
                <div className="lg:hidden fixed right-0 top-0 bottom-0 w-80 bg-[#001d2e] border-l border-white/10 z-50 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Categories</h4>
                      <div className="space-y-1">
                        {renderCategories(() => setShowFilters(false))}
                      </div>
                    </div>

                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => {
                          clearFilters();
                          setShowFilters(false);
                        }}
                        className="w-full py-2 text-sm text-[#9d0208] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PRODUCTS GRID */}
            <div className="flex-1">
              {searchedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {searchedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    No products found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search or filters
                  </p>
                  {(searchQuery || selectedCategories.length > 0) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        clearFilters();
                      }}
                      className="px-6 py-3 bg-[#9d0208] text-white rounded-xl hover:bg-[#7a0106] transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default AllProducts;