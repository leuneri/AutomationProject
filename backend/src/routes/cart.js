const router = require("express").Router();
const { getCart, upsertItem, removeItem, clearCart } = require("../controllers/cart");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/",           getCart);
router.put("/",           upsertItem);
router.delete("/",        clearCart);
router.delete("/:id",     removeItem);

module.exports = router;
