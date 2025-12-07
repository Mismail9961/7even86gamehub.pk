'use client'
import { useState, useMemo, useEffect, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import { useSearchParams } from "next/navigation";
import WhatsAppButton from "@/components/WhatsAppButton";

// Separate component that uses useSearchParams
function ProductsContent() {
    const { products } = useAppContext();
    const searchParams = useSearchParams();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return [...new Set(cats)];
    }, [products]);

    // Handle URL category parameter
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            // Convert URL slug to actual category name if needed
            const categoryMap = {
                'gaming-consoles': 'Gaming Consoles',
                'mobile-accessories': 'Mobile Accessories',
                'playStation-games': 'PlayStation Games',
                'gaming-accessories': 'Gaming Accessories'
            };
            
            const categoryName = categoryMap[categoryParam] || categoryParam;
            
            // Only set if the category exists in our products
            if (categories.includes(categoryName)) {
                setSelectedCategories([categoryName]);
            }
        }
    }, [searchParams, categories]);

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
        <div className="min-h-screen bg-[#003049]">
            <div className="max-w-7xl mx-auto px-4 min-[375px]:px-6 sm:px-8 lg:px-12">
                {/* Header */}
                <div className="flex items-center justify-between pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-bold text-white">
                            All Products
                        </h1>
                        {selectedCategories.length > 0 && (
                            <p className="text-sm text-gray-400 mt-2">
                                Filtered by: <span className="text-[#9d0208] font-medium">{selectedCategories.join(', ')}</span>
                            </p>
                        )}
                    </div>
                    
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-3 min-[375px]:px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="hidden min-[375px]:inline">Filters</span>
                        {selectedCategories.length > 0 && (
                            <span className="bg-[#9d0208] text-white text-xs px-1.5 py-0.5 rounded-full">
                                {selectedCategories.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex gap-6 lg:gap-8 py-8 sm:py-10 lg:py-12">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white/5 border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white">Filters</h2>
                                {selectedCategories.length > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-[#9d0208] hover:text-[#7a0106] transition-colors font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <label
                                            key={category}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => toggleCategory(category)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-5 h-5 border-2 border-white/20 peer-checked:border-[#9d0208] peer-checked:bg-[#9d0208] transition-all flex items-center justify-center">
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
                    </aside>

                    {/* Mobile Filters Overlay */}
                    {showFilters && (
                        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
                            <div className="absolute right-0 top-0 bottom-0 w-full min-[375px]:w-80 bg-black border-l border-white/10 overflow-y-auto">
                                <div className="p-4 min-[375px]:p-6 border-b border-white/10 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white">Filters</h2>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-4 min-[375px]:p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-semibold text-white">Categories</h3>
                                        {selectedCategories.length > 0 && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs text-[#9d0208] hover:text-[#7a0106] transition-colors font-medium"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {categories.map((category) => (
                                            <label
                                                key={category}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => toggleCategory(category)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-6 h-6 border-2 border-white/20 peer-checked:border-[#9d0208] peer-checked:bg-[#9d0208] transition-all flex items-center justify-center">
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

                                <div className="sticky bottom-0 p-4 min-[375px]:p-6 border-t border-white/10 bg-black">
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-full py-3 bg-[#9d0208] hover:bg-[#7a0106] text-white font-semibold transition-colors"
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
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 min-[375px]:gap-4 sm:gap-6">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No products found</h3>
                                <p className="text-sm text-gray-400 mb-6">Try adjusting your filters</p>
                                {selectedCategories.length > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 bg-[#9d0208] hover:bg-[#7a0106] text-white text-sm font-semibold transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
const AllProducts = () => {
    return (
        <>
            <TopBar/>
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-white">Loading...</div>
                </div>
            }>
                <ProductsContent />
            </Suspense>
            <Footer />
            <WhatsAppButton/>
        </>
    );
};

export default AllProducts;