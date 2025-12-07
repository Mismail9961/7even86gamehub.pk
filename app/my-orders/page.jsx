'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";

const MyOrders = () => {

    const { currency, router } = useAppContext();
    const { data: session, status: sessionStatus } = useSession();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get("/api/order/get-orders", {
                withCredentials: true
            });

            if (data.success) {
                setOrders(data.orders || []);
            } else {
                setError(data.error || "Failed to fetch orders");
                console.error(data.error);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status === 401) {
                setError("Please login to view orders");
                toast.error("Please login to view orders");
                setTimeout(() => router.push('/login'), 2000);
            } else if (err.response?.status === 403) {
                setError("Unauthorized access");
                toast.error("Unauthorized access");
            } else {
                setError(err.response?.data?.error || "Failed to fetch orders");
                toast.error(err.response?.data?.error || "Failed to fetch orders");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user) {
            fetchOrders();
        } else if (sessionStatus === "unauthenticated") {
            setLoading(false);
            setError("Please login to view orders");
        }
    }, [sessionStatus, session?.user?.id]);

    return (
        <>
        <TopBar/>
            <Navbar />
            <div className="min-h-screen bg-[#003049]">
                <div className="px-3 sm:px-4 md:px-8 lg:px-16 py-4 sm:py-6 md:py-8">
                    
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                            My Orders
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Track your order history</p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#8a1a13] rounded-full flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm sm:text-base text-white mb-6 text-center px-4">{error}</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-5 sm:px-6 py-2.5 bg-[#8a1a13] text-white rounded-lg font-semibold text-sm"
                            >
                                Return Home
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="text-base sm:text-lg text-white mb-2">No orders yet</p>
                            <p className="text-xs sm:text-sm text-gray-500 mb-6 text-center px-4">Start shopping today</p>
                            <button
                                onClick={() => router.push('/all-products')}
                                className="px-5 sm:px-6 py-2.5 bg-[#8a1a13] text-white rounded-lg font-semibold text-sm"
                            >
                                Explore Products
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {orders.map((order, index) => (
                                <div 
                                    key={order._id || index} 
                                    className="bg-gray-900 rounded-lg border border-gray-800"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gray-800 px-3 sm:px-4 py-2.5 border-b border-gray-700 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Order</span>
                                            <span className="text-xs sm:text-sm font-mono font-semibold text-[#8a1a13]">
                                                #{order._id?.slice(-8).toUpperCase() || "N/A"}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            }) : "N/A"}
                                        </span>
                                    </div>

                                    {/* Order Body */}
                                    <div className="p-3 sm:p-4">
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            
                                            {/* Product Info */}
                                            <div className="flex gap-2.5 flex-1">
                                                <div className="flex-shrink-0">
                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                                                        <Image
                                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                                            src={assets.box_icon}
                                                            alt="order"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-2">
                                                        {order.items && order.items.length > 0 ? (
                                                            order.items.map((item, idx) => {
                                                                const productName = item.product?.name || item.product || "Unknown Product";
                                                                return (
                                                                    <div key={idx} className="text-xs sm:text-sm font-semibold text-white mb-1">
                                                                        {productName} <span className="text-gray-500 font-normal">× {item.quantity}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-xs text-gray-500">No items</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-[#8a1a13] text-white">
                                                            {order.status || "Order Placed"}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider for mobile */}
                                            <div className="block sm:hidden border-t border-gray-800 my-2"></div>

                                            {/* Price & Payment */}
                                            <div className="flex sm:flex-col justify-between sm:justify-start items-start sm:items-end gap-2 sm:min-w-[100px]">
                                                <div className="flex flex-col gap-1 sm:items-end">
                                                    <span className="text-xs text-gray-500">Total</span>
                                                    <span className="text-base sm:text-lg font-bold text-[#8a1a13]">
                                                        {currency}{order.amount?.toFixed(2) || "0.00"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 sm:items-end">
                                                    <span className="text-xs text-gray-500">Payment</span>
                                                    <span className="text-xs sm:text-sm font-semibold text-white">
                                                        {order.paymentType || "COD"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Address */}
                                        <div className="mt-3 pt-3 border-t border-gray-800">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-3.5 h-3.5 text-[#8a1a13] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <div className="text-xs sm:text-sm text-gray-400 flex-1">
                                                    <span className="font-semibold text-white">{order.address?.fullName || "N/A"}</span>
                                                    <br />
                                                    <span>{order.address?.area || ""}</span>
                                                    {order.address?.area && ", "}
                                                    <span>{order.address?.city || ""}</span>
                                                    {order.address?.city && ", "}
                                                    <span>{order.address?.state || ""}</span>
                                                    {order.address?.phoneNumber && (
                                                        <>
                                                            <br />
                                                            <span>📞 {order.address.phoneNumber}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                className="flex-1 px-3 py-2 bg-[#8a1a13] text-white text-xs sm:text-sm font-semibold rounded-lg"
                                                onClick={() => toast.info('Tracking feature coming soon!')}
                                            >
                                                Track Order
                                            </button>
                                            <button
                                                className="flex-1 px-3 py-2 border border-gray-700 text-gray-300 text-xs sm:text-sm font-semibold rounded-lg"
                                                onClick={() => toast.info('Support feature coming soon!')}
                                            >
                                                Need Help?
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <WhatsAppButton/>
        </>
    );
};

export default MyOrders;