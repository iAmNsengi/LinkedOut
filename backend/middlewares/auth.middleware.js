import User from "../models/user.model";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt"];
    if (!token)
      return res
        .status(400)
        .json({ message: "Unauthorized, No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(400).json({ message: "Unauthorized, Invalid token" });

    const user = await User.findById(decoded.userId).select("-password");
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectedRoute", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};
