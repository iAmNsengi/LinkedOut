import Post from "../models/post.model.js";

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: { $in: req.user.connections } })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    req.status(200).json(posts);
  } catch (error) {
    console.error("Error occurred in getFeedPosts ", error);
    return res.status(500).json({
      message: "An internal server error occurred, Please try again later",
      success: false,
    });
  }
};
