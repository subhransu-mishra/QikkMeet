import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
        const user = await User.findById(decode.userId).select("-password");
        if(!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}