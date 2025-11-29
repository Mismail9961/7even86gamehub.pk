import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OrderSummary = ({ cartItems = {}, cartProducts = {} }) => {

  const { currency, router, products, loadCart } = useAppContext()
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
      } else {
        console.error(data.error);
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
    // Validate address is selected
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    // Validate user has addresses
    if (userAddresses.length === 0) {
      toast.error("Please add a delivery address first");
      router.push('/add-address');
      return;
    }

    // Validate cart has items
    const cartItemIds = Object.keys(cartItems || {}).filter(id => cartItems[id] > 0);
    if (cartItemIds.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate all products are loaded
    const missingProducts = cartItemIds.filter(id => !cartProducts[id]);
    if (missingProducts.length > 0) {
      toast.error("Some products are still loading. Please wait...");
      return;
    }

    try {
      setIsPlacingOrder(true);

      // Format items array for API
      const items = cartItemIds.map(itemId => ({
        product: itemId,
        quantity: cartItems[itemId]
      }));

      // Get address ID - handle both _id (MongoDB ObjectId) and id (string)
      const addressId = selectedAddress._id 
        ? (typeof selectedAddress._id === 'string' ? selectedAddress._id : selectedAddress._id.toString())
        : selectedAddress.id;

      if (!addressId) {
        toast.error("Invalid address selected");
        setIsPlacingOrder(false);
        return;
      }

      // Call the order creation API
      const response = await axios.post(
        '/api/order/create',
        {
          address: addressId,
          items: items
        },
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success("Order placed successfully!");
        
        // Clear cart by reloading it (the API already cleared it in the database)
        if (loadCart) {
          await loadCart();
        }
        
        // Redirect to orders page
        setTimeout(() => {
          router.push('/my-orders');
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order";
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error("Please login to place an order");
        router.push('/login');
      } else if (error.response?.status === 404) {
        toast.error("Address or product not found. Please refresh and try again.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsPlacingOrder(false);
    }
  }

  useEffect(() => {
    fetchUserAddresses();
  }, [])

  const cartItemIds = Object.keys(cartItems || {}).filter(id => cartItems[id] > 0);

  // Calculate cart totals dynamically
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
      subtotal: Math.floor(subtotal * 100) / 100,
      tax,
      total
    };
  };

  const cartTotals = calculateCartTotals();

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>


        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {cartTotals.itemCount}</p>
            <p className="text-gray-800">{currency}{cartTotals.subtotal}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{cartTotals.tax}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>{currency}{cartTotals.total}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={createOrder} 
        disabled={isPlacingOrder || cartItemIds.length === 0}
        className={`w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 transition ${
          isPlacingOrder || cartItemIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default OrderSummary;