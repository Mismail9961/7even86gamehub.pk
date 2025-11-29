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

    const getStatusColor = (status) => {
        switch(status) {
            case "Delivered":
                return "bg-green-50 text-green-700 border-green-200";
            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            case "Shipped":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Processing":
                return "bg-purple-50 text-purple-700 border-purple-200";
            default:
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
        }
    };

    const getPaymentColor = (paymentType) => {
        switch(paymentType) {
            case "Paid":
                return "text-green-600";
            case "Refunded":
                return "text-red-600";
            case "Pending":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col min-h-screen bg-gray-50">
                <div className="px-4 sm:px-6 md:px-12 lg:px-24 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">View and track your order history</p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-lg shadow-sm">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-lg sm:text-xl text-red-600 mb-4 text-center px-4">{error}</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                Go to Home
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-lg shadow-sm">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-600 mb-2 font-medium">No orders yet</p>
                            <p className="text-sm text-gray-500 mb-6 text-center px-4">Start shopping to see your orders here</p>
                            <button
                                onClick={() => router.push('/all-products')}
                                className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, index) => (
                                <div key={order._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Header */}
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm text-gray-500">Order ID:</span>
                                            <span className="text-xs sm:text-sm font-mono font-medium text-gray-700">
                                                #{order._id?.slice(-8) || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs sm:text-sm text-gray-600">
                                                {order.date ? new Date(order.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                }) : "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Body */}
                                    <div className="p-4">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Product Info */}
                                            <div className="flex gap-3 flex-1">
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <Image
                                                            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
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
                                                                    <div key={idx} className="text-sm sm:text-base font-medium text-gray-800 mb-1">
                                                                        {productName} <span className="text-gray-500">× {item.quantity}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-sm text-gray-500">No items</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                            {order.status || "Order Placed"}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider for mobile */}
                                            <div className="block sm:hidden border-t border-gray-200 my-2"></div>

                                            {/* Price & Details */}
                                            <div className="flex sm:flex-col justify-between sm:justify-start items-start sm:items-end gap-3 sm:gap-2 sm:min-w-[140px]">
                                                <div className="flex flex-col gap-1 sm:items-end">
                                                    <span className="text-xs text-gray-500">Total Amount</span>
                                                    <span className="text-lg sm:text-xl font-bold text-gray-800">
                                                        {currency}{order.amount?.toFixed(2) || "0.00"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 sm:items-end">
                                                    <span className="text-xs text-gray-500">Payment</span>
                                                    <span className={`text-sm font-semibold ${getPaymentColor(order.paymentType)}`}>
                                                        {order.paymentType || "COD"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Address */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <div className="text-xs sm:text-sm text-gray-600 flex-1">
                                                    <span className="font-medium text-gray-800">{order.address?.fullName || "N/A"}</span>
                                                    <br />
                                                    <span>{order.address?.area || ""}</span>
                                                    {order.address?.area && ", "}
                                                    <span>{order.address?.city || ""}</span>
                                                    {order.address?.city && ", "}
                                                    <span>{order.address?.state || ""}</span>
                                                    {order.address?.phoneNumber && (
                                                        <>
                                                            <br />
                                                            <span className="text-gray-500">📞 {order.address.phoneNumber}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Track Order Button */}
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                                                onClick={() => toast.info('Tracking feature coming soon!')}
                                            >
                                                Track Order
                                            </button>
                                            <button 
                                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
        </>
    );
};

export default MyOrders;