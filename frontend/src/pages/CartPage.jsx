import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, loading, total, updateItem, removeItem } = useCart();
  const nav = useNavigate();

  if (loading) return <p className="center">Loading…</p>;

  if (items.length === 0) return (
    <div className="center">
      <p style={{ marginBottom: "1rem" }}>Your cart is empty.</p>
      <Link to="/products" className="btn btn-primary">Browse catalog</Link>
    </div>
  );

  return (
    <>
      <h1 style={{ marginBottom: "1.5rem" }}>Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th></th>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td><img src={item.image_url} alt={item.name} /></td>
              <td><Link to={`/products/${item.product_id}`}>{item.name}</Link></td>
              <td>€{Number(item.price).toFixed(2)}</td>
              <td>
                <input type="number" min={1} max={item.stock} value={item.quantity}
                  style={{ width: 56, padding: ".3rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
                  onChange={e => updateItem(item.product_id, Number(e.target.value))} />
              </td>
              <td>€{(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-footer">
        <span className="cart-total">Total: €{total.toFixed(2)}</span>
        <button className="btn btn-primary" onClick={() => nav("/checkout")}>Proceed to checkout</button>
      </div>
    </>
  );
}
