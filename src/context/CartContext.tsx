
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Product } from "@/lib/data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: { items: CartItem[] } }
  | { type: "SET_LOADING"; payload: boolean };

interface CartContextProps {
  state: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const calculateCartTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
  return items.reduce(
    (totals, item) => {
      return {
        totalItems: totals.totalItems + item.quantity,
        totalPrice: totals.totalPrice + item.product.price * item.quantity,
      };
    },
    { totalItems: 0, totalPrice: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }

      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );

      const { totalItems, totalPrice } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }
    
    case "SET_CART": {
      const { items } = action.payload;
      const { totalItems, totalPrice } = calculateCartTotals(items);
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
      };
    }
    
    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    default:
      return state;
  }
};

const CART_STORAGE_KEY = "woodcraft_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  
  // Initialize state from localStorage if available
  const initialState: CartState = (() => {
    if (typeof window === "undefined") {
      return { items: [], totalItems: 0, totalPrice: 0, isLoading: false };
    }
    
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart
        ? { ...JSON.parse(storedCart), isLoading: true }
        : { items: [], totalItems: 0, totalPrice: 0, isLoading: true };
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return { items: [], totalItems: 0, totalPrice: 0, isLoading: true };
    }
  })();

  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Fetch cart items from Supabase when user logs in
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!authState.isAuthenticated || !authState.user) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        
        const { data, error } = await supabase
          .from('user_cart_items')
          .select('*')
          .eq('user_id', authState.user.id);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Convert Supabase cart items to app cart items
          const cartItems: CartItem[] = data.map(item => {
            const product = { id: item.product_id } as Product;
            
            // Find the complete product details from local data
            const foundProduct = window.products?.find(p => p.id === item.product_id);
            
            return {
              product: foundProduct || product,
              quantity: item.quantity
            };
          }).filter(item => item.product.id);
          
          dispatch({ type: "SET_CART", payload: { items: cartItems } });
        } else {
          // If no items in database but items in local storage, sync local to remote
          if (state.items.length > 0) {
            syncCartToSupabase(state.items);
          } else {
            dispatch({ type: "SET_LOADING", payload: false });
          }
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    if (authState.isAuthenticated && !state.isLoading) {
      fetchCartItems();
    } else if (!authState.isAuthenticated) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && !state.isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }));
    }
  }, [state.items, state.totalItems, state.totalPrice, state.isLoading]);

  // Sync cart items to Supabase
  const syncCartToSupabase = async (items: CartItem[]) => {
    if (!authState.isAuthenticated || !authState.user) return;
    
    try {
      // First, delete all existing cart items for this user
      await supabase
        .from('user_cart_items')
        .delete()
        .eq('user_id', authState.user.id);
      
      // Then, insert new cart items
      if (items.length > 0) {
        const cartItemsToInsert = items.map(item => ({
          user_id: authState.user!.id,
          product_id: item.product.id,
          quantity: item.quantity
        }));
        
        const { error } = await supabase
          .from('user_cart_items')
          .insert(cartItemsToInsert);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error syncing cart to Supabase:", error);
      toast.error("Failed to save your cart. Please try again.");
    }
  };

  // Operations that modify the cart
  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
    
    // If user is authenticated, sync cart to Supabase
    if (authState.isAuthenticated && authState.user) {
      // We need to create a new array with the updated items
      const updatedItems = [...state.items];
      const existingItemIndex = updatedItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
      } else {
        updatedItems.push({ product, quantity });
      }
      
      syncCartToSupabase(updatedItems);
    }
    
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
    
    // If user is authenticated, sync cart to Supabase
    if (authState.isAuthenticated && authState.user) {
      const updatedItems = state.items.filter(item => item.product.id !== productId);
      syncCartToSupabase(updatedItems);
    }
    
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    
    // If user is authenticated, sync cart to Supabase
    if (authState.isAuthenticated && authState.user) {
      let updatedItems: CartItem[];
      
      if (quantity <= 0) {
        updatedItems = state.items.filter(item => item.product.id !== productId);
      } else {
        updatedItems = state.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      }
      
      syncCartToSupabase(updatedItems);
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    
    // If user is authenticated, clear cart in Supabase
    if (authState.isAuthenticated && authState.user) {
      syncCartToSupabase([]);
    }
    
    toast.info("Cart cleared");
  };

  // Make products available globally for easier access
  useEffect(() => {
    // Make products available globally for easier cart synchronization
    if (typeof window !== "undefined") {
      import("@/lib/data").then(({ products }) => {
        window.products = products;
      });
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
