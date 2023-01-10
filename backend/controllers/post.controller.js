import { createCommentNotificationEmailTemplate } from "../emails/emailTemplates.js";
import cloudinary from "../lib/cloudinary.js";
import { mailtrapClient, sender } from "../lib/mailtrap.js";
import Notification from "../models/notification.model.js";
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
    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You are not authorized to delete this post" });
    if (post.image) {
      // delete the image also from cloudinary
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }
    await Post.findByIdAndDelete(post.id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost ", error);
    return res.status(500).json({
      message: `An internal server error occurred, ${error.message}`,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");
    if (!post)
      return res
        .status(400)
        .json({ message: "Post with given id was not found" });

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById ", error);
    return res.status(500).json({
      message: `An internal server error occurred, ${error.message}`,
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });

    const postWithComment = await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: { user: req.user._id, content: comment } },
      },
      { new: true }
    ).populate("author", "name email username headline profilePicture");

    // send the notification if we are not the owner of the post and the comment
    if (post.author.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: id,
      });

      await newNotification.save();

      // send email of notification
      try {
        const postUrl = process.env.CLIENT_URL + "/post/" + id;
        await sendCommentNotification(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
        console.log("Comment notification email sent successfully");
      } catch (error) {
        console.error("Failed to send email, ", error.message);
      }
    }

    return res.status(200).json(postWithComment);
  } catch (error) {
    console.error("Error in getPostById ", error);
    return res.status(500).json({
      message: `An internal server error occurred, ${error.message}`,
    });
  }
};

export const sendCommentNotification = async (
  recipientEmail,
  recipientName,
  commentorName,
  postUrl,
  commentContent
) => {
  try {
    const recipient = [{ email }];
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "New comment on your post",
      html: createCommentNotificationEmailTemplate(
        recipientName,
        commentorName,
        postUrl,
        commentContent
      ),
      category: "comment_notification",
    });
  } catch (error) {
    throw error;
  }
};

export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(400).json({ message: "Post not found" });

    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      await post.save();
      return res
        .status(200)
        .json({ message: "Post disliked successfully", post });
    }

    post.likes.push(req.user._id);
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        type: "like",
        relatedUser: req.user._id,
        relatedPost: post._id,
      });
      await notification.save();
    }

    return res.status(200).json({ message: "Post liked successfully", post });
  } catch (error) {
    console.error("Error in likeComment, ", error.message);
    return res
      .status(500)
      .json({ message: `An internal server error occurred, ${error.message}` });
  }
};
