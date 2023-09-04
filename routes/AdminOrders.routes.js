const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminControllers");
const { authorizeUser, accessAuth } = require("../middlewares/AccessAuth");
const {
  getAllSalespersons,
  registerSalesperson,
  getSalespersonById,
  updateSalesperson,
} = require("../controllers/admin/salesPersonAuth");
const {
  createGramPrice,
  createCoinPrice,
  getLastCoinPrice,
  getLastGramPrice,
  getAllGramPrices,
  getAllCoinPrices,
  calculateTabledata
} = require("../controllers/admin/CoinManagement");

router.get(
  "/orders",
  accessAuth,
  authorizeUser(["Admin"]),
  adminController.getAllOrders
);
router.get("/orders/:id", adminController.getOrderById);
router.get(
  "/users",
  accessAuth,
  authorizeUser(["Admin"]),
  adminController.getNewUsers
);
router.delete(
  "/orders/:id",
  accessAuth,
  authorizeUser(["Admin"]),
  adminController.cancelOrder
);
// API endpoint to calculate the total order value
router.post(
  "/orders/calculate-total",
  accessAuth,
  authorizeUser(["Admin"]),
  adminController.calculateTotalValue
);

router.get("/salesperson/:id", getSalespersonById);
router.get("/all-salespersons", getAllSalespersons);
router.post(
  "/register-salesperson",
  accessAuth,
  authorizeUser(["Admin", "Dealer"]),
  registerSalesperson
);

//updateSalesperson
router.put("/salesperson/:id", updateSalesperson);

//add gram price
router.post("/gram-price", createGramPrice);  // working and tested
//add coin price
router.post("/coin-price", createCoinPrice);  // working and tested
//get last gram price
router.get("/last-gram-price", getLastGramPrice);    // working and tested
//get last coin price
router.get("/last-coin-price", getLastCoinPrice);   // working and tested
//get all gram prices
router.get("/all-gram-prices", getAllGramPrices); // working and tested
//get all coin prices
router.get("/all-coin-prices", getAllCoinPrices);  // working and tested

router.get("/table", calculateTabledata);

module.exports = router;
