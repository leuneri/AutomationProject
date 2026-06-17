import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      nav("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      <h2>Create account</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input type="text" required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="field">
          <label>Password (min 6 characters)</label>
          <input type="password" required minLength={6} value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="form-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
