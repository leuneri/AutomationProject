const router = require("express").Router();
const { list, getById, create, update } = require("../controllers/products");
const { authenticate, requireAdmin }    = require("../middleware/auth");

router.get("/",         list);
router.get("/:id",      getById);
router.post("/",        authenticate, requireAdmin, create);
router.put("/:id",      authenticate, requireAdmin, update);

module.exports = router;
