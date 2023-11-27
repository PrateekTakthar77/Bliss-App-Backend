// if (process.env.NODE_ENV === "dev") {
const dotenv = require("dotenv");
dotenv.config();

//
console.log(process.env.NODE_ENV);
const cors = require("cors");
const express = require("express");
const mongoConnect = require("./helpers/db");
const authRouter = require("./routes/Auth.routes");
const userDetailsRouter = require("./routes/UserDetails.routes");
const errorHandler = require("./middlewares/errorHandler");
const productRouter = require("./routes/Products.routes");
const errorReqRouter = require("./middlewares/errorRouteHandler");
const cartRouter = require("./routes/Cart.routes");
const orderRoutes = require("./routes/Order.routes");
const adminRouter = require("./routes/AdminOrders.routes");
const makingCharges = require("./routes/makingcharges.routes");
const Bookings = require("./routes/bookings.routes");
const customorder = require("./routes/Customorder.routes");
const Premium = require("./routes/Premium.routes");
// const userRouter = require("./routes/user.routes")
const { authorizeUser } = require("./middlewares/AccessAuth");


const { Product } = require('./models/Product')

//Connecting MongoDB
mongoConnect();
const app = express();
// parse REQ data
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//cors
app.use(cors());

let count = 0;
app.get("/", (req, res) => {
  res.send(`Welcome To Jwell Bliss Server managed by Prateek Takthar ${count++}`);
});

// app.get('/products/', async (req, res, next) => {


//   let products = await Product.findById('64941d38825d2793151c9478').exec()
//   return res.json(products)
// })
app.use(
  "/api/auth",
  (res, req, next) => {
    count++;
    next();
  },
  authRouter
);
app.use(
  "/api/user-details",
  (res, req, next) => {
    count++;
    next();
  },
  userDetailsRouter
);
app.use(
  "/api/products",
  (req, res, next) => {
    count++;
    next();
  },
  productRouter
);

app.use('/api/premium', Premium)

app.use('/api/customorders', customorder)

app.use('/api/bookings', Bookings)

app.use('/api/makingcharges', makingCharges)

app.use("/api/carts", cartRouter);

app.use("/api/checkouts", orderRoutes);

app.use("/api/admin", adminRouter);

// app.use("/api/user", userRouter)

//error handler -----
app.use(
  "/",
  (res, req, next) => {
    count++;
    next();
  },
  errorReqRouter
);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server Started on port: ", PORT);
});
