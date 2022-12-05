import RegexCraft from "regexcraft";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const validPassword = new RegexCraft()
    .hasMinLength(6)
    .hasNumber(1)
    .hasSpecialCharacter(1);
  const validName = new RegexCraft().hasLetter(3).hasNumber(0);

  try {
    const { name, username, email, password } = req.body;
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

    // send confirmation email
    return res
      .status(201)
      .json({ message: "User created successfully", success: true });
  } catch (error) {
    console.error("Error in signup ", error);
    return res.status(500).json(error.response.data.message);
  }
};

export const login = (req, res) => {
  res.send("login route");
};

export const logout = (req, res) => {
  res.send("logout route");
};
