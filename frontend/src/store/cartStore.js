import { create } from 'zustand';

export const useCartStore = create((set) => ({
    cartItems: [],
    addToCart: (product) =>
        set((state) => {
            // Check if item exists with same ID AND same price
            const existingItem = state.cartItems.find(
                (item) => item.product === product._id && item.price === product.price
            );

            if (existingItem) {
                return {
                    cartItems: state.cartItems.map((item) =>
                        item.cartItemId === existingItem.cartItemId
                            ? { ...item, qty: item.qty + 1 }
                            : item
                    ),
                };
            } else {
                return {
                    cartItems: [
                        ...state.cartItems,
                        {
                            cartItemId: `${product._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            product: product._id,
                            name: product.name,
                            price: product.price,
                            category: product.category, // Include category
                            qty: 1,
                        },
                    ],
                };
            }
        }),
    removeFromCart: (cartItemId) =>
        set((state) => ({
            cartItems: state.cartItems.filter((item) => item.cartItemId !== cartItemId),
        })),
    updateQty: (cartItemId, qty) =>
        set((state) => ({
            cartItems: state.cartItems.map((item) =>
                item.cartItemId === cartItemId ? { ...item, qty: Number(qty) } : item
            ),
        })),
    clearCart: () => set({ cartItems: [] }),
}));
