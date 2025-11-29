'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, router } = useAppContext();
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSellerOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get("/api/seller/orders", { withCredentials: true });
            if (data.success) {
                setOrders(data.orders || []);
            } else {
                setError(data.error || "Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching seller orders:", err);
            if (err.response?.status === 401) {
                setError("Please login to view orders");
                router.push('/login');
            } else if (err.response?.status === 403) {
                setError("Unauthorized. Seller access required.");
            } else {
                setError(err.response?.data?.error || "Failed to fetch orders");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "seller" || session?.user?.role === "admin") {
            fetchSellerOrders();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
                <Loading />
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-xl text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            <div className="md:p-10 p-4 space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Orders</h2>
                    <button
                        onClick={fetchSellerOrders}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-xs"
                    >
                        Refresh
                    </button>
                </div>
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-xl text-gray-500 mb-4">No orders found</p>
                        <p className="text-sm text-gray-400">Orders containing your products will appear here</p>
                    </div>
                ) : (
                    <div className="max-w-4xl rounded-md">
                        {orders.map((order) => (
                            <div key={order._id} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image
                                        className="max-w-16 max-h-16 object-cover"
                                        src={assets.box_icon}
                                        alt="box_icon"
                                    />
                                    <div className="flex flex-col gap-3">
                                        <span className="font-medium">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => {
                                                    const productName = item.product?.name || "Unknown Product";
                                                    return (
                                                        <span key={idx}>
                                                            {productName} x {item.quantity}
                                                            {idx < order.items.length - 1 ? ", " : ""}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                "No items"
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Items : {order.totalItems || order.items?.length || 0}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Customer: {order.customer?.name || "N/A"}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded inline-block w-fit ${
                                            order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                            order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                            order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                            "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {order.status || "Order Placed"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p>
                                        <span className="font-medium">{order.address?.fullName || "N/A"}</span>
                                        <br />
                                        <span>{order.address?.area || ""}</span>
                                        <br />
                                        <span>{`${order.address?.city || ""}, ${order.address?.state || ""}`}</span>
                                        <br />
                                        <span>{order.address?.phoneNumber || ""}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="font-medium">{currency}{order.sellerAmount?.toFixed(2) || order.amount?.toFixed(2) || "0.00"}</p>
                                    <p className="text-xs text-gray-500 mt-1">Your Products</p>
                                </div>
                                <div>
                                    <p className="flex flex-col">
                                        <span>Method : COD</span>
                                        <span>Date : {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</span>
                                        <span className={`font-medium ${
                                            order.paymentType === "Paid" ? "text-green-600" :
                                            order.paymentType === "Refunded" ? "text-red-600" :
                                            order.paymentType === "Pending" ? "text-yellow-600" :
                                            "text-gray-600"
                                        }`}>
                                            Payment : {order.paymentType || "COD"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Orders;