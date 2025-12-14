/*    
  Authors: Sydney Stalker, Thomas Vandergroen and Brandon Evangelista
  Class: CST 336 - Internet Programming
  Date: 12/18/2025
  Assignment: Final Project
  File: index.mjs

  Final Project Rubric:
    Minimum Requirements (–20 pts if missing any):
      • Final Report must include: Title, Description, Task Distribution,
        Explanation of how AI was used, Database Schema, and Screenshots.
      • Project uses at least three database tables with a combined minimum of 10 fields.
      • JavaScript and CSS code must be placed in external files.
      • All files must be uploaded as a ZIP, including exported SQL database records.

    Feature Requirements:
      • Uses at least three different types of form elements 
        (text box, select, radio, checkbox, etc.) ....................................... 15 pts
      • Uses Web Storage or Sessions .................................................... 15 pts
      • Allows users to update existing records with pre-filled data
        (must update at least three fields) ............................................. 15 pts
      • Allows users to add records to the database ..................................... 15 pts
      • Contains at least 50 lines of client-side JavaScript
        (validation, API calls, DOM updates, etc.) ...................................... 15 pts
      • Includes at least two local or external Web APIs
        and explains where Fetch calls occur ............................................ 15 pts
      • Has a professional, consistent design and uses at least 
        50 CSS properties or Bootstrap .................................................. 10 pts
*/

//LOGIN INFO
//USERNAME: admin
//PASSWORD: secret

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();
const saltRounds = 10;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.set('trust proxy', 1); 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// Setting up database connection pool
//This is set up to Sydney's for now at least, for testing test
const pool = mysql.createPool({
  host: "rtzsaka6vivj2zp1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "uouzm6x4rrhvncyk",
  password: "cwvaniku2qtf1rxg",
  database: "f8jzk2c43t9ennzr",
  connectionLimit: 10,
  waitForConnections: true,
});

////////////////////////////////////////////////// SYDNEY'S ROUTES///////////////////////////////////////////////////////

//Middleware - Sydney
function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    return res.redirect("/login");
  }
  next();
}

// HOME PAGE – Sydney
app.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  // API to display random quote on home page
  let quoteText = "";
  let quoteAuthor = "";

  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    quoteText = data[0]?.q || "";
    quoteAuthor = data[0]?.a || "";
  } catch (err) {
    console.error("Quote API error:", err);
  }

  // Display stats on home page (waiting on flashcards to update the stats) ---
  let subjectCount = 0;
  let flashcardCount = 0; // keeping for now so the EJS doesn't break

  try {
    const [subjectRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM subjects WHERE user_id = ?",
      [userId]
    );
    subjectCount = subjectRows[0].count;
  } catch (err) {
    console.error("Subject stats query error:", err);
  }

  res.render('index', {
    username: req.session.username,
    quote: quoteText,
    author: quoteAuthor,
    subjectCount,
    flashcardCount
  });
});



// Register GET - Sydney 
app.get('/register', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('auth/register', { hideNav: true });
});

// Register POST - Sydney
app.post('/register', async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    confirmPassword,
    phoneNumber,
    profilePicture,
    grade,
    userType,
    agreeTerms
  } = req.body;

  // Basic validation
  if (!username || !email || !password || password !== confirmPassword) {
    return res.redirect('/register');
  }

  if (!grade) {
    return res.redirect('/register');
  }

  if (agreeTerms !== "yes") {
    return res.redirect('/register');
  }

  try {
    const hashed = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO admin 
        (username, email, password, phoneNumber, profilePicture, grade)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      username,
      email,
      hashed,
      phoneNumber || null,
      profilePicture || null,
      grade,
      'user'
    ]);

    req.session.authenticated = true;
    req.session.username = username;
    req.session.role = 'user';

    res.redirect('/');
  } catch (err) {
    console.error("Registration error:", err);
    res.redirect('/register');
  }
});

// Profile GET -Sydney
app.get('/profile', isAuthenticated, async (req, res) => {
  const username = req.session.username;
  
  const sql = `SELECT * FROM admin WHERE username = ?`;

  try {
    const [rows] = await pool.query(sql, [username]);
    const user = rows[0];

    const message = req.session.profileMessage || null;
    req.session.profileMessage = null; // clear message after showing

    res.render('auth/profile', { user, message });

  } catch (err) {
    console.error("Profile load error:", err);
    res.status(500).send("Server error");
  }
});


// Profile UPDATE POST - Sydney
app.post('/profile', isAuthenticated, async (req, res) => {
  const {
    email,
    phoneNumber,
    profilePicture,
    grade
  } = req.body;

  const username = req.session.username;

  // Basic validation
  if (!email || !grade) {
    return res.redirect('/profile');
  }

  const sql = `
    UPDATE admin
    SET 
      email = ?, 
      phoneNumber = ?, 
      profilePicture = ?, 
      grade = ?, 
      updatedAt = NOW()
    WHERE username = ?
  `;

  try {
    await pool.query(sql, [
      email,
      phoneNumber || null,
      profilePicture || null,
      grade,
      username
    ]);

    req.session.profileMessage = "Profile updated successfully!";

    res.redirect('/profile');

  } catch (err) {
    console.error("Profile update error:", err);
    res.redirect('/profile');
  }
});


// Login GET - Sydney
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('auth/login', { hideNav: true });
});

// Login  POST - Sydney
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let sql = `
    SELECT *
    FROM admin
    WHERE username = ?
  `;

  try {
    const [rows] = await pool.query(sql, [username]);

    if (rows.length === 0) {
      return res.redirect('/login');
    }

    const passwordHash = rows[0].password;
    const match = await bcrypt.compare(password, passwordHash);

    if (match) {
      req.session.authenticated = true;
      req.session.username = rows[0].username;
      req.session.userId = rows[0].userId;
      return res.redirect('/');                
    } else {
      return res.redirect('/login');
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// Logout -Sydney
app.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});
//////////////////////////////////////////////////////END OF SYDNEY'S ROUTES//////////////////////////////////////

//////////////////////////////////////////////////////THOMAS' ROUTES/////////////////////////////////////////////

// SUBJECT ROUTES
// List all subjects
app.get("/subjects", isAuthenticated, async(req, res) => {
    let sql = `SELECT * 
                        FROM subjects 
                        WHERE user_id = ?`;
    const [rows] = await pool.query(sql, [req.session.userId]);
    res.render("subjects/list", {subjects: rows});
});

// New subject form
app.get("/subjects/new", isAuthenticated, (req, res) => {
    res.render("subjects/new");
});

app.post("/subjects/new", isAuthenticated, async(req, res) => {
    let sql = `INSERT INTO subjects (user_id, subject_category, subject_name, subject_desc, target_date)
                        VALUES (?, ?, ?, ?, ?)`;
    const [rows] = await pool.query(sql, [req.session.userId,
                                            req.body.category,
                                            req.body.subjectName,
                                            req.body.subjectDescription,
                                            req.body.endDate]);
    res.redirect("/subjects");
})

// Edit subject form
app.get("/subjects/edit/:id", isAuthenticated, async(req, res) => {
    let categories = ['English', 'Math', 'Science', 'Social Studies', 'Physical Education', 'Art', 'Technical', 'Other'];
    let sql = `SELECT subject_id, subject_name, subject_category, subject_desc, DATE_FORMAT(target_date, '%Y-%m-%d') formatted_date FROM subjects WHERE subject_id = ?`;
    const [rows] = await pool.query(sql, [req.params.id]);
    res.render("subjects/edit", { categories, subject: rows[0] });
});

app.post("/subjects/edit", isAuthenticated, async(req, res) => {
    let sql = `UPDATE subjects 
                        SET subject_name = ?, 
                            subject_category = ?, 
                            subject_desc = ?,
                            target_date = ?
                        WHERE subject_id = ?;`;
    let params = [req.body.subjectName,
                            req.body.category,
                            req.body.subjectDescription,
                            req.body.endDate,
                            req.body.subjectId];
    const [rows] = await pool.query(sql, params);
    res.redirect("/subjects");
})

app.get("/subjects/delete/:id", isAuthenticated, async(req, res) => {
    let sql = `DELETE FROM subjects WHERE subject_id = ?`;
    const [rows] = await pool.query(sql, [req.params.id]);
    res.redirect("/subjects");
})

//////////////////////////////////////////////////////END OF THOMAS' ROUTES/////////////////////////////////////////////

//////////////////////////////////////////////////////BRANDON'S ROUTES/////////////////////////////////////////////////
// FLASHCARD ROUTES
// List flashcards
app.get("/flashcards", isAuthenticated, (req, res) => {
    res.render("flashcards/list");
});

// New flashcard form
app.get("/flashcards/new", isAuthenticated, (req, res) => {
    res.render("flashcards/new");
});


//////////////////////////////////////////////////////END OF BRANDON'S ROUTES/////////////////////////////////////////////

//dbTest
app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

//start server
app.listen(3000, ()=>{
    console.log("Express server running")
})