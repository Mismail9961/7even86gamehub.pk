'use client'
import { productsDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()
    const { data: session } = useSession();

    const [products, setProducts] = useState([])
    const [cartItems, setCartItems] = useState({})
    const [cartLoading, setCartLoading] = useState(false)
    const cartUpdateTimeoutRef = useRef(null);

    // Get user data from session
    const userData = session?.user || null;
    
    // Check if user is seller or admin
    const isSeller = session?.user?.role === "seller" || session?.user?.role === "admin";

    const fetchProductData = async () => {
        try {
            const res = await axios.get('/api/product/list');
            if (res.data.success && res.data.data) {
                setProducts(res.data.data);
            } else {
                // Fallback to dummy data if API fails
                setProducts(productsDummyData);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to dummy data if API fails
            setProducts(productsDummyData);
        }
    }

    // Save cart to database
    const saveCartToDB = async (cartData) => {
        if (!session?.user?.id) {
            // Guest user - save to localStorage
            localStorage.setItem('guestCart', JSON.stringify(cartData));
            return;
        }

        try {
            await axios.post('/api/cart', { cartItems: cartData }, {
                withCredentials: true,
            });
        } catch (error) {
            console.error('Error saving cart to database:', error);
            // Don't show error toast for every cart update to avoid spam
        }
    }

    // Load cart from database or localStorage
    const loadCart = async () => {
        if (!session?.user?.id) {
            // Guest user - load from localStorage
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                try {
                    setCartItems(JSON.parse(guestCart));
                } catch (error) {
                    console.error('Error loading guest cart:', error);
                }
            }
            return;
        }

        // Logged in user - load from database
        try {
            setCartLoading(true);
            const res = await axios.get('/api/cart', {
                withCredentials: true,
            });
            
            if (res.data.success && res.data.data) {
                // Merge with guest cart if exists
                const guestCart = localStorage.getItem('guestCart');
                if (guestCart) {
                    try {
                        const guestCartData = JSON.parse(guestCart);
                        const mergedCart = { ...res.data.data };
                        
                        // Merge guest cart items with account cart
                        for (const itemId in guestCartData) {
                            if (mergedCart[itemId]) {
                                mergedCart[itemId] += guestCartData[itemId];
                            } else {
                                mergedCart[itemId] = guestCartData[itemId];
                            }
                        }
                        
                        setCartItems(mergedCart);
                        // Save merged cart and clear guest cart
                        await saveCartToDB(mergedCart);
                        localStorage.removeItem('guestCart');
                    } catch (error) {
                        console.error('Error merging guest cart:', error);
                        setCartItems(res.data.data);
                    }
                } else {
                    setCartItems(res.data.data);
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setCartLoading(false);
        }
    }

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        
        // Debounce cart save to avoid too many API calls
        if (cartUpdateTimeoutRef.current) {
            clearTimeout(cartUpdateTimeoutRef.current);
        }
        cartUpdateTimeoutRef.current = setTimeout(() => {
            saveCartToDB(cartData);
        }, 500);

        toast.success('Item added to cart');
    }

    const updateCartQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        
        // Debounce cart save to avoid too many API calls
        if (cartUpdateTimeoutRef.current) {
            clearTimeout(cartUpdateTimeoutRef.current);
        }
        cartUpdateTimeoutRef.current = setTimeout(() => {
            saveCartToDB(cartData);
        }, 500);
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0 && itemInfo) {
                const price = itemInfo.offerPrice || itemInfo.price || 0;
                totalAmount += price * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    // Load cart when session changes
    useEffect(() => {
        loadCart();
    }, [session?.user?.id])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (cartUpdateTimeoutRef.current) {
                clearTimeout(cartUpdateTimeoutRef.current);
            }
        };
    }, [])

    const value = {
        currency, 
        router,
        isSeller,
        userData,
        products, 
        fetchProductData,
        cartItems, 
        setCartItems,
        addToCart, 
        updateCartQuantity,
        getCartCount, 
        getCartAmount,
        cartLoading,
        loadCart
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}