import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(4);

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedConnections ", error);
    return res.status(500).json({
      message: "An internal server error occured, Try again later",
      success: false,
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getPublic profile ", error);
    return res.status(500).json({
      message: "An internal server error occured, Try again later",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];
    const updatedData = {};

    const fieldsToUpdate = Object.keys(req.body);
    if (!fieldsToUpdate.every((field) => allowedFields.includes(field))) {
      return res.status(400).json({
        message: `You are only allowed to update ${allowedFields.join(",")}`,
      });
    }

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }
    if (req.body.profilePic) {
      const res = await cloudinary.uploader.upload(req.body.profilePic);
      updatedData.profilePic = res.secure_url;
    }
    if (req.body.bannerImg) {
      const res = await cloudinary.uploader.upload(req.body.bannerImg);
      updatedData.bannerImg = res.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateProfile ", error);
    return res.status(500).json({
      message: "An internal server error occured, Try again later",
      success: false,
    });
  }
};
