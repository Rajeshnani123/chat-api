import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./db.js";
import { User } from "./models/user.js";
import { Message } from "./models/message.js";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

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
  const { name, email, password, image } = req.body;

  const newUser = new User({ name, email, password, image });

  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered succesfully!" });
    })
    .catch((error) => {
      console.log("Error creating a user");
      res.status(500).json({ message: "Error registering the user" });
    });
});

app.listen(PORT);
