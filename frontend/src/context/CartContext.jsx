import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try { setItems(await api.getCart()); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function addItem(product_id, quantity = 1) {
    const existing = items.find(i => i.product_id === product_id);
    await api.upsertCartItem({ product_id, quantity: existing ? existing.quantity + quantity : quantity });
    fetchCart();
  }

  async function updateItem(product_id, quantity) {
    await api.upsertCartItem({ product_id, quantity });
    fetchCart();
  }

  async function removeItem(id) {
    await api.removeCartItem(id);
    fetchCart();
  }

  async function clear() {
    await api.clearCart();
    setItems([]);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, total, count, addItem, updateItem, removeItem, clear, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
