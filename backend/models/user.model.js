import mongoose from "mongoose";

const userSchema = new mongoose.Schema({});

const User = new mongoose.model("User", userSchema);
export default User;
