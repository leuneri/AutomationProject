const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://shop:shoppass@localhost:5432/shopdb",
  max: 10,
});

module.exports = pool;
