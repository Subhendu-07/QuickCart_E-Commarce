'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()


    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(true)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        try {

            const { data } = await axios.get('/api/product/list')

            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

        /* setProducts(productsDummyData) */
    }

    const fetchUserData = async () => {

        try {

            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true)
            }

            const token = await getToken()

            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    const syncCartWithServer = async (cartData, message) => {
        if (!user) return;

        try {
            const token = await getToken();
            await axios.post('/api/cart/get/update', { cartData }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success(message);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const addToCart = async (itemId) => {
        const cartData = structuredClone(cartItems);
        const alreadyExists = !!cartData[itemId];

        cartData[itemId] = (cartData[itemId] || 0) + 1;
        setCartItems(cartData);

        const message = alreadyExists ? 'Cart updated' : 'Item added to cart';
        await syncCartWithServer(cartData, message);
    };

    const updateCartQuantity = async (itemId, quantity) => {
        const cartData = structuredClone(cartItems);

        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }

        setCartItems(cartData);
        await syncCartWithServer(cartData, 'Cart updated');
    };


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
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}