const mongoose = require("mongoose")

const premium = new mongoose.Schema({
    premiumcharges: {
        type: Number
    }
})

const Premiumcharge = mongoose.model("premium", premium)
module.exports = Premiumcharge