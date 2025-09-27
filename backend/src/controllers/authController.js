import User from "../models/User.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    //If any field is missing
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    //If password is less than 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    //If email is not valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }
    //Check if user already exists
    const exitUser = await User.findOne({ email });
    if (exitUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    //Create a random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/avatars/${idx}.svg`;

    //Create new user
    const newUser = new User({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    //Generate JWT and security optimizations 
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Error signing up user" , error});
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
};

export const logout = async (req, res) => {
  try {
    // Perform logout logic (e.g., invalidate token)
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out user" });
  }
};
