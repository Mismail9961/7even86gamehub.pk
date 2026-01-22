'use client';

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Loading from "@/components/Loading";
import CategorySeoSchema from "@/components/CategorySeoSchema";
import { useAppContext } from "@/context/AppContext";

/* ================= HELPERS ================= */
const slugify = (text = "") =>
  text.toLowerCase().replace(/\s+/g, "-");

/* ================= COMPONENT ================= */
const CategoryPage = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [categorySeo, setCategorySeo] = useState(null);

  const isAllProducts = category === "all-products";

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category/list");
        const data = await res.json();

        if (data.success) {
          // Normalize category IDs to strings
          const normalized = data.data.map((c) => ({
            _id: String(c._id),
            name: c.name,
            slug: slugify(c.name)
          }));

          setCategories(normalized);
          console.log("Categories loaded:", normalized);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /* ================= ACTIVE CATEGORY ================= */
  const activeCategory = useMemo(() => {
    if (isAllProducts) return null;

    const found = categories.find(
      (c) => c.slug === category
    );

    console.log("Active category:", found, "for slug:", category);
    return found;
  }, [categories, category, isAllProducts]);

  const categoryName = activeCategory?.name || "All Products";
  const categoryId = activeCategory?._id;

  /* ================= FETCH CATEGORY SEO ================= */
  useEffect(() => {
    if (isAllProducts || !category) {
      setCategorySeo(null);
      return;
    }

    const fetchSeo = async () => {
      try {
        // Correct path based on your folder structure
        const res = await fetch(`/api/seo/category/${category}`);
        const data = await res.json();
        if (data.success) {
          setCategorySeo(data.data);
          console.log("✅ SEO Data Loaded:", data.data);
        } else {
          setCategorySeo(null);
          console.log("❌ SEO Data not found for:", category);
        }
      } catch (err) {
        console.error("SEO fetch failed", err);
        setCategorySeo(null);
      }
    };

    fetchSeo();
  }, [category, isAllProducts]);

  /* ================= UPDATE PAGE SEO META TAGS ================= */
  useEffect(() => {
    if (!categorySeo?.seo) {
      // Fallback to default title if no SEO data
      document.title = `${categoryName} | 7even86gamehub`;
      return;
    }

    const seo = categorySeo.seo;
    const og = seo.openGraph || {};

    // Update document title
    document.title = seo.title || `${categoryName} | 7even86gamehub`;

    // Helper function to update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      if (!content) return;
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update basic SEO meta tags
    updateMetaTag('description', seo.description);
    if (seo.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0) {
      updateMetaTag('keywords', seo.keywords.join(', '));
    }

    // Update Open Graph meta tags
    updateMetaTag('og:title', og.title || seo.title, true);
    updateMetaTag('og:description', og.description || seo.description, true);
    updateMetaTag('og:url', og.url || (typeof window !== 'undefined' ? window.location.href : ''), true);
    updateMetaTag('og:site_name', og.siteName || '7even86gamehub', true);
    updateMetaTag('og:locale', og.locale || 'en_US', true);
    updateMetaTag('og:type', og.type || 'website', true);
    if (og.image) {
      updateMetaTag('og:image', og.image, true);
    }

    // Update Twitter Card meta tags (optional, but good for SEO)
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', og.title || seo.title);
    updateMetaTag('twitter:description', og.description || seo.description);
    if (og.image) {
      updateMetaTag('twitter:image', og.image);
    }

  }, [categorySeo, categoryName]);

  /* ================= FILTER PRODUCTS BY CATEGORY ID ================= */
  const filteredProducts = useMemo(() => {
    if (isAllProducts) {
      console.log("Showing all products:", products.length);
      return products;
    }

    if (!categoryId) {
      console.log("No category ID found, returning empty");
      return [];
    }

    // Filter products where product.category matches the category._id
    const filtered = products.filter((p) => {
      // Handle MongoDB ObjectId format: {"$oid": "id"} or plain string
      let productCategoryId;
      
      if (typeof p.category === 'object' && p.category?.$oid) {
        productCategoryId = String(p.category.$oid);
      } else if (typeof p.category === 'object' && p.category?._id) {
        productCategoryId = String(p.category._id);
      } else {
        productCategoryId = String(p.category);
      }
      
      const matches = productCategoryId === categoryId;
      
      if (matches) {
        // Only log matching if needed for debugging
        // console.log("✅ Product matched:", p.name, "| Category ID:", productCategoryId);
      }
      
      return matches;
    });

    console.log(`🔍 Filtered ${filtered.length} products for category "${categoryName}" (ID: ${categoryId})`);
    
    return filtered;
  }, [products, categoryId, isAllProducts, categoryName]);

  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return filteredProducts;

    const q = searchQuery.toLowerCase();
    return filteredProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [filteredProducts, searchQuery]);

  /* ================= PAGE LOADING ================= */
  useEffect(() => {
    if (!loadingCategories) {
      const t = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(t);
    }
  }, [loadingCategories]);

  /* ================= LOADING ================= */
  if (isLoading) return <Loading />;

  /* ================= INVALID CATEGORY ================= */
  if (!isAllProducts && !activeCategory) {
    return (
      <>
        <TopBar />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#001d2e] px-3">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 sm:mb-4">404</h1>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Category not found</p>
            <Link
              href="/all-products"
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-[#9d0208] text-white text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-[#7a0006] transition"
            >
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <CategorySeoSchema
        categoryName={categoryName}
        categorySlug={category}
        products={searchedProducts}
        categorySeo={categorySeo}
      />

      <TopBar />
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-12">

          {/* Breadcrumb */}
          <div className="pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-4 lg:pb-6 text-xs sm:text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span className="mx-1.5 sm:mx-2">/</span>
            <span className="text-white truncate inline-block max-w-[200px] sm:max-w-none align-bottom">{categoryName}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 lg:gap-6 pb-4 sm:pb-6 lg:pb-10">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                {categoryName}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                {searchedProducts.length} {searchedProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            <div className="relative w-full lg:w-96">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 pl-8 sm:pl-10 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9d0208]/40 transition"
              />
              <span className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-base sm:text-lg text-gray-500">
                🔍
              </span>
            </div>
          </div>

          {/* MOBILE CATEGORY DROPDOWN */}
          <div className="lg:hidden w-full mb-4 sm:mb-6">
            <select
              value={isAllProducts ? "all-products" : category}
              onChange={(e) => {
                const value = e.target.value;
                window.location.href = value === "all-products" ? "/all-products" : `/${value}`;
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-black border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/40"
            >
              <option value="all-products">All Products ({products.length})</option>
              {categories.map((cat) => {
                const productCount = products.filter(p => {
                  let productCategoryId = p.category?.$oid || p.category?._id || p.category;
                  return String(productCategoryId) === cat._id;
                }).length;
                
                return (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name} ({productCount})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-4 sm:gap-6 lg:gap-8 pb-8 sm:pb-12 lg:pb-20">

            {/* SIDEBAR - Desktop Only */}
            <aside className="hidden lg:block w-72">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 text-lg">Categories</h3>

                <Link
                  href="/all-products"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all ${
                    isAllProducts
                      ? "bg-[#9d0208] text-white shadow-lg shadow-[#9d0208]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-xs opacity-70">{products.length}</span>
                </Link>

                <div className="space-y-1">
                  {categories.map((cat) => {
                    const active = cat.slug === category;
                    const productCount = products.filter(p => {
                      let productCategoryId = p.category?.$oid || p.category?._id || p.category;
                      return String(productCategoryId) === cat._id;
                    }).length;

                    return (
                      <Link
                        key={cat._id}
                        href={`/${cat.slug}`}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                          active
                            ? "bg-[#9d0208] text-white shadow-lg shadow-[#9d0208]/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-70">{productCount}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* PRODUCTS GRID */}
            <div className="flex-1 w-full min-w-0">
              {searchedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
                  {searchedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-24 lg:py-32 px-3">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📦</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    No products found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? `No results for "${searchQuery}" in ${categoryName}`
                      : `No products available in ${categoryName} yet`
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#9d0208] text-white text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-[#7a0006] transition"
                    >
                      Clear Search
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

export default CategoryPage;