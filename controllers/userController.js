import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import nodemailer from "nodemailer";

let otpStore = {}; 

// ----------------- REGISTER -----------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.render("register", { error: "All fields required", name, email });

    if (password !== confirmPassword)
      return res.render("register", { error: "Passwords do not match", name, email });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.render("register", { error: "Email already exists", name, email });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.render("register", { error: "Something went wrong" });
  }
};

// ----------------- LOGIN -----------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.render("login", { error: "Email & Password required", email });

    const user = await User.findOne({ email });
    if (!user) return res.render("login", { error: "User not found", email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render("login", { error: "Invalid password", email });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    console.log(`OTP for ${email} is: ${otp}`); 

    // Send OTP email
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jayeshgondaliya9929@gmail.com", 
        pass: "nlae nsic gkys ygsz", 
      },
    });

    await transport.sendMail({
      from:"jayeshgondaliya9929@gmail.com",
      to: email,
      subject: "Login OTP",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    res.render("otp", { email });
  } catch (error) {
    console.log(error);
    res.render("login", { error: "Something went wrong" });
  }
};

// ----------------- VERIFY OTP -----------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email]) return res.render("otp", { error: "OTP expired", email });
    if (otpStore[email] != otp) return res.render("otp", { error: "Invalid OTP", email });

    delete otpStore[email];

    const user = await User.findOne({ email });
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("/home");
  } catch (error) {
    console.log(error);
    res.render("otp", { error: "Something went wrong", email });
  }
};