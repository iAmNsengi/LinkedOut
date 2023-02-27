import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.model.js";

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

export const acceptConnectionRequest = async (req, res) => {
  try {
    const session = await ConnectionRequest.startSession();
    session.startTransaction();

    const { requestId } = req.params;
    const connectionRequest = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username")
      .session(session);

    if (!connectionRequest)
      return res.status(400).json({ message: "Connection request not found" });

    if (connectionRequest.recipient.toString() !== userId.toString())
      return res.status(400).json({
        message:
          "You can't update a connection status where you are not the receiver",
      });

    if (connectionRequest.status !== "pending")
      return res
        .status(400)
        .json({ message: "Connection request was already processed" });

    connectionRequest.status = "accepted";

    await connectionRequest.save({ session });
    await ConnectionRequest.deleteOne({ _id: requestId }).session(session);
    await session.commitTransaction();

    return res
      .status(200)
      .json({ message: "Connection request accepted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in send acceptConnectionRequest, ", error);
    return res
      .status(500)
      .json({ message: `An internal server error occurred, ${error.message}` });
  } finally {
    session.endSession();
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest)
      return res.status(400).json({ message: "Connection request not found" });

    if (connectionRequest.recipient.toString() !== userId.toString())
      return res.status(400).json({
        message:
          "You can't update a connection status where you are not the receiver",
      });

    if (connectionRequest.status !== "pending")
      return res
        .status(400)
        .json({ message: "Connection request was already processed" });

    connectionRequest.status = "rejected";

    await connectionRequest.save();

    return res
      .status(200)
      .json({ message: "Connection requested rejected successfully" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest, ", error);
    return res
      .status(500)
      .json({ message: `An internal server error occurred, ${error.message}` });
  }
};
