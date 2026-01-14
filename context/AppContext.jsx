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
    const [cartProducts, setCartProducts] = useState([]) // Detailed product info
    const [cartUpdates, setCartUpdates] = useState(null) // Track updates/deletions
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

    // Load cart from database or localStorage with product sync
    const loadCart = async () => {
        if (!session?.user?.id) {
            // Guest user - load from localStorage
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                try {
                    const parsedCart = JSON.parse(guestCart);
                    setCartItems(parsedCart);
                    
                    // Validate guest cart items against current products
                    const validatedCart = {};
                    for (const [productId, quantity] of Object.entries(parsedCart)) {
                        const productExists = products.find(p => p._id === productId);
                        if (productExists && quantity > 0) {
                            validatedCart[productId] = quantity;
                        }
                    }
                    
                    // Update if items were removed
                    if (Object.keys(validatedCart).length !== Object.keys(parsedCart).length) {
                        setCartItems(validatedCart);
                        localStorage.setItem('guestCart', JSON.stringify(validatedCart));
                        
                        const deletedCount = Object.keys(parsedCart).length - Object.keys(validatedCart).length;
                        if (deletedCount > 0) {
                            toast.error(`${deletedCount} unavailable item(s) removed from cart`);
                        }
                    }
                } catch (error) {
                    console.error('Error loading guest cart:', error);
                }
            }
            return;
        }

        // Logged in user - load from database with sync
        try {
            setCartLoading(true);
            const res = await axios.get('/api/cart', {
                withCredentials: true,
            });
            
            if (res.data.success) {
                const { data, products: cartProductDetails, updates } = res.data;
                
                // Merge with guest cart if exists
                const guestCart = localStorage.getItem('guestCart');
                if (guestCart) {
                    try {
                        const guestCartData = JSON.parse(guestCart);
                        const mergedCart = { ...data };
                        
                        // Merge guest cart items with account cart
                        for (const itemId in guestCartData) {
                            if (mergedCart[itemId]) {
                                mergedCart[itemId] += guestCartData[itemId];
                            } else {
                                mergedCart[itemId] = guestCartData[itemId];
                            }
                        }
                        
                        setCartItems(mergedCart);
                        setCartProducts(cartProductDetails || []);
                        
                        // Save merged cart and clear guest cart
                        await saveCartToDB(mergedCart);
                        localStorage.removeItem('guestCart');
                        
                        toast.success('Guest cart merged with your account');
                    } catch (error) {
                        console.error('Error merging guest cart:', error);
                        setCartItems(data);
                        setCartProducts(cartProductDetails || []);
                    }
                } else {
                    setCartItems(data);
                    setCartProducts(cartProductDetails || []);
                }
                
                // Show notifications for updates/deletions
                if (updates) {
                    setCartUpdates(updates);
                    
                    if (updates.totalDeleted > 0) {
                        toast.error(
                            `${updates.totalDeleted} unavailable item(s) removed from your cart`,
                            { duration: 4000 }
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('Failed to load cart');
        } finally {
            setCartLoading(false);
        }
    }

    const addToCart = async (itemId) => {
        // Validate product exists
        const productExists = products.find(p => p._id === itemId);
        if (!productExists) {
            toast.error('Product not available');
            return;
        }

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
            toast.success('Item removed from cart');
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

    // Refresh cart to check for product updates
    const refreshCart = async () => {
        if (session?.user?.id) {
            await loadCart();
        }
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    // Load cart when session changes or products are loaded
    useEffect(() => {
        if (products.length > 0) {
            loadCart();
        }
    }, [session?.user?.id, products.length])

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
        cartProducts,
        cartUpdates,
        addToCart, 
        updateCartQuantity,
        getCartCount, 
        getCartAmount,
        cartLoading,
        loadCart,
        refreshCart
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}