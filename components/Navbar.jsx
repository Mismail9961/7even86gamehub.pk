"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { router, getCartCount } = useAppContext();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  const canAccessSellerDashboard =
    session?.user?.role === "seller" || session?.user?.role === "admin";

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut({ redirect: false });
    window.location.reload();
  };

  const cartCount = getCartCount();

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-[#9d0208]/20">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-2 xs:gap-3">
            <Image
              className="cursor-pointer w-16 xs:w-20 sm:w-28 lg:w-36 h-auto max-h-12 lg:max-h-14 object-contain transition-transform hover:scale-105"
              onClick={() => router.push("/")}
              src={assets.mainlogo}
              alt="logo"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-[#9d0208] text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Home
            </Link>
            <Link
              href="/all-products"
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/all-products")
                  ? "bg-[#9d0208] text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/about-us"
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/about-us")
                  ? "bg-[#9d0208] text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/contact-us")
                  ? "bg-[#9d0208] text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 xs:gap-3">
            {/* Seller Dashboard - Desktop */}
            {canAccessSellerDashboard && (
              <button
                onClick={() => router.push("/seller")}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#9d0208] hover:bg-[#7a0106] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => router.push("/cart")}
              className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[#9d0208] text-white text-xs flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {status === "loading" ? (
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/10 animate-pulse"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-[#9d0208] flex items-center justify-center text-white font-bold text-lg">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-72 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-20">
                        {/* Header */}
                        <div className="px-5 py-4 bg-[#9d0208]">
                          <p className="text-base font-bold text-white truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-white/80 truncate mt-0.5">
                            {session.user.email}
                          </p>
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-[#9d0208] bg-white rounded-full">
                            {session.user.role}
                          </span>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/my-orders"
                            className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>My Orders</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#9d0208] rounded-lg hover:bg-[#7a0106] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </Link>
              )}
            </div>

            {/* Mobile User Menu */}
            <div className="md:hidden">
              {status === "loading" ? (
                <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/10 animate-pulse"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-0.5"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-[#9d0208] flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10 bg-black/50"
                        onClick={() => setShowDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-[300px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 z-20 overflow-hidden max-h-[85vh] overflow-y-auto">
                        {/* Mobile Header */}
                        <div className="px-4 py-4 bg-[#9d0208]">
                          <p className="text-sm font-bold text-white truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-white/80 truncate mt-0.5">
                            {session.user.email}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-semibold text-[#9d0208] bg-white rounded-full">
                            {session.user.role}
                          </span>
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="lg:hidden border-b border-white/10">
                          <Link
                            href="/"
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                              isActive("/")
                                ? "text-white bg-[#9d0208]"
                                : "text-gray-300 hover:bg-white/5"
                            }`}
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Home</span>
                          </Link>
                          <Link
                            href="/all-products"
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                              isActive("/all-products")
                                ? "text-white bg-[#9d0208]"
                                : "text-gray-300 hover:bg-white/5"
                            }`}
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Shop</span>
                          </Link>
                          <Link
                            href="/about-us"
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                              isActive("/about-us")
                                ? "text-white bg-[#9d0208]"
                                : "text-gray-300 hover:bg-white/5"
                            }`}
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>About Us</span>
                          </Link>
                          <Link
                            href="/contact-us"
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                              isActive("/contact-us")
                                ? "text-white bg-[#9d0208]"
                                : "text-gray-300 hover:bg-white/5"
                            }`}
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Contact</span>
                          </Link>
                        </div>

                        {canAccessSellerDashboard && (
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              router.push("/seller");
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors border-b border-white/10"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Seller Dashboard</span>
                          </button>
                        )}

                        <Link
                          href="/my-orders"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-white bg-[#9d0208] rounded-lg hover:bg-[#7a0106] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden xs:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;