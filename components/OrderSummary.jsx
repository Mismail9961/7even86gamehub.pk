import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderSummary = ({ cartItems = {}, cartProducts = {} }) => {
  const { currency, router, products, loadCart } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    try {
      const { data } = await axios.get("/api/get-address", { withCredentials: true });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses.find(addr => addr.isDefault) || data.addresses[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (userAddresses.length === 0) {
      toast.error("Please add a delivery address first");
      router.push("/add-address");
      return;
    }

    const cartItemIds = Object.keys(cartItems || {}).filter(id => cartItems[id] > 0);
    if (cartItemIds.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const items = cartItemIds.map(itemId => ({
        product: itemId,
        quantity: cartItems[itemId],
      }));

      const addressId = selectedAddress._id || selectedAddress.id;

      const response = await axios.post(
        "/api/order/create",
        { address: addressId, items },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order placed successfully!");

        if (loadCart) await loadCart();

        setTimeout(() => {
          router.push("/my-orders");
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  const cartItemIds = Object.keys(cartItems || {}).filter(id => cartItems[id] > 0);

  const calculateCartTotals = () => {
    let totalItems = 0;
    let subtotal = 0;

    cartItemIds.forEach(itemId => {
      const quantity = cartItems[itemId] || 0;
      const product = cartProducts[itemId] || products.find(p => p._id === itemId);

      if (product && quantity > 0) {
        totalItems += quantity;
        const price = product.offerPrice || product.price || 0;
        subtotal += price * quantity;
      }
    });

    const tax = Math.floor(subtotal * 0.02);
    const total = subtotal + tax;

    return {
      itemCount: totalItems,
      subtotal: Math.floor(subtotal),
      tax,
      total,
    };
  };

  const totals = calculateCartTotals();

  return (
    <div className="w-full md:w-96 bg-[#003049] border border-white/10 rounded-lg p-4 sm:p-5 text-white">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#9d0208]">
        Order Summary
      </h2>

      {/* Address Selector */}
      <div className="mb-6">
        <label className="text-sm font-semibold block mb-2 text-gray-300">
          Select Address
        </label>

        <div className="relative text-sm">
          <button
            className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded text-gray-200 flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>
              {selectedAddress
                ? `${selectedAddress.fullName}, ${selectedAddress.city}`
                : "Choose Address"}
            </span>

            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <ul className="absolute w-full bg-black border border-white/10 mt-1 rounded shadow-lg z-20 max-h-40 overflow-y-auto">
              {userAddresses.map((address, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-white/10 cursor-pointer text-gray-200"
                  onClick={() => handleAddressSelect(address)}
                >
                  {address.fullName}, {address.city}
                </li>
              ))}
              <li
                onClick={() => router.push("/add-address")}
                className="px-3 py-2 text-center text-[#9d0208] hover:bg-white/10 cursor-pointer font-semibold"
              >
                + Add New Address
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <p className="text-gray-300">Items ({totals.itemCount})</p>
          <p>{currency}{totals.subtotal}</p>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-300">Shipping</p>
          <p className="text-green-400 font-semibold">Free</p>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-300">Tax (2%)</p>
          <p>{currency}{totals.tax}</p>
        </div>

        <div className="flex justify-between pt-3 mt-3 border-t border-white/10 text-lg font-bold">
          <p>Total</p>
          <p className="text-[#9d0208]">{currency}{totals.total}</p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={createOrder}
        disabled={isPlacingOrder}
        className={`w-full py-3 mt-6 rounded text-white font-semibold transition 
          ${isPlacingOrder ? "bg-[#9d0208]/50 cursor-not-allowed" : "bg-[#9d0208] hover:bg-[#7a0106]"}`}
      >
        {isPlacingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderSummary;
