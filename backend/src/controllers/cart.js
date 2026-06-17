const db = require("../config/db");

async function getCart(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci JOIN products p ON p.id=ci.product_id
       WHERE ci.user_id=$1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function upsertItem(req, res, next) {
  const { product_id, quantity } = req.body;
  if (!product_id || !Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({ error: "product_id and positive quantity required" });

  try {
    // Check stock
    const { rows: [product] } = await db.query(
      "SELECT stock FROM products WHERE id=$1", [product_id]
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(409).json({ error: "Insufficient stock" });

    const { rows } = await db.query(
      `INSERT INTO cart_items (user_id,product_id,quantity) VALUES ($1,$2,$3)
       ON CONFLICT (user_id,product_id) DO UPDATE SET quantity=EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    await db.query(
      "DELETE FROM cart_items WHERE user_id=$1 AND id=$2",
      [req.user.id, req.params.id]
    );
    res.status(204).end();
  } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try {
    await db.query("DELETE FROM cart_items WHERE user_id=$1", [req.user.id]);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { getCart, upsertItem, removeItem, clearCart };
