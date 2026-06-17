const BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Auth
  register:       (d) => request("POST", "/auth/register", d),
  login:          (d) => request("POST", "/auth/login", d),
  me:             ()  => request("GET",  "/auth/me"),

  // Products
  getProducts:    (q) => request("GET",  `/products?${new URLSearchParams(q)}`),
  getProduct:     (id)=> request("GET",  `/products/${id}`),

  // Cart
  getCart:        ()  => request("GET",  "/cart"),
  upsertCartItem: (d) => request("PUT",  "/cart", d),
  removeCartItem: (id)=> request("DELETE",`/cart/${id}`),
  clearCart:      ()  => request("DELETE","/cart"),

  // Orders
  createOrder:    (d) => request("POST", "/orders", d),
  getOrders:      ()  => request("GET",  "/orders"),
  getOrder:       (id)=> request("GET",  `/orders/${id}`),
};
