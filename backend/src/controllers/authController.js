import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

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

    const generateAvatar = () => {
      const randomNum = Math.floor(Math.random() * 100) + 1;

      const avatarServices = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName
        )}&background=random&size=200`,
        `https://robohash.org/${email}?set=set4&size=200x200`,
        `https://avatar.iran.liara.run/public/boy?username=${encodeURIComponent(
          email
        )}`,
      ];
      return avatarServices[0];
    };

    const randomAvatar = generateAvatar();

    const newUser = new User({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });
    await newUser.save();
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log("Stream user created:", newUser.fullName);
    } catch (error) {
      console.log("Error creating user to Stream:", error);
    }

    const token = generateToken(newUser._id);

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

    // Sync user with Stream Chat on every login
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log("Stream user synced on login:", user.fullName);
    } catch (streamError) {
      console.error("Error syncing user to Stream on login:", streamError);
      // Don't block login if Stream sync fails
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

export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Error logging out user", error });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
        bio: user.bio,
        location: user.location,
        friends: user.friends,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const onboarding = async (req, res) => {
  try {
    const { fullName, bio, location, profilePic } = req.body;

    if (!fullName || !bio || !location) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        bio,
        location,
        profilePic,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    // Sync updated profile with Stream Chat
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log("Stream user updated after onboarding:", user.fullName);
    } catch (streamError) {
      console.error("Error updating Stream user on onboarding:", streamError);
      // Don't block onboarding if Stream sync fails
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
        bio: user.bio,
        location: user.location,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
