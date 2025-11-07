import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import connect from "./config/db.js";
import authRoutes from "./router/user.js";

dotenv.config();
connect();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ----------------- PUBLIC ROUTES -----------------
app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
      return res.redirect("/home");
    } catch (err) {
      // invalid token
    }
  }
  res.render("homepage", { user: null });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null, name: "", email: "" });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null, email: "" });
});

// ----------------- PROTECTED ROUTE -----------------
app.get("/home", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = { id: decoded.id, name: decoded.name };
    res.render("homepage", { user });
  } catch (err) {
    res.redirect("/login");
  }
});

// ----------------- LOGOUT -----------------
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// ----------------- BACKEND API ROUTES -----------------
app.use("/api/user", authRoutes);

// ----------------- START SERVER -----------------
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
