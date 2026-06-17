import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const nav              = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/products" className="logo">🛒 Shop</Link>
          <nav className="header-nav">
            <Link to="/products">Catalog</Link>
            {user && (
              <>
                <Link to="/cart">
                  Cart{count > 0 && <span className="badge">{count}</span>}
                </Link>
                <Link to="/orders">Orders</Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
