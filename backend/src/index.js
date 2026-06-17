const express = require("express");
const cors = require("cors");
const client = require("prom-client");

const authRoutes    = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes    = require("./routes/cart");
const orderRoutes   = require("./routes/orders");

const app = express();

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on("finish", () =>
    end({ method: req.method, route: req.path, status: res.statusCode })
  );
  next();
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal error" });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
}

module.exports = app;
