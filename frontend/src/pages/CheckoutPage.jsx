import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", street: "", city: "", zip: "", country: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const order = await api.createOrder({ address: form });
      clear();
      nav(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) return <p className="center">Nothing to check out.</p>;

  return (
    <>
      <h1 style={{ marginBottom: "1.5rem" }}>Checkout</h1>
      <div className="checkout-grid">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <h3 style={{ marginBottom: "1rem" }}>Shipping address</h3>
          {[
            ["name",    "Full name"],
            ["street",  "Street address"],
            ["city",    "City"],
            ["zip",     "ZIP / Postcode"],
            ["country", "Country"],
          ].map(([k, label]) => (
            <div className="field" key={k}>
              <label>{label}</label>
              <input required value={form[k]} onChange={set(k)} />
            </div>
          ))}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Placing order…" : "Place order"}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order summary</h3>
          {items.map(i => (
            <div className="summary-row" key={i.id}>
              <span>{i.name} × {i.quantity}</span>
              <span>€{(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
