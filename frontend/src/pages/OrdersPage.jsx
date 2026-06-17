import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center">Loading…</p>;

  if (orders.length === 0) return (
    <div className="center">
      <p style={{ marginBottom: "1rem" }}>No orders yet.</p>
      <Link to="/products" className="btn btn-primary">Start shopping</Link>
    </div>
  );

  return (
    <>
      <h1 style={{ marginBottom: "1.5rem" }}>Orders</h1>
      <div className="orders-list">
        {orders.map(order => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <span className="order-id">#{order.id.slice(0, 8)}</span>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>
            <p className="order-meta">
              {new Date(order.created_at).toLocaleDateString()} · €{Number(order.total).toFixed(2)} · {order.items?.length} item(s)
            </p>
            <div style={{ marginTop: ".75rem" }}>
              <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View details</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
