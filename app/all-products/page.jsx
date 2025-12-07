'use client'
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";

// Map category names to URL slugs
const slugMap = {
    'Gaming Consoles': 'gaming-consoles',
    'Mobile Accessories': 'mobile-accessories',
    'PlayStation Games': 'playstation-games',
    'Gaming Accessories': 'gaming-accessories'
};

const AllProducts = () => {
    const { products } = useAppContext();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return [...new Set(cats)];
    }, [products]);

    // Filter products based on selected categories
    const filteredProducts = useMemo(() => {
        if (selectedCategories.length === 0) return products;
        return products.filter(p => selectedCategories.includes(p.category));
    }, [products, selectedCategories]);

    // Toggle category selection
    const toggleCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategories([]);
    };

    return (
        <>
            <TopBar/>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
                <div className="max-w-7xl mx-auto px-4 min-[375px]:px-6 sm:px-8 lg:px-12">
                    {/* Premium Breadcrumb */}
                    <div className="pt-8 sm:pt-10 lg:pt-12 pb-6">
                        <nav className="inline-flex items-center gap-2 text-sm bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-lg">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                            </Link>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-white font-medium">All Products</span>
                        </nav>
                    </div>

                    {/* Premium Header */}
                    <div className="flex items-center justify-between pb-8 sm:pb-10 relative">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-[#9d0208]/10 blur-3xl rounded-full"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-1 w-12 bg-gradient-to-r from-[#9d0208] to-transparent"></div>
                                <span className="text-xs font-semibold text-[#9d0208] uppercase tracking-wider">Shop</span>
                            </div>
                            <h1 className="text-3xl min-[375px]:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                                All Products
                            </h1>
                            {selectedCategories.length > 0 ? (
                                <p className="text-sm text-gray-400">
                                    Filtered by: <span className="text-[#9d0208] font-semibold">{selectedCategories.join(', ')}</span>
                                </p>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <p className="text-base text-gray-400 font-light">{products.length} products available</p>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-xs"></div>
                                </div>
                            )}
                        </div>
                        
                        {/* Premium Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden relative flex items-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-xl shadow-lg group"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span>Filters</span>
                            {selectedCategories.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#9d0208] to-[#d00000] text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                                    {selectedCategories.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-8 lg:gap-10 pb-16 sm:pb-20">
                        {/* Premium Sidebar - Desktop */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#9d0208] to-[#d00000] rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </div>
                                            <h2 className="text-lg font-bold text-white">Browse</h2>
                                        </div>
                                        {selectedCategories.length > 0 && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs text-[#9d0208] hover:text-[#d00000] transition-colors font-semibold flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Category Links Section */}
                                    <div className="mb-8">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h3>
                                        <div className="space-y-1.5">
                                            {categories.map((category) => {
                                                const slug = slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
                                                return (
                                                    <Link
                                                        key={category}
                                                        href={`/all-products/${slug}`}
                                                        className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl relative overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gray-400 flex-shrink-0 relative z-10"></div>
                                                        <span className="relative z-10">{category}</span>
                                                        <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Filter Section */}
                                    <div className="pt-6 border-t border-white/10">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Filter Products</h3>
                                        <div className="space-y-3">
                                            {categories.map((category) => (
                                                <label
                                                    key={category}
                                                    className="flex items-center gap-3 cursor-pointer group px-2"
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(category)}
                                                            onChange={() => toggleCategory(category)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:border-[#9d0208] peer-checked:bg-gradient-to-br peer-checked:from-[#9d0208] peer-checked:to-[#d00000] transition-all flex items-center justify-center shadow-inner">
                                                            <svg
                                                                className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                        {category}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Info Card */}
                                <div className="mt-6 p-6 bg-gradient-to-br from-[#9d0208]/10 to-transparent border border-[#9d0208]/20 rounded-2xl backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-[#9d0208]/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#9d0208]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-white">Premium Quality</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Hand-picked collection of the finest gaming gear
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Premium Mobile Filters Overlay */}
                        {showFilters && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                                <div className="absolute right-0 top-0 bottom-0 w-full min-[375px]:w-96 bg-gradient-to-br from-[#001d2e] to-[#003049] border-l border-white/10 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
                                    {/* Header */}
                                    <div className="sticky top-0 z-10 p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-[#001d2e] to-[#003049] backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#9d0208] to-[#d00000] rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white">Filters</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-lg"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        {/* Category Links */}
                                        <div className="mb-8">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Browse Categories</h3>
                                            <div className="space-y-2">
                                                {categories.map((category) => {
                                                    const slug = slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
                                                    return (
                                                        <Link
                                                            key={category}
                                                            href={`/all-products/${slug}`}
                                                            className="group flex items-center gap-3 px-4 py-3.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl relative overflow-hidden"
                                                            onClick={() => setShowFilters(false)}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gray-400 flex-shrink-0 relative z-10"></div>
                                                            <span className="relative z-10">{category}</span>
                                                            <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Filters */}
                                        <div className="pt-6 border-t border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter Selection</h3>
                                                {selectedCategories.length > 0 && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="text-xs text-[#9d0208] hover:text-[#d00000] transition-colors font-semibold flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {categories.map((category) => (
                                                    <label
                                                        key={category}
                                                        className="flex items-center gap-3 cursor-pointer group px-2"
                                                    >
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(category)}
                                                                onChange={() => toggleCategory(category)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-6 h-6 border-2 border-white/20 rounded peer-checked:border-[#9d0208] peer-checked:bg-gradient-to-br peer-checked:from-[#9d0208] peer-checked:to-[#d00000] transition-all flex items-center justify-center">
                                                                <svg
                                                                    className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                            {category}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sticky Footer */}
                                    <div className="sticky bottom-0 p-6 border-t border-white/10 bg-gradient-to-t from-[#001d2e] to-transparent backdrop-blur-xl">
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="w-full py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white font-semibold transition-all rounded-xl shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="flex-1">
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard key={index} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-[#9d0208]/20 blur-3xl rounded-full"></div>
                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center">
                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">No Products Found</h3>
                                    <p className="text-base text-gray-400 mb-10 max-w-md">Try adjusting your filters to find what you're looking for</p>
                                    {selectedCategories.length > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white text-sm font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 rounded-xl group"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span>Clear All Filters</span>
                                        </button>
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

export default AllProducts;