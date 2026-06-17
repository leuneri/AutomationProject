import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";
import ProductsPage   from "./pages/ProductsPage";
import ProductPage    from "./pages/ProductPage";
import CartPage       from "./pages/CartPage";
import CheckoutPage   from "./pages/CheckoutPage";
import OrdersPage     from "./pages/OrdersPage";
import OrderPage      from "./pages/OrderPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart"     element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/orders"   element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
