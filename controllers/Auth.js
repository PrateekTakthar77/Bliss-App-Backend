const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const { generateJwtToken } = require("../helpers/JWT.Verify");
const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const sgMail = require("@sendgrid/mail");
const {
  emailMessageGenerator,
} = require("../helpers/Email/EmailMessageGenrator");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { generateOTP } = require("../helpers/OTP.verify");
const { TransactionalEmailsApi } = SibApiV3Sdk;
const { ApiClient } = SibApiV3Sdk;

//mail api setup
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
console.log(process.env.SEND_GRID_API_KEY);

const registerUserSchema = Joi.object({
  name: Joi.string().required(),
  mobile: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { error } = registerUserSchema.validate(req.body);

    if (error) {
      console.error(error);
      return res.status(400).json({
        payload: null,
        message:
          error.details[0].message || "An error occurred during validation",
      });
    }

    const { name, mobile, email, password, role } = req.body;
    const userExist = await User.findOne({ mobile });
    const emailExist = await User.findOne({ email });

    if (role === "Admin" || role === "admin") {
      return res.status(401).json({
        payload: null,
        message: "Admin Role is not allowed to register",
      });
    }

    if (userExist || emailExist) {
      return res.status(409).json({
        payload: null,
        message: "Looks like you already have an account with us.",
      });
    }

    const otp = generateOTP(6); // Generate a 6-digit OTP

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      mobile,
      email,
      otp,
      password: hashedPassword,
      role,
    });

    // Send the OTP to the user's email address
    // sendOTPEmail(email, otp);

    const payload = {
      name: newUser.name,
      email: newUser.email,
      _id: newUser.id,
    };
    const token = generateJwtToken(payload);
    return res.status(201).json({
      message: "User created successfully",
      payload,
      userId: newUser.id,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      payload: null,
      message: error.message || "An error occurred",
    });
  }
});

// Function to send OTP email
// async function sendOTPEmail(email, otp) {
//   try {
//     const msg = emailMessageGenerator(email, otp);
//     await sgMail.send(msg);
//     console.log("OTP email sent successfully to:", email, otp);
//   } catch (error) {
//     console.error("Error sending OTP email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// }

const loginSchema = Joi.object({
  email: Joi.string().email(),
  mobile: Joi.number(),
  password: Joi.string().required(),
});

const logInUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message:
          error.details[0].message || "An error occurred during validation",
        payload: null,
      });
    }

    const { mobile, password, email } = req.body;

    if (!mobile && !email) {
      return res.status(400).json({ message: "mobile or email is required" });
    }

    const user = await User.findOne({ $or: [{ mobile }, { email }] });

    if (!user) {
      return res.status(401).json({
        message: "Invalid mobile or Email",
        email,
        mobile,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isEmailVerified = user.isEmailVerified;

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid mobile or Email or password or not a user",
        email,
        mobile,
        password,
      });
    }
    // if (!isEmailVerified) {
    //   return res.status(401).json({ message: "Email not verified" });
    // }
    const payload = {
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      _id: user.id,
    };

    const token = generateJwtToken(payload);

    res
      .status(200)
      .json({ message: "Login G", token, User: payload, payload: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "An error occurred" });
  }
};

//special login for only admin

const adminLogin = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { mobile, password, email } = req.body;

    const user = await User.findOne({ $or: [{ mobile }, { email }] });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid mobile or password or not a Admin" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isEmailVerified = user.isEmailVerified;

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid mobile or password or not a user" });
    }
    // if (!isEmailVerified) {
    //   return res.status(401).json({ message: "Email not verified" });
    // }
    if (user.role !== "Admin") {
      return res.status(401).json({ message: "You are not an admin" });
    }
    const payload = {
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      _id: user.id,
    };

    const token = generateJwtToken(payload);

    res.status(200).json({ message: "Login G", token, User: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "An error occurred" });
  }
};

//creating a verify user email using otp
const verifyUserEmailUsingOtp = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    if (!otp || !userId) {
      return res.status(400).json({ message: "otp or userId is missing" });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.otp !== otp) {
      res.status(400).json({ message: "otp is not valid" });
    }

    if (user.otp === otp) {
      user.isEmailVerified = true;

      await user.save();

      const payload = {
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        _id: user.id,
      };

      res.status(200).json({
        message: "email verified successfully",
        payload,
        token: generateJwtToken(payload),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "An error occurred" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: " userId is missing" });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const isEmailVerified = user.isEmailVerified;

    if (isEmailVerified) {
      return res.status(400).json({ message: "email already verified" });
    }

    const otp = generateOTP(6); // Generate a 6-digit OTP
    async function sendOTPEmail(email, otp) {
      const msg2 = emailMessageGenerator(email, otp, user.name);
      sgMail
        .send(msg2)
        .then(() => console.log("OTP email sent", otp, "to:", email))
        .catch((error) => console.error("Error sending OTP email:", error));
    }

    sendOTPEmail(user.email, otp); // Send OTP to the user's email address

    user.otp = otp;
    await user.save();

    res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "An error occurred" });
  }
};

module.exports = {
  registerUser,
  logInUser,
  verifyUserEmailUsingOtp,
  resendOtp,
  adminLogin,
};
