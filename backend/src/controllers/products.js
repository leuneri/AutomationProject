const db = require("../config/db");

async function list(req, res, next) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = "WHERE 1=1";

    if (category) { params.push(category); where += ` AND category=$${params.length}`; }
    if (search)   { params.push(`%${search}%`); where += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`; }

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM products ${where}`,
      params.slice(0, -2)
    );
    res.json({ products: rows, total: Number(count), page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  const { name, description, price, stock, image_url, category } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO products (name,description,price,stock,image_url,category) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, description, price, stock, image_url, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  const { name, description, price, stock, image_url, category } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE products SET name=$1,description=$2,price=$3,stock=$4,image_url=$5,category=$6
       WHERE id=$7 RETURNING *`,
      [name, description, price, stock, image_url, category, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update };
