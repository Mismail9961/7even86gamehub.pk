'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const AdminOrders = () => {
    const { currency, router } = useAppContext();
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingPayment, setUpdatingPayment] = useState({});

    // Check if user is admin
    if (session && session.user?.role !== "admin") {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-xl text-red-500 mb-4">Access Denied. Admin only.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get("/api/admin/orders", { withCredentials: true });
            if (data.success) {
                setOrders(data.orders || []);
            } else {
                setError(data.error || "Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status === 401) {
                setError("Please login to view orders");
                router.push('/login');
            } else if (err.response?.status === 403) {
                setError("Unauthorized. Admin access required.");
            } else {
                setError(err.response?.data?.error || "Failed to fetch orders");
            }
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentType = async (orderId, newPaymentType) => {
        try {
            setUpdatingPayment({ ...updatingPayment, [orderId]: true });
            
            const { data } = await axios.patch(
                "/api/admin/orders/update-payment",
                {
                    orderId,
                    paymentType: newPaymentType
                },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Payment type updated successfully");
                // Update the order in the local state
                setOrders(orders.map(order => 
                    order._id === orderId 
                        ? { ...order, paymentType: newPaymentType }
                        : order
                ));
            } else {
                toast.error(data.error || "Failed to update payment type");
            }
        } catch (err) {
            console.error("Error updating payment type:", err);
            toast.error(err.response?.data?.error || "Failed to update payment type");
        } finally {
            setUpdatingPayment({ ...updatingPayment, [orderId]: false });
        }
    };

    useEffect(() => {
        if (session?.user?.role === "admin") {
            fetchOrders();
        }
    }, [session]);

    if (loading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
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
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-medium mt-6">All Orders (Admin)</h2>
                        <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                            Refresh
                        </button>
                    </div>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-xl text-gray-500 mb-4">No orders found</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl border-t border-gray-300 text-sm overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Order ID</th>
                                        <th className="px-4 py-3 text-left">User Details</th>
                                        <th className="px-4 py-3 text-left">Items</th>
                                        <th className="px-4 py-3 text-left">Address</th>
                                        <th className="px-4 py-3 text-left">Amount</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Payment</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {order._id.toString().substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{order.user?.name || "N/A"}</span>
                                                    <span className="text-xs text-gray-500">{order.user?.email || "N/A"}</span>
                                                    <span className="text-xs text-gray-400">{order.user?.role || "customer"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item, idx) => {
                                                            const productName = item.product?.name || item.product || "Unknown Product";
                                                            return (
                                                                <span key={idx} className="text-xs">
                                                                    {productName} x {item.quantity}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No items</span>
                                                    )}
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        Total: {order.items?.length || 0} items
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-xs">
                                                    <span className="font-medium">{order.address?.fullName || "N/A"}</span>
                                                    <br />
                                                    <span>{order.address?.area || ""}</span>
                                                    <br />
                                                    <span>{`${order.address?.city || ""}, ${order.address?.state || ""}`}</span>
                                                    <br />
                                                    <span>{order.address?.phoneNumber || ""}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-medium">{currency}{order.amount?.toFixed(2) || "0.00"}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                                    order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                                    order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {order.status || "Order Placed"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <select
                                                    value={order.paymentType || "COD"}
                                                    onChange={(e) => updatePaymentType(order._id, e.target.value)}
                                                    disabled={updatingPayment[order._id]}
                                                    className={`px-2 py-1 rounded text-xs border ${
                                                        updatingPayment[order._id] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                    } ${
                                                        order.paymentType === "Paid" ? "bg-green-100 text-green-800" :
                                                        order.paymentType === "Refunded" ? "bg-red-100 text-red-800" :
                                                        order.paymentType === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    <option value="COD">COD</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Refunded">Refunded</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs text-gray-600">
                                                    {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}
                                                </span>
                                                <br />
                                                <span className="text-xs text-gray-400">
                                                    {order.date ? new Date(order.date).toLocaleTimeString() : ""}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdminOrders;

