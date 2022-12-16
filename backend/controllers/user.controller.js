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
