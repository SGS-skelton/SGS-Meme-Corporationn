require("dotenv").config();
const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files (CSS, JS, images, etc.) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// 2. Parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Set EJS as the view engine (views folder should contain index.ejs)
app.set("view engine", "ejs");

// 4. Connect to MySQL using credentials from the .env file
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // bks2jduno7avfl0er3f5-mysql.services.clever-cloud.com
  user: process.env.DB_USER,       // uvsaujkjiicbbmuq
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,   // bks2jduno7avfl0er3f5
  port: process.env.DB_PORT        // 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// 5. Configure Multer for file uploads (images go to public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure images are stored in the existing folder: public/uploads
    cb(null, path.join(__dirname, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    // Prepend timestamp to filename to avoid collisions
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// 6. Routes

// 6.1 Home Page: Render index.ejs from the views folder
app.get("/", (req, res) => {
  res.render("index");
});

// 6.2 Thought Submission: Insert a thought (with optional image) into the database
app.post("/submit", upload.single("image"), (req, res) => {
  const { thought } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Validate thought length (must be at least 25 characters)
  if (!thought || thought.length < 25) {
    return res.status(400).send("Thought must be at least 25 characters.");
  }

  const sql = "INSERT INTO thoughts (thought, image) VALUES (?, ?)";
  db.query(sql, [thought, imagePath], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error.");
    }
    res.redirect("/");
  });
});

// 6.3 IP Capture: Store the user's IP address in the ip_addresses table
app.post("/capture-ip", (req, res) => {
  const { ip } = req.body;
  const sql = "INSERT INTO ip_addresses (ip) VALUES (?)";
  db.query(sql, [ip], (err) => {
    if (err) {
      console.error("Error inserting IP:", err);
      return res.status(500).send("Failed to insert IP.");
    }
    res.sendStatus(200);
  });
});

// 6.4 Download Meme Templates: Serve the meme_templates.zip from the public folder
app.get("/download-templates", (req, res) => {
  const filePath = path.join(__dirname, "public", "meme_templates.zip");
  res.download(filePath);
});

// 7. Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
