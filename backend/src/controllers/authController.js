import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
// Utility function to generate token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ----------------- SIGNUP -----------------
export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/avatars/${idx}.svg`;

    // Create new user
    const newUser = new User({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });
    await newUser.save();
    try {
      await upsertStreamUser({
        id: newUser._id,
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log("Stream user created:", newUser.fullName);
    } catch (error) {
      console.log("Error creating user to Stream:", error);
    }

    // Generate token
    const token = generateToken(newUser._id);

    // Send token in response
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
        location: newUser.location,
        isOnboarded: newUser.isOnboarded,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Error signing up user", error });
  }
};

// ----------------- LOGIN -----------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        bio: user.bio,
        location: user.location,
        isOnboarded: user.isOnboarded,
      },
    });
    console.log("User logged in:", user._id);
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Error logging in user", error });
  }
};

// ----------------- LOGOUT -----------------
export const logout = async (req, res) => {
  try {
    // With JWT, no need to clear cookies
    // Client should remove the token from storage
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Error logging out user", error });
  }
};

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, location } = req.body;
    if (!fullName || !bio || !location) {
      return res.status(400).json({
        message: "Please provide all required fields",
        missingFileds: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
        ],
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(
        `Stream user updated after onboarding for: ${updatedUser.fullName}`
      );
    } catch (streamError) {
      console.log(
        "Error updating user to Stream after onboarding:",
        streamError.message
      );
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in onboarding:", error);
    res.status(500).json({ message: "Error onboarding user", error });
  }
}
