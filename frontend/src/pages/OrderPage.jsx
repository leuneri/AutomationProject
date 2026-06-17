import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="center">Loading…</p>;
  if (!order)  return <p className="center">Order not found.</p>;

  const addr = order.address;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <h1>Order #{order.id.slice(0, 8)}</h1>
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        <div>
          <h3 style={{ marginBottom: ".75rem" }}>Items</h3>
          <div className="order-items-list">
            {order.items?.map((item, i) => (
              <div className="order-item-row" key={i}>
                <span>{item.name} × {item.quantity}</span>
                <span>€{(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-item-row" style={{ fontWeight: 700 }}>
              <span>Total</span>
              <span>€{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3>Shipping address</h3>
          <p style={{ marginTop: ".75rem", lineHeight: 1.8 }}>
            {addr.name}<br />
            {addr.street}<br />
            {addr.zip} {addr.city}<br />
            {addr.country}
          </p>
          <p style={{ marginTop: ".75rem", fontSize: ".82rem", color: "var(--muted)" }}>
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link to="/orders">← Back to orders</Link>
      </div>
    </>
  );
}
