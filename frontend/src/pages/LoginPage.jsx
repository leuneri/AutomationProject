import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      nav("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <h2>Sign in</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="form-footer">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
