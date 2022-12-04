import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bannerImg: { type: String, default: "" },
    headline: { type: String, default: "LinkedOut User" },
    location: { type: String, default: "Earth" },
    about: { type: String, default: "" },
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
      },
    ],
  },
  { timestamps: true }
);

const User = new mongoose.model("User", userSchema);
export default User;
