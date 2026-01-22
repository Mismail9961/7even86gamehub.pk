"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const { getCartCount } = useAppContext();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showShopSubmenu, setShowShopSubmenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const canAccessSellerDashboard =
    session?.user?.role === "seller" || session?.user?.role === "admin";

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/category/list");
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Convert category name to URL slug
  const convertToSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleSignOut = async () => {
    setShowSidebar(false);
    await signOut({ redirect: false });
    window.location.reload();
  };

  const cartCount = getCartCount();

  const isActive = (path) => pathname === path;

  // Check if any category route is active
  const isCategoryRouteActive = () => {
    if (pathname === "/all-products") return true;
    return categories.some(
      (category) => pathname === `/${convertToSlug(category.name)}`
    );
  };

  const handleCategoryClick = (categoryName) => {
    setShowSidebar(false);
    setShowShopSubmenu(false);
    const slug = convertToSlug(categoryName);
    router.push(`/${slug}`);
  };

  const handleNavigation = (path) => {
    setShowSidebar(false);
    setShowShopSubmenu(false);
    router.push(path);
  };

  return (
    <>
      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] xs:w-[300px] bg-[#003049] z-[70] transform transition-transform duration-300 ease-out shadow-2xl ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative px-4 xs:px-6 py-4 xs:py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h1 className="text-lg xs:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                7even86gamehub
              </h1>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1.5 xs:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* User Info Section */}
            {status === "loading" ? (
              <div className="px-4 xs:px-6 py-4 xs:py-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 xs:w-14 h-12 xs:h-14 rounded-xl bg-white/5 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-3.5 xs:h-4 bg-white/5 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-2.5 xs:h-3 bg-white/5 rounded-lg animate-pulse w-2/3"></div>
                  </div>
                </div>
              </div>
            ) : session ? (
              <div className="px-4 xs:px-6 py-4 xs:py-5 border-b border-white/10">
                <div className="flex items-center gap-3 xs:gap-4">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-12 xs:w-14 h-12 xs:h-14 rounded-xl object-cover border-2 border-[#9d0208]/40 shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 xs:w-14 h-12 xs:h-14 rounded-xl bg-gradient-to-br from-[#9d0208] to-[#dc2626] flex items-center justify-center text-white font-bold text-lg xs:text-xl shadow-lg border-2 border-[#9d0208]/40 flex-shrink-0">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm xs:text-[15px] font-semibold text-white truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] xs:text-xs text-gray-400 truncate mt-0.5 xs:mt-1">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 xs:px-6 py-4 xs:py-5 border-b border-white/10">
                <button
                  onClick={() => handleNavigation("/login")}
                  className="w-full flex items-center justify-center gap-2 xs:gap-2.5 px-4 xs:px-5 py-2.5 xs:py-3 text-xs xs:text-sm font-semibold text-white bg-gradient-to-r from-[#9d0208] to-[#dc2626] rounded-xl hover:from-[#7a0106] hover:to-[#b91c1c] transition-all duration-200 shadow-lg hover:shadow-[#9d0208]/50"
                >
                  <svg className="w-4 xs:w-5 h-4 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              </div>
            )}

            {/* Navigation */}
            <nav className="py-3 xs:py-4 px-2 xs:px-3">
              {/* Home */}
              <button
                onClick={() => handleNavigation("/")}
                className={`w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                  isActive("/")
                    ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>

              {/* Shop with Submenu */}
              <div className="mb-1">
                <button
                  onClick={() => setShowShopSubmenu(!showShopSubmenu)}
                  className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 ${
                    isCategoryRouteActive()
                      ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 xs:gap-3.5">
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Shop</span>
                  </div>
                  <svg
                    className={`w-3.5 xs:w-4 h-3.5 xs:h-4 transition-transform duration-300 flex-shrink-0 ${showShopSubmenu ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Submenu */}
                {showShopSubmenu && (
                  <div className="mt-1 ml-3 xs:ml-4 pl-4 xs:pl-6 border-l-2 border-white/10 space-y-0.5">
                    <button
                      onClick={() => handleNavigation("/all-products")}
                      className="w-full text-left px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg text-xs xs:text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                      All Products
                    </button>
                    
                    {loadingCategories ? (
                      <div className="px-3 xs:px-4 py-2 text-xs text-gray-500">
                        Loading...
                      </div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category.name)}
                          className="w-full text-left px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg text-xs xs:text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                          {category.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 xs:px-4 py-2 text-xs text-gray-500">
                        No categories
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* About */}
              <button
                onClick={() => handleNavigation("/about-us")}
                className={`w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                  isActive("/about-us")
                    ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About Us</span>
              </button>

              {/* Contact */}
              <button
                onClick={() => handleNavigation("/contact-us")}
                className={`w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                  isActive("/contact-us")
                    ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact</span>
              </button>

              {/* Divider for logged in users */}
              {session && <div className="my-3 xs:my-4 border-t border-white/10"></div>}

              {/* Cart */}
              {session && (
                <button
                  onClick={() => handleNavigation("/cart")}
                  className={`w-full flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                    isActive("/cart")
                      ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 xs:gap-3.5">
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="min-w-[22px] xs:min-w-[24px] h-5 xs:h-6 px-1.5 xs:px-2 bg-white text-[#9d0208] text-[10px] xs:text-xs font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* My Orders */}
              {session && (
                <button
                  onClick={() => handleNavigation("/my-orders")}
                  className={`w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                    isActive("/my-orders")
                      ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>My Orders</span>
                </button>
              )}

              {/* Seller Dashboard */}
              {canAccessSellerDashboard && (
                <>
                  <div className="my-3 xs:my-4 border-t border-white/10"></div>
                  <button
                    onClick={() => handleNavigation("/seller")}
                    className={`w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium transition-all duration-200 mb-1 ${
                      pathname?.startsWith("/seller")
                        ? "bg-gradient-to-r from-[#9d0208] to-[#dc2626] text-white shadow-lg shadow-[#9d0208]/30"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Dashboard</span>
                  </button>
                </>
              )}

              {/* Sign Out */}
              {session && (
                <>
                  <div className="my-3 xs:my-4 border-t border-white/10"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 xs:gap-3.5 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl text-sm xs:text-[15px] font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition-all duration-200"
                  >
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="px-4 xs:px-6 py-3 xs:py-4 border-t border-white/10 bg-black/40">
            <p className="text-[10px] xs:text-[11px] text-gray-500 text-center">
              © 2024 7even86gamehub.pk All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;