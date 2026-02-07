'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
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
    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    // Available status and payment type options
    const statusOptions = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    const paymentTypeOptions = ["COD", "Paid", "Pending", "Refunded"];

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get("/api/order/get-orders", { withCredentials: true });
            if (data.success) {
                setOrders(data.orders || []);
                console.log(`Loaded ${data.totalOrders} orders for ${data.userRole}`);
            } else {
                setError(data.error || "Failed to fetch orders");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status === 401) {
                setError("Please login to view orders");
                router.push('/login');
            } else if (err.response?.status === 403) {
                setError("Unauthorized access");
            } else {
                setError(err.response?.data?.error || "Failed to fetch orders");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmed = window.confirm("Are you sure you want to delete this order? This action cannot be undone.");
        
        if (!confirmed) return;

        setDeletingOrderId(orderId);
        try {
            const { data } = await axios.delete(`/api/order/delete?orderId=${orderId}`, {
                withCredentials: true
            });

            if (data.success) {
                toast.success("Order deleted successfully");
                setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            } else {
                toast.error(data.message || "Failed to delete order");
            }
        } catch (err) {
            console.error("Error deleting order:", err);
            if (err.response?.status === 403) {
                toast.error("You don't have permission to delete orders");
            } else if (err.response?.status === 404) {
                toast.error("Order not found");
            } else {
                toast.error(err.response?.data?.message || "Failed to delete order");
            }
        } finally {
            setDeletingOrderId(null);
        }
    };

    const handleUpdateOrder = async (orderId, field, value) => {
        setUpdatingOrderId(orderId);
        try {
            const updateData = {
                orderId,
                [field]: value
            };

            const { data } = await axios.put("/api/order/update-status", updateData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (data.success) {
                toast.success(`Order ${field} updated successfully`);
                
                // Update the order in state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId 
                            ? { ...order, [field]: value }
                            : order
                    )
                );
            } else {
                toast.error(data.message || "Failed to update order");
            }
        } catch (err) {
            console.error("Error updating order:", err);
            if (err.response?.status === 403) {
                toast.error("You don't have permission to update orders");
            } else if (err.response?.status === 404) {
                toast.error("Order not found");
            } else if (err.response?.status === 405) {
                toast.error("Method not allowed. Please check your API route setup.");
                console.error("405 Error - Make sure the file is at: app/api/order/update-status/route.js");
            } else {
                toast.error(err.response?.data?.message || "Failed to update order");
            }
        } finally {
            setUpdatingOrderId(null);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchOrders();
        }
    }, [session]);

    // Check if user is admin or seller
    const isAdminOrSeller = session?.user?.role === "admin" || session?.user?.role === "seller";

    if (loading) {
        return (
            <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm bg-[#003049] text-white">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm bg-[#003049] text-white">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-xl text-[#9d0208] mb-4">{error}</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-2 bg-[#9d0208] text-white rounded hover:bg-[#7a0006] transition"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm bg-[#003049] text-white">
            <div className="md:p-10 p-4 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-[#9d0208]">
                            {session?.user?.role === "admin" ? "All Orders (Admin)" : 
                             session?.user?.role === "seller" ? "All Orders (Seller)" : 
                             "My Orders"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Total: {orders.length} order{orders.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-[#9d0208]/20 text-[#9d0208] rounded hover:bg-[#9d0208]/30 transition text-xs"
                    >
                        Refresh
                    </button>
                </div>

                {/* No Orders */}
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-xl text-gray-400 mb-4">No orders found</p>
                        <p className="text-sm text-gray-500">
                            {isAdminOrSeller 
                                ? "All orders will appear here" 
                                : "Your orders will appear here"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">

                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-[#002839] rounded-lg p-5 border border-[#9d0208]/40 relative"
                            >
                                {/* Delete Button (Admin/Seller only) */}
                                {isAdminOrSeller && (
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        disabled={deletingOrderId === order._id}
                                        className={`absolute top-3 right-3 p-2 rounded-full transition z-10 ${
                                            deletingOrderId === order._id
                                                ? "bg-gray-600 cursor-not-allowed"
                                                : "bg-red-900/40 hover:bg-red-900/60 text-red-300"
                                        }`}
                                        title="Delete Order"
                                    >
                                        {deletingOrderId === order._id ? (
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                                    {/* Order Info */}
                                    <div className="md:col-span-2 flex gap-5">
                                        <Image
                                            className="max-w-16 max-h-16 object-cover"
                                            src={assets.box_icon}
                                            alt="box_icon"
                                        />

                                        <div className="flex flex-col gap-2 text-white">
                                            <span className="font-medium text-sm">
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

                                            <span className="text-xs text-gray-400">
                                                Order ID: {order._id.slice(-8)}
                                            </span>

                                            <span className="text-xs text-gray-400">
                                                Items: {order.totalItems || order.items?.length || 0}
                                            </span>

                                            {/* Status - Editable for Admin/Seller */}
                                            {isAdminOrSeller ? (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs text-gray-400">Order Status:</label>
                                                    <select
                                                        value={order.status || "Order Placed"}
                                                        onChange={(e) => handleUpdateOrder(order._id, 'status', e.target.value)}
                                                        disabled={updatingOrderId === order._id}
                                                        className={`text-xs px-2 py-1.5 rounded font-medium bg-[#003049] border cursor-pointer ${
                                                            order.status === "Delivered"
                                                                ? "border-green-500 text-green-300"
                                                                : order.status === "Cancelled"
                                                                ? "border-red-500 text-red-300"
                                                                : order.status === "Shipped"
                                                                ? "border-blue-500 text-blue-300"
                                                                : "border-yellow-500 text-yellow-300"
                                                        } ${updatingOrderId === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {statusOptions.map(status => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-xs px-2 py-1 rounded inline-block w-fit font-medium ${
                                                        order.status === "Delivered"
                                                            ? "bg-green-900/40 text-green-300"
                                                            : order.status === "Cancelled"
                                                            ? "bg-red-900/40 text-red-300"
                                                            : order.status === "Shipped"
                                                            ? "bg-blue-900/40 text-blue-300"
                                                            : "bg-yellow-900/40 text-yellow-300"
                                                    }`}
                                                >
                                                    {order.status || "Order Placed"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Customer Info (for admin/seller) */}
                                    {isAdminOrSeller && (
                                        <div className="text-gray-300 text-sm">
                                            <p className="font-medium text-white mb-1 text-xs">Customer</p>
                                            <p className="text-xs">
                                                {order.address?.fullName || "N/A"}
                                                <br />
                                                {order.address?.phoneNumber || ""}
                                            </p>
                                        </div>
                                    )}

                                    {/* Address */}
                                    <div className="text-gray-300 text-sm">
                                        <p className="font-medium text-white mb-1 text-xs">Delivery Address</p>
                                        <p className="text-xs">
                                            {order.address?.area || ""}
                                            <br />
                                            {`${order.address?.city || ""}, ${order.address?.state || ""}`}
                                            <br />
                                            {order.address?.pinCode || order.address?.zipCode || ""}
                                        </p>
                                    </div>

                                    {/* Payment & Amount */}
                                    <div className="text-sm text-gray-300 space-y-2">
                                        <div>
                                            <p className="font-medium text-white text-xs mb-1">Amount</p>
                                            <p className="font-medium text-white">
                                                {currency}
                                                {order.amount?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs">
                                                Method: {order.paymentMethod || order.paymentType || "COD"}
                                            </p>
                                            <p className="text-xs">
                                                Date: {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>

                                        {/* Payment Type - Editable for Admin/Seller */}
                                        {isAdminOrSeller ? (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Payment Status:</label>
                                                <select
                                                    value={order.paymentType || "Pending"}
                                                    onChange={(e) => handleUpdateOrder(order._id, 'paymentType', e.target.value)}
                                                    disabled={updatingOrderId === order._id}
                                                    className={`text-xs px-2 py-1.5 rounded font-medium bg-[#003049] border cursor-pointer ${
                                                        order.paymentType === "Paid"
                                                            ? "border-green-500 text-green-400"
                                                            : order.paymentType === "Refunded"
                                                            ? "border-red-500 text-red-400"
                                                            : "border-yellow-500 text-yellow-400"
                                                    } ${updatingOrderId === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {paymentTypeOptions.map(type => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span
                                                className={`text-xs font-medium ${
                                                    order.payment === true || order.paymentType === "Paid"
                                                        ? "text-green-400"
                                                        : order.paymentType === "Refunded"
                                                        ? "text-red-400"
                                                        : "text-yellow-400"
                                                }`}
                                            >
                                                {order.payment === true || order.paymentType === "Paid" 
                                                    ? "Paid" 
                                                    : order.paymentType || "Pending"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Orders;