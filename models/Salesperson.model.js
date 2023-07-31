const { default: mongoose } = require("mongoose");

const SalespersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  alternativeNo: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  aadharCardNo: {
    type: String,
    required: true,
  },
  aadharCardImage: {
    type: String,
  },
  panCardNo: {
    type: String,
  },
  panCardImage: {
    type: String,
  },
  role: {
    type: String,
    enum: ["Salesperson"],
    required: true,
  },
  commission: {
    type: Number,
    default: 0,
  },
  code: {
    type: String,
    unique: true,
  },
  dealers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  productsSold: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
      revenue: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate the salesperson code before saving
SalespersonSchema.pre("save", async function (next) {
  if (!this.code) {
    const lastSalesperson = await this.constructor.findOne(
      {},
      {},
      { sort: { code: -1 } }
    );

    const lastCode = lastSalesperson ? lastSalesperson.code : "JBS0000";
    console.log("lastCode", lastCode);
    const lastCount = parseInt(lastCode.slice(3), 10);

    const count = await this.constructor.countDocuments();
    const code = `JBS${String(Math.max(count + 1, lastCount + 1)).padStart(
      4,
      "0"
    )}`;
    console.log("code", code);
    this.code = code;
  }
  next();
});

const Salesperson = mongoose.model("Salesperson", SalespersonSchema);

module.exports = Salesperson;
