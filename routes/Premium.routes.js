const express = require("express");
const { accessAuth, authorizeUser } = require("../middlewares/AccessAuth");
const Premium = require("../controllers/premium.controller");
const router = express.Router();

router.post("/add", Premium.createPremium);
router.get("/", Premium.getAll);
router.put("/update/:id", Premium.getSingleByIdUpdate)
module.exports = router;