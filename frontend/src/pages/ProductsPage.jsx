import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["All", "Electronics", "Home", "Stationery", "Sports", "Kitchen"];

export default function ProductsPage() {
  const { user }   = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState({});

  const limit = 12;
  const pages = Math.ceil(total / limit);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (search)   params.search   = search;
    if (category) params.category = category;
    api.getProducts(params)
      .then(d => { setProducts(d.products); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [page, search, category]);

  async function handleAdd(productId) {
    if (!user) return;
    setAdding(a => ({ ...a, [productId]: true }));
    try { await addItem(productId, 1); }
    finally { setAdding(a => ({ ...a, [productId]: false })); }
  }

  return (
    <>
      <div className="products-header">
        <h1>Catalog</h1>
        <input className="search-input" placeholder="Search…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select value={category} onChange={e => { setCategory(e.target.value === "All" ? "" : e.target.value); setPage(1); }}
          style={{ padding: ".45rem .75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <p className="center">Loading…</p> : (
        <>
          <div className="products-grid">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <Link to={`/products/${p.id}`}>
                  <img src={p.image_url} alt={p.name} />
                </Link>
                <div className="product-info">
                  <div className="product-name">
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </div>
                  <div className="product-price">€{Number(p.price).toFixed(2)}</div>
                  <div className="product-stock">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div>
                  {user ? (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => handleAdd(p.id)}
                      disabled={p.stock === 0 || adding[p.id]}>
                      {adding[p.id] ? "Adding…" : "Add to cart"}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-ghost btn-sm">Sign in to buy</Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`btn ${n === page ? "btn-primary" : "btn-ghost"} btn-sm`}
                  onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
