const User = require("../models/User.model");
const UserDetails = require("../models/UserDetails.model");
const Joi = require("joi");

const userDetailsSchema = Joi.object({
  brandName: Joi.string().allow(""),
  address: Joi.string().allow(""),
  pincode: Joi.number().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  locality: Joi.string().allow(""),
  gstNo: Joi.string().allow(""),
  storePersonName: Joi.alternatives().try(
    Joi.string().allow(""),
    Joi.array().items(Joi.string())
  ),
  contactNo: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  gpsLocation: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }).default({}),
});

const validateUserDetails = (data) => {
  const { error, value } = userDetailsSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

const addUserDetails = async (req, res) => {
  try {
    const { error } = userDetailsSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = req.user;

    const {
      brandName,
      address,
      pincode,
      city,
      state,
      locality,
      gstNo,
      storePersonName,
      contactNo,
      gpsLocation,
    } = req.body;

    const userDExist = await UserDetails.findOne({ user: user._id });

    if (userDExist) {
      return res.status(200).send({
        message:
          "User Details Already Present! Please Try to update By Update Api",
      });
    }

    const userDetails = new UserDetails({
      user: user._id,
      brandName,
      address,
      pincode,
      city,
      state,
      locality,
      gstNo,
      storePersonName,
      contactNo,
      gpsLocation,
    });

    await userDetails.save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { userDetails: userDetails._id },
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) {
      return res.status(400).json({
        message: "User Is Not Available :(",
      });
    }

    return res.status(201).json({
      message: "User Details Created successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

// Controller to get all user details
const getAllUserDetails = async (req, res) => {
  try {
    const userDetails = await UserDetails.find().populate(
      "user",
      "-password -otp"
    );
    // Excluding the user password field
    res.json(userDetails);
  } catch (error) {
    console.error("Failed to get user details:", error);
    res
      .status(500)
      .json({ error: "Failed to get user details", message: error.message });
  }
};

// Controller for getById
const getUserDetailsById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id)
      .select("-password -otp")
      .populate("userDetails");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const user = req.user;
    const { error } = userDetailsSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const {
      brandName,
      address,
      pincode,
      city,
      state,
      locality,
      gstNo,
      storePersonName,
      contactNo,
      gpsLocation,
    } = req.body;

    const userDetails = {
      user: user._id,
      brandName,
      address,
      pincode,
      city,
      state,
      locality,
      gstNo,
      storePersonName,
      contactNo,
      gpsLocation,
    };

    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { user: user._id },
      userDetails,
      { new: true }
    ).populate({ path: "user", select: "-password" });

    if (!updatedUserDetails) {
      return res.status(404).json({
        message: "User Details Not Found",
      });
    }

    return res.status(200).json({
      message: "User Details Updated Successfully",
      data: updatedUserDetails,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

module.exports = {
  addUserDetails,
  updateUserDetails,
  getAllUserDetails,
  getUserDetailsById,
};
