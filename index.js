import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./db.js";
import { User } from "./models/user.js";
import { Message } from "./models/message.js";
import crypto from "crypto";
import multer from "multer";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // upload folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

await connectDB();

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  } else {
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
  }
  const secretKey = crypto.randomBytes(32).toString("hex");

  const token = jwt.sign({ userId: user._id }, secretKey);

  res.status(200).json({ token });
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const newUser = new User({ email, password });

  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered succesfully!" });
    })
    .catch((error) => {
      console.log("Error creating a user", error.message);
      res.status(500).json({ message: "Error registering the user" });
    });
});

app.get("/users/:email", async (req, res) => {
  try {
    const email = req.body.email;
    const users = await User.find((u) => u.email === email);
    res.json(users);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/sendMessage", async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ message: "Receiver not found" });
  }
  receiver.friends.push({ from: senderId, message });
  await receiver.save();

  res.status(200).json({ message: "Request sent successfully" });
});

app.post("/upload/:userId", upload.single("image"), async (req, res) => {
  try {
    const imagePath = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    await User.findByIdAndUpdate(req.params.userId, { imageUrl: imagePath });
    res.json({ success: true, imageUrl: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.listen(PORT);
