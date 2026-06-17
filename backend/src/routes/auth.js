const router = require("express").Router();
const { register, registerValidation, login, loginValidation, me } = require("../controllers/auth");
const { authenticate } = require("../middleware/auth");

router.post("/register", registerValidation, register);
router.post("/login",    loginValidation,    login);
router.get("/me",        authenticate,       me);

module.exports = router;
