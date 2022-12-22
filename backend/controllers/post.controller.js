import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: { $in: req.user.connections } })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error occurred in getFeedPosts ", error);
    return res.status(500).json({
      message: "An internal server error occurred, Please try again later",
      success: false,
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    let uploadedImage = "";
    if (image) {
      const res = await cloudinary.uploader.upload(image);
      uploadedImage = res.secure_url;
    }
    const post = new Post({
      author: req.user._id,
      content,
      image: uploadedImage,
    });
    await post.save();
    return res.status(201).json(post);
  } catch (error) {
    console.error("Error in createPost ", error);
    return res.status(500).json({
      message: `An internal server error occurred, ${error.message}`,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findOneAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in createPost ", error);
    return res.status(500).json({
      message: `An internal server error occurred, ${error.message}`,
    });
  }
};
