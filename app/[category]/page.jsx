'use client'
import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import Link from "next/link";

// Map URL slugs to actual category names
const categoryMap = {
    'all-products': 'All Products',
    'gaming-consoles': 'Gaming Consoles',
    'mobile-accessories': 'Mobile Accessories',
    'playstation-games': 'PlayStation Games',
    'gaming-accessories': 'Gaming Accessories'
};

// Reverse map for getting slug from category name
const slugMap = Object.fromEntries(
    Object.entries(categoryMap).map(([slug, name]) => [name, slug])
);

const CategoryPage = () => {
    const { products } = useAppContext();
    const params = useParams();
    const categorySlug = params.category;
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Get the actual category name from the slug
    const categoryName = categoryMap[categorySlug];
    const isAllProducts = categorySlug === 'all-products';

    // Extract unique categories for sidebar
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return [...new Set(cats)];
    }, [products]);

    // Filter products by the current category or show all
    const filteredProducts = useMemo(() => {
        if (!categoryName) return [];
        if (isAllProducts) return products;
        return products.filter(p => p.category === categoryName);
    }, [products, categoryName, isAllProducts]);

    // Filter products based on search query
    const searchedProducts = useMemo(() => {
        if (!searchQuery.trim()) return filteredProducts;
        
        const query = searchQuery.toLowerCase();
        return filteredProducts.filter(product => 
            product.name?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
        );
    }, [filteredProducts, searchQuery]);

    // Handle loading state - wait for products to load
    useEffect(() => {
        if (products.length > 0) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [products, categorySlug]);

    // Show loading screen
    if (isLoading) {
        return <Loading />;
    }

    // If category doesn't exist, show 404-like message
    if (!categoryName || (!isAllProducts && !categories.includes(categoryName))) {
        return (
            <>
                <TopBar/>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e] flex items-center justify-center px-3">
                    <div className="text-center px-2 max-w-md">
                        <div className="mb-4 sm:mb-6 relative">
                            <div className="absolute inset-0 bg-[#9d0208]/20 blur-3xl rounded-full"></div>
                            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2 relative">404</h1>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Category Not Found</h2>
                        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">The category you're looking for doesn't exist or may have been moved.</p>
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-2 px-6 min-[375px]:px-8 py-3 min-[375px]:py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white text-xs min-[375px]:text-sm sm:text-base font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 group"
                        >
                            <span>Back to Home</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar/>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
                <div className="max-w-7xl mx-auto px-3 min-[375px]:px-4 sm:px-6 md:px-8 lg:px-12">
                    {/* Breadcrumb with glass effect */}
                    <div className="pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
                        <nav className="inline-flex items-center gap-1.5 min-[375px]:gap-2 text-xs min-[375px]:text-sm bg-white/5 backdrop-blur-sm border border-white/10 px-2.5 min-[375px]:px-3 sm:px-4 py-2 min-[375px]:py-2.5 sm:py-3 rounded-lg">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 min-[375px]:gap-2 group">
                                <svg className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="hidden min-[375px]:inline">Home</span>
                            </Link>
                            <svg className="w-3 h-3 min-[375px]:w-4 min-[375px]:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-white font-medium truncate max-w-[100px] min-[375px]:max-w-none">{categoryName}</span>
                        </nav>
                    </div>

                    {/* Premium Header with Search Bar */}
                    <div className="pb-6 sm:pb-8 lg:pb-10 relative">
                        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#9d0208]/10 blur-3xl rounded-full"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 min-[375px]:gap-3 sm:gap-4 mb-2 sm:mb-3">
                                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#9d0208] to-transparent"></div>
                                <span className="text-[10px] min-[375px]:text-xs font-semibold text-[#9d0208] uppercase tracking-wider">
                                    {isAllProducts ? 'All Products' : 'Category'}
                                </span>
                            </div>
                            
                            {/* Header with Search Bar in same line */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-3 sm:mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-tight">
                                        {categoryName}
                                    </h1>
                                </div>
                                
                                {/* Search Bar - aligned to right on desktop */}
                                <div className="lg:w-96 xl:w-[28rem]">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#9d0208] focus:ring-2 focus:ring-[#9d0208]/30 transition-all text-sm"
                                        />
                                        <svg 
                                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 sm:gap-6">
                                <p className="text-sm min-[375px]:text-base text-gray-400 font-light">
                                    {searchedProducts.length} {searchedProducts.length === 1 ? 'product' : 'products'}
                                    {searchQuery && <span className="ml-1">for "{searchQuery}"</span>}
                                </p>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[150px] sm:max-w-xs"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 sm:gap-8 lg:gap-10 pb-12 sm:pb-16 lg:pb-20">
                        {/* Premium Sidebar with glass morphism */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#9d0208] to-[#d00000] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Categories</h2>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        {/* All Products Link */}
                                        <Link
                                            href="/all-products"
                                            className={`group flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-xl relative overflow-hidden ${
                                                isAllProducts 
                                                    ? 'bg-gradient-to-r from-[#9d0208] to-[#d00000] text-white font-semibold shadow-lg shadow-[#9d0208]/30' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {!isAllProducts && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            )}
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10 ${
                                                isAllProducts ? 'bg-white' : 'bg-gray-600 group-hover:bg-gray-400'
                                            }`}></div>
                                            <span className="relative z-10 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                All Products
                                            </span>
                                            {isAllProducts && (
                                                <svg className="w-4 h-4 ml-auto relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </Link>

                                        {/* Individual Categories */}
                                        {categories.map((cat) => {
                                            const isActive = cat === categoryName && !isAllProducts;
                                            const slug = slugMap[cat] || cat.toLowerCase().replace(/\s+/g, '-');
                                            
                                            return (
                                                <Link
                                                    key={cat}
                                                    href={`/${slug}`}
                                                    className={`group flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-xl relative overflow-hidden ${
                                                        isActive 
                                                            ? 'bg-gradient-to-r from-[#9d0208] to-[#d00000] text-white font-semibold shadow-lg shadow-[#9d0208]/30' 
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {!isActive && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    )}
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10 ${
                                                        isActive ? 'bg-white' : 'bg-gray-600 group-hover:bg-gray-400'
                                                    }`}></div>
                                                    <span className="relative z-10">{cat}</span>
                                                    {isActive && (
                                                        <svg className="w-4 h-4 ml-auto relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Decorative element */}
                                <div className="mt-6 p-6 bg-gradient-to-br from-[#9d0208]/10 to-transparent border border-[#9d0208]/20 rounded-2xl backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-[#9d0208]/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#9d0208]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-white">Premium Selection</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {isAllProducts 
                                            ? 'Browse our complete collection of gaming products'
                                            : 'Curated collection of high-quality gaming products'
                                        }
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Products Grid with enhanced spacing */}
                        <div className="flex-1">
                            {searchedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 min-[375px]:gap-4 sm:gap-6 lg:gap-8">
                                    {searchedProducts.map((product, index) => (
                                        <ProductCard key={index} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
                                    <div className="relative mb-6 sm:mb-8">
                                        <div className="absolute inset-0 bg-[#9d0208]/20 blur-3xl rounded-full"></div>
                                        <div className="relative w-20 h-20 min-[375px]:w-24 min-[375px]:h-24 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                                            <svg className="w-10 h-10 min-[375px]:w-12 min-[375px]:h-12 sm:w-16 sm:h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl min-[375px]:text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                                        {searchQuery ? "No Results Found" : "No Products Yet"}
                                    </h3>
                                    <p className="text-sm min-[375px]:text-base text-gray-400 mb-8 sm:mb-10 max-w-md px-2">
                                        {searchQuery 
                                            ? `No products match "${searchQuery}". Try a different search term.`
                                            : "We're working on adding amazing products to this category. Check back soon!"
                                        }
                                    </p>
                                    {searchQuery ? (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="inline-flex items-center gap-2 px-6 min-[375px]:px-8 py-3 min-[375px]:py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white text-xs min-[375px]:text-sm font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 rounded-xl group"
                                        >
                                            <span>Clear Search</span>
                                            <svg className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <Link
                                            href="/"
                                            className="inline-flex items-center gap-2 px-6 min-[375px]:px-8 py-3 min-[375px]:py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white text-xs min-[375px]:text-sm font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 rounded-xl group"
                                        >
                                            <span>Back to Home</span>
                                            <svg className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <WhatsAppButton/>
        </>
    );
};

export default CategoryPage;