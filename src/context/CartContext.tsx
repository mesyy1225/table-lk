import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { Product, products as staticProducts } from "@/lib/data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const MAX_ITEM_QUANTITY = 20;

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; color?: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: Product["id"]; color?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: Product["id"]; quantity: number; color?: string } }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: { items: CartItem[] } }
  | { type: "SET_LOADING"; payload: boolean };

interface CartContextProps {
  state: CartState;
  addToCart: (product: Product, quantity: number, color?: string) => void;
  removeFromCart: (productId: Product["id"], color?: string) => void;
  updateQuantity: (productId: Product["id"], quantity: number, color?: string) => void;
  clearCart: (options?: { silent?: boolean }) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const clampQty = (q: number) => Math.max(1, Math.min(MAX_ITEM_QUANTITY, Math.floor(q) || 1));

/** Two cart lines are the same when product id and colour match. */
const sameLine = (item: CartItem, productId: Product["id"], color?: string) =>
  String(item.product.id) === String(productId) && (item.color || "") === (color || "");

const calculateCartTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } =>
  items.reduce(
    (totals, item) => ({
      totalItems: totals.totalItems + item.quantity,
      totalPrice: totals.totalPrice + (Number(item.product.price) || 0) * item.quantity,
    }),
    { totalItems: 0, totalPrice: 0 }
  );

const withTotals = (state: CartState, items: CartItem[]): CartState => ({
  ...state,
  items,
  ...calculateCartTotals(items),
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, color } = action.payload;
      const exists = state.items.some((item) => sameLine(item, product.id, color));
      const items = exists
        ? state.items.map((item) =>
            sameLine(item, product.id, color)
              ? { ...item, product, quantity: clampQty(item.quantity + quantity) }
              : item
          )
        : [...state.items, { product, quantity: clampQty(quantity), color }];
      return withTotals(state, items);
    }
    case "REMOVE_ITEM": {
      const { productId, color } = action.payload;
      return withTotals(state, state.items.filter((item) => !sameLine(item, productId, color)));
    }
    case "UPDATE_QUANTITY": {
      const { productId, quantity, color } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { productId, color } });
      }
      return withTotals(
        state,
        state.items.map((item) =>
          sameLine(item, productId, color) ? { ...item, quantity: clampQty(quantity) } : item
        )
      );
    }
    case "CLEAR_CART":
      return withTotals(state, []);
    case "SET_CART":
      return { ...withTotals(state, action.payload.items), isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const CART_STORAGE_KEY = "woodcraft_cart";

const readStoredItems = (): CartItem[] => {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items: unknown = parsed?.items;
    if (!Array.isArray(items)) return [];
    return items
      .filter((i: any) => i && i.product && i.product.id != null && Number(i.quantity) > 0)
      .map((i: any) => ({
        product: i.product as Product,
        quantity: clampQty(Number(i.quantity)),
        color: typeof i.color === "string" && i.color ? i.color : undefined,
      }));
  } catch (error) {
    console.error("Failed to read cart from localStorage:", error);
    return [];
  }
};

const writeStoredItems = (state: CartState) => {
  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items: state.items, totalItems: state.totalItems, totalPrice: state.totalPrice })
    );
  } catch (error) {
    // Private mode / storage full: the cart still works for this visit.
    console.warn("Could not save cart to localStorage:", error);
  }
};

// Minimal mapping for products fetched while restoring a server cart.
const mapProductRow = (r: any): Product => {
  const images: string[] = (r.images && r.images.length ? r.images : [r.image_url]).filter(Boolean);
  return {
    id: r.id,
    name: r.name ?? "Product",
    description: r.description ?? "",
    shortDescription: r.short_description ?? "",
    price: Number(r.price) || 0,
    images: images.length ? images : ["/placeholder.svg"],
    categories: r.categories?.length ? r.categories : r.category ? [r.category] : [],
    material: r.material ?? "",
    dimensions: {
      width: Number(r.dimensions?.width) || 0,
      length: Number(r.dimensions?.length) || 0,
      height: Number(r.dimensions?.height) || 0,
    },
    inStock: (r.stock ?? 0) > 0,
    featured: !!r.featured,
    rating: 5,
    reviews: [],
    colors: r.colors ?? [],
  };
};

/** Combine the server cart with the local (guest) cart. Same line => keep the larger quantity. */
const mergeCarts = (server: CartItem[], local: CartItem[]): CartItem[] => {
  const merged: CartItem[] = server.map((s) => ({ ...s }));
  for (const l of local) {
    const idx = merged.findIndex((m) => sameLine(m, l.product.id, l.color));
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], product: l.product, quantity: Math.max(merged[idx].quantity, l.quantity) };
    } else {
      merged.push(l);
    }
  }
  return merged;
};

const sameItems = (a: CartItem[], b: CartItem[]) =>
  a.length === b.length &&
  a.every((x) => b.some((y) => sameLine(y, x.product.id, x.color) && y.quantity === x.quantity));

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const userId = authState.user?.id ?? null;

  const [state, dispatch] = useReducer(cartReducer, undefined, () => {
    const items = readStoredItems();
    return { items, ...calculateCartTotals(items), isLoading: false };
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const loadedUserRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());

  // Replace the user's server cart with `items`. Calls are serialised so a delete of one
  // sync can't interleave with the insert of another.
  const syncCartToSupabase = (items: CartItem[], uid: string) => {
    syncChainRef.current = syncChainRef.current.then(async () => {
      try {
        const { error: delError } = await (supabase as any).from("user_cart_items").delete().eq("user_id", uid);
        if (delError) throw delError;
        if (items.length > 0) {
          const { error } = await (supabase as any).from("user_cart_items").insert(
            items.map((item) => ({ user_id: uid, product_id: String(item.product.id), quantity: item.quantity }))
          );
          if (error) throw error;
        }
      } catch (error) {
        // The cart is still kept on this device; don't block shopping.
        console.error("Error syncing cart to Supabase:", error);
      }
    });
  };

  // Login / logout handling.
  useEffect(() => {
    if (!userId) {
      if (loadedUserRef.current) {
        // Explicit logout: the cart stays on the account; start a fresh guest cart.
        loadedUserRef.current = null;
        dispatch({ type: "SET_CART", payload: { items: [] } });
      }
      return;
    }
    if (loadedUserRef.current === userId) return;
    loadedUserRef.current = userId;

    let cancelled = false;
    (async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const { data, error } = await (supabase as any)
          .from("user_cart_items")
          .select("product_id, quantity")
          .eq("user_id", userId);
        if (error) throw error;

        const localItems = stateRef.current.items;
        const rows: { product_id: string; quantity: number }[] = data || [];

        // Resolve product details: local cart first, then the loaded product list, then the DB.
        const known = new Map<string, Product>();
        localItems.forEach((i) => known.set(String(i.product.id), i.product));
        (window.products || []).forEach((p) => !known.has(String(p.id)) && known.set(String(p.id), p));
        staticProducts.forEach((p) => !known.has(String(p.id)) && known.set(String(p.id), p));
        const missing = rows.map((r) => String(r.product_id)).filter((id) => !known.has(id) && !/^\d+$/.test(id));
        if (missing.length) {
          const { data: prods } = await (supabase as any).from("products").select("*").in("id", missing);
          (prods || []).forEach((r: any) => known.set(String(r.id), mapProductRow(r)));
        }

        // Server rows have no colour column; reuse the colour of a matching local line when possible.
        const usedLocal = new Set<CartItem>();
        const serverItems: CartItem[] = [];
        for (const r of rows) {
          const product = known.get(String(r.product_id));
          if (!product) continue;
          const localMatch = localItems.find(
            (l) => !usedLocal.has(l) && String(l.product.id) === String(r.product_id)
          );
          if (localMatch) usedLocal.add(localMatch);
          const color = localMatch?.color ?? product.colors?.[0];
          const existing = serverItems.find((s) => sameLine(s, product.id, color));
          if (existing) existing.quantity = clampQty(existing.quantity + Number(r.quantity));
          else serverItems.push({ product, quantity: clampQty(Number(r.quantity)), color });
        }

        if (cancelled) return;
        const merged = mergeCarts(serverItems, localItems);
        dispatch({ type: "SET_CART", payload: { items: merged } });
        if (!sameItems(merged, serverItems)) syncCartToSupabase(merged, userId);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        if (!cancelled) dispatch({ type: "SET_LOADING", payload: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist to localStorage (everyone) and push user edits to the server (logged-in users).
  useEffect(() => {
    if (state.isLoading) return;
    writeStoredItems(state);
    if (dirtyRef.current) {
      dirtyRef.current = false;
      if (userId && loadedUserRef.current === userId) syncCartToSupabase(state.items, userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items, state.isLoading]);

  const addToCart = (product: Product, quantity: number, color?: string) => {
    const chosen = color ?? product.colors?.[0];
    dirtyRef.current = true;
    dispatch({ type: "ADD_ITEM", payload: { product, quantity, color: chosen } });
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: Product["id"], color?: string) => {
    dirtyRef.current = true;
    dispatch({ type: "REMOVE_ITEM", payload: { productId, color } });
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: Product["id"], quantity: number, color?: string) => {
    dirtyRef.current = true;
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, color } });
  };

  const clearCart = (options?: { silent?: boolean }) => {
    dirtyRef.current = true;
    dispatch({ type: "CLEAR_CART" });
    if (!options?.silent) toast.info("Cart cleared");
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
