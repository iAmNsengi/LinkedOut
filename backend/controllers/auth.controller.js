import RegexCraft from "regexcraft";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
  const validPassword = new RegexCraft()
    .hasMinLength(6)
    .hasNumber(1)
    .hasSpecialCharacter(1);
  const validName = new RegexCraft().hasLetter(3).hasNoNumber();

  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({
        message: "User with given email already exists",
        success: false,
      });
    const userNameExists = await User.findOne({ username });
    if (userNameExists)
      return res
        .status(400)
        .json({ message: "User with username already exists", success: false });

    if (!validPassword.testOne(password).isValid)
      return res.status(400).json({
        message:
          "Password must be at least 6 characters, 1 special character and 1 number",
        success: false,
      });
    if (!validName.testOne(name).isValid)
      return res.status(400).json({
        message: "Name should have at least 3 letters and no number",
        success: false,
      });
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, username, email, password: newPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("jwt", token, {
      httpOnly: true, // prevent XSS
      secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle-attacks
      maximumAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // prevent CSRF
    });

    const profileUrl = `${process.env.CLIENT_URL}/profile/${newUser.username}`;

    // send confirmation email
    try {
      await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
    } catch (error) {
      console.error("Error in sending Welcome email ");
    }
    return res
      .status(201)
      .json({ message: "User created successfully", success: true });
  } catch (error) {
    console.error("Error in signup ", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({
        message: "Username and password fields are required",
        success: false,
      });

    const userExists = await User.findOne({ username });

    if (!userExists)
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });

    const passwordIsCorrect = await bcrypt.compare(
      password,
      userExists.password
    );
    if (!passwordIsCorrect)
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });

    const token = await jwt.sign(
      { userId: userExists._id },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return res
      .status(200)
      .json({ message: "Logged in successfully", success: true });
  } catch (error) {
    console.error("Error in login ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res
      .status(200)
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Error in logout ", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in getCurrent User", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
