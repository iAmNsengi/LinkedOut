import ConnectionRequest from "../models/connectionRequest";
import User from "../models/user.model";

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (userId.toString() === senderId.toString())
      return res
        .status(400)
        .json({ message: "You can't send a connection request to yourself" });

    const receiverExists = await User.findById(userId);
    if (!receiverExists)
      return res.status(400).json({ message: "Receiver not found" });

    if (req.user.connections.includes(userId))
      return res.status(400).json({ message: "Already connected" });

    const connectionRequestExists = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });
    if (connectionRequestExists)
      return res
        .status(400)
        .json({ message: "Connection request exists and is pending" });
    const newConnectionRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newConnectionRequest.save();
    return res
      .status(201)
      .json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.error("Error in send connectionRequest, ", error);
    return res
      .status(500)
      .json({ message: `An internal server error occurred, ${error.message}` });
  }
};
