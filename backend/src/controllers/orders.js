const db = require("../config/db");

async function createOrder(req, res, next) {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Shipping address required" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Fetch cart
    const { rows: cartItems } = await client.query(
      `SELECT ci.quantity, p.id AS product_id, p.price, p.stock
       FROM cart_items ci JOIN products p ON p.id=ci.product_id
       WHERE ci.user_id=$1 FOR UPDATE`,
      [req.user.id]
    );
    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Check stock and compute total
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: `Insufficient stock for product ${item.product_id}` });
      }
    }
    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const { rows: [order] } = await client.query(
      "INSERT INTO orders (user_id,total,address) VALUES ($1,$2,$3) RETURNING *",
      [req.user.id, total, JSON.stringify(address)]
    );

    // Insert items and decrement stock
    for (const item of cartItems) {
      await client.query(
        "INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)",
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        "UPDATE products SET stock=stock-$1 WHERE id=$2",
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await client.query("DELETE FROM cart_items WHERE user_id=$1", [req.user.id]);

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

async function listOrders(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT o.*, json_agg(json_build_object(
         'product_id', oi.product_id, 'name', p.name,
         'quantity', oi.quantity, 'unit_price', oi.unit_price
       )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id=o.id
       JOIN products p ON p.id=oi.product_id
       WHERE o.user_id=$1
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT o.*, json_agg(json_build_object(
         'product_id', oi.product_id, 'name', p.name,
         'quantity', oi.quantity, 'unit_price', oi.unit_price,
         'image_url', p.image_url
       )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id=o.id
       JOIN products p ON p.id=oi.product_id
       WHERE o.id=$1 AND o.user_id=$2
       GROUP BY o.id`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Order not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { createOrder, listOrders, getOrder };
