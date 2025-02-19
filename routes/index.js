const express = require("express");
const path = require("path");
const multer = require("multer");
const mysql = require("mysql2");

const router = express.Router();

// MySQL Connection Using Clever Cloud Credentials
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database on Clever Cloud.");
});

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Serve Homepage
router.get("/", (req, res) => {
    res.render("index");
});

// Handle Thought Submission
router.post("/submit", upload.single("image"), (req, res) => {
    const { thought } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (thought.length < 25) {
        return res.status(400).send("Thought must be at least 25 characters.");
    }

    const sql = "INSERT INTO thoughts (thought, image) VALUES (?, ?)";
    db.query(sql, [thought, imagePath], (err, result) => {
        if (err) {
            console.error("Error inserting thought:", err);
            return res.status(500).send("Database error.");
        }
        res.redirect("/");
    });
});

// Capture and Store User IP Address
router.post("/capture-ip", (req, res) => {
    const { ip } = req.body;
    const sql = "INSERT INTO ip_addresses (ip) VALUES (?)";
    db.query(sql, [ip], (err) => {
        if (err) console.error(err);
        res.sendStatus(200);
    });
});

// Serve ZIP File for Download
router.get("/download-templates", (req, res) => {
    const filePath = path.join(__dirname, "../public", "templates.zip");
    res.download(filePath);
});

module.exports = router;
