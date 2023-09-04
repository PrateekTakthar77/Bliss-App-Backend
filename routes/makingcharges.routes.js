const express = require("express");
const { accessAuth, authorizeUser } = require("../middlewares/AccessAuth");
// const { addMakingCharges, getAllMakingCharges } = require("../controllers/Products");
const mChargeController = require('../controllers/makingcharges')
const router = express.Router();

router.post('/add', mChargeController.createMakingCharge)
router.get('/', mChargeController.getAll)
router.put('/update/:id', mChargeController.getSingleByIdUpdate)
module.exports = router;