const User = require("../models/User.model");
const { generateJwtToken } = require("../helpers/JWT.Verify");
const { sendEmail } = require("../utils/sendEmail");

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({
        message: "User Not Found"
    })
    try {
        const resetTokken = await user.generateJwtToken()
        await user.save();
        await sendEmail(user.email, `If you were requested to reset your password, reset now within 10 minutes, otherwise ignore this message <a href="http://localhost:3000/resetpassword/${token}">Click to Reset</a>`)
        // const 

    } catch (error) {
        res.json(error)
    }
    res.status(200).json({
        message: "User created successfully",
    })

}

module.exports = {
    forgotPassword
}