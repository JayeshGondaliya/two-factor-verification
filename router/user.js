import express from "express";
import { registerUser, loginUser, verifyOtp } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// ✅ Logout route
router.get("/logout", (req, res) => {
    res.clearCookie("token"); // JWT cookie remove
    res.redirect("/login");   // Redirect user to login page
});

export default router;
