const Salesperson = require("../../models/Salesperson.model");

const registerSalesperson = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      alternativeNo,
      address,
      city,
      state,
      aadharCardNo,
      aadharCardImage,
      panCardNo,
      panCardImage,
      dealers,
    } = req.body;
    console.log(
      "req.body: ",
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      aadharCardNo,
      aadharCardImage,
      panCardNo,
      panCardImage,
      dealers
    );
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !aadharCardNo
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all the required fields" });
    }
    // Check if the email is already registered
    const existingUser = await Salesperson.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create a new salesperson
    const salesperson = new Salesperson({
      name,
      email,
      password: phone,
      phone,
      alternativeNo,
      address,
      city,
      state,
      aadharCardNo,
      aadharCardImage,
      panCardNo,
      panCardImage,
      role: "Salesperson",
      dealers,
    });

    // Save the salesperson to the database
    await salesperson.save();

    res.status(201).json({ message: "Salesperson registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: error.message });
  }
};

const updateSalesperson = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      alternativeNo,
      address,
      city,
      dealers,
      state,
      aadharCardNo,
      aadharCardImage,
      panCardNo,
      panCardImage,
    } = req.body;

    const { id } = req.params;

    console.log("id ", id);

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !aadharCardNo
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all the required fields" });
    }

    const salesperson = await Salesperson.findById(id);

    if (!salesperson) {
      return res.status(404).json({ error: "Salesperson not found" });
    }

    salesperson.name = name;
    salesperson.email = email;
    salesperson.password = password || phone;
    salesperson.phone = phone;
    salesperson.alternativeNo = alternativeNo;
    salesperson.address = address;
    salesperson.city = city;
    salesperson.state = state;
    salesperson.aadharCardNo = aadharCardNo;
    salesperson.aadharCardImage = aadharCardImage;
    salesperson.panCardNo = panCardNo;
    salesperson.panCardImage = panCardImage;
    salesperson.dealers = dealers;

    await salesperson.save();

    res.status(200).json({ message: "Salesperson updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllSalespersons = async (req, res) => {
  try {
    const salespersons = await Salesperson.find().populate("dealers");

    res.status(200).json({ salespersons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getSalespersonById = async (req, res) => {
  const { id } = req.params;

  try {
    //how to populate dealers and userDetails and also exclude password and otp from both

    const salesperson = await Salesperson.findById(id)
      .select("-password -otp")
      .populate("dealers")
      .select("-password -otp")
      .populate({
        path: "dealers",
        populate: {
          path: "userDetails",
          select: "-password -otp",
        },
        select: "-password -otp",
      });

    // const salesperson = await Salesperson.findById(id)
    //   .populate({
    //     path: "dealers",
    //     populate: {
    //       path: "userDetails",
    //       select: "-password -otp",
    //     },
    //   })
    //   .select("-password -otp"); // Exclude password and otp fields from salesPerson

    // .select("-password -otp")
    // .populate("dealers")
    // .select("-password -otp")
    // .populate("userDetails");

    if (!salesperson) {
      return res.status(404).json({ error: "Salesperson not found" });
    }

    res.status(200).json({ salesperson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  registerSalesperson,
  getAllSalespersons,
  getSalespersonById,
  updateSalesperson,
};
