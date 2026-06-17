import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductPage() {
  const { id }     = useParams();
  const { user }   = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const [msg, setMsg]         = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProduct(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    try {
      await addItem(product.id, qty);
      setMsg("Added to cart!");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (loading) return <p className="center">Loading…</p>;
  if (!product) return <p className="center">Product not found.</p>;

  return (
    <div className="product-detail">
      <img src={product.image_url} alt={product.name} />
      <div>
        <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{product.category}</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <div className="price">€{Number(product.price).toFixed(2)}</div>
        <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        {msg && <div className="alert alert-success">{msg}</div>}
        {user && product.stock > 0 && (
          <div className="qty-row">
            <label>Qty</label>
            <input type="number" min={1} max={product.stock} value={qty}
              onChange={e => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))} />
            <button className="btn btn-primary" onClick={handleAdd}>Add to cart</button>
          </div>
        )}
        {!user && <Link to="/login" className="btn btn-ghost">Sign in to buy</Link>}
        <div style={{ marginTop: "1.5rem" }}>
          <Link to="/products">← Back to catalog</Link>
        </div>
      </div>
    </div>
  );
}
