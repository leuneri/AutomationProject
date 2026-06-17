const router = require("express").Router();
const { createOrder, listOrders, getOrder } = require("../controllers/orders");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.post("/",      createOrder);
router.get("/",       listOrders);
router.get("/:id",    getOrder);

module.exports = router;
