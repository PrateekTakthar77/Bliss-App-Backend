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
const { user } = require("firebase-functions/v1/auth");
const { log } = require("firebase-functions/logger");
const { TransactionalEmailsApi } = SibApiV3Sdk;
const { ApiClient } = SibApiV3Sdk;
const nodemailer = require("nodemailer")
require("dotenv").config();

//mail api setup
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
console.log(process.env.SEND_GRID_API_KEY);

const registerUserSchema = Joi.object({
  name: Joi.string().required(),
  mobile: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  count: Joi.number()
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
    const userExistsWithMobile = await User.findOne({ mobile });
    const userExistsWithEmail = await User.findOne({ email });

    // to restricy creating a new admin uncomment down the bottom code
    // if (role === "Admin" || role === "admin") {
    //   return res.status(401).json({
    //     payload: null,
    //     message: "Admin Role is not allowed to register",
    //   });
    // }

    if (userExistsWithEmail) {
      return res.status(409).json({
        payload: null,
        message: "Looks like your Email already Exists.",
      });
    }

    if (userExistsWithMobile) {
      return res.status(407).json({
        payload: null,
        message: "Looks like your mobile already Exists.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'Jewellery Bliss',
        address: process.env.USER
      }, // sender address
      to: email, // list of receivers
      subject: "Thank You for Registering on Jewellery Bliss!",
      text:
        `Dear ${name},<br>
        We are delighted to welcome you to the Jewellery Bliss community! Thank you for taking the first step towards an enhanced experience.<br>
        <br>
         We want you to know how much we appreciate your trust in us. Your registration means a lot, and we're excited to have you as part of our app family.<br>
        With Jewellery Bliss, you unlock a world of possibilities. Whether it's exploring exciting features, accessing exclusive content, or staying connected with like-minded individuals, you're in for a treat.<br><br>
        
        If you have any questions or need assistance as you navigate through the app, please don't hesitate to reach out to our dedicated support team . We're here to ensure your experience with us is smooth and enjoyable<br><br>
        Thank you once again for choosing Jewellery Bliss. We look forward to providing you with an exceptional and tailored experience.<br>
        Best regards,<br>
        <br>
        Jewellery Bliss<br>`,
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions)
        console.log("Mail Sent succesfully")
      } catch (error) {
        console.log(error);
      }
    }

    sendMail(transporter, mailOptions)
    const otp = generateOTP(6); // Generate a 6-digit OTP
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      mobile,
      email,
      otp,
      password: hashedPassword,
      role,
      userCount: ((await User.find({}))?.length ?? 0) + 1,
    });

    const payload = {
      name: newUser.name,
      email: newUser.email,
      _id: newUser.id,
      userCount: newUser.userCount,
      mobile: newUser.mobile
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

// forgot pass 
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    // console.log("Finding user by email:", user);
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({
        message: `User Not Found with ${email}`
      });
    }
    // mail function
    const resetToken = generateJwtToken({ name: user.name, email: user.email, _id: user.id, userCount: user.userCount, mobile: user.mobile }); // Implement this function
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000; // Token expires in 60 minutes
    await user.save();
    const resetLink = `http://localhost:5009/resetpassword/${resetToken}`;
    const emailContent = `If you requested to reset your password, reset now within 60 minutes. Otherwise, ignore this message. <a href="${resetLink}">Click to Reset</a>`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'Jewellery Bliss',
        address: process.env.USER
      }, // sender address
      to: email, // list of receivers
      subject: "Password Reset Request", // Subject line
      text: `${emailContent}`, // plain text body
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions)
        console.log("Mail Sent succesfully")
      } catch (error) {
        console.log(error);
      }
    }

    sendMail(transporter, mailOptions)
    // 

    await user.save();
    res.status(200).json({
      success: true,
      message: `Password Change Request Email sent to ${user.email}`,
    })
  } catch (error) {
    res.json(error)
  }

}

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: {
        $gt: Date.now(),
      },
    })
    if (!user) {
      res.status(400).json({
        status: 400,
        message: "user not found"
      })
    }
    const newPassword = req.body.password; // Get the new password from the request
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
    user.password = hashedPassword; // Set the hashed password to the user object
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Changed sucessfully",
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

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
      userCount: user.userCount
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
  forgotPassword,
  resetPassword,
};
