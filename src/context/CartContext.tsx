import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface CartItem {
    id: string;
    restaurantItemId: string;
    restaurantItemName: string;
    restaurantItemPrice: number;
    restaurantItemImageUrl: string;
    quantity: number;
    restaurantItemCategory: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem, quantity: number) => boolean;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    updateQuantity: (itemId: string, newQuantity: number) => void;
    getTotalQuantity: () => number;
    checkIfSameRestaurant: (newRestaurantItemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem, quantity: number): boolean => {
        if (!checkIfSameRestaurant(item.restaurantItemId)) {
            const confirmReset = window.confirm(`Your Cart contains items from another restaurant. Would you like to reset your cart for adding items from this restaurant?`);
            if (confirmReset) {
                clearCart();
                setCart([{ ...item, id: `${item.restaurantItemId}-${Date.now()}`, quantity }]);
                return true;
            }
            return false;
        }

        const existingItemIndex = cart.findIndex((cartItem) => cartItem.restaurantItemId === item.restaurantItemId);

        if (existingItemIndex !== -1) {
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += quantity;
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...item, id: `${item.restaurantItemId}-${Date.now()}`, quantity }]);
        }
        return true;
    };

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        const updatedCart = cart.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        setCart(updatedCart);
    };

    const getTotalQuantity = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const checkIfSameRestaurant = (newRestaurantItemId: string) => {
        if (cart.length === 0) {
            return true;
        }

        const newRestaurantId = newRestaurantItemId.split('_')[0];

        return cart.every(item => {
            const currentRestaurantId = item.restaurantItemId.split('_')[0];
            return currentRestaurantId === newRestaurantId;
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, getTotalQuantity, checkIfSameRestaurant }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};