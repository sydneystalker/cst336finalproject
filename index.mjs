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

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

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
  host: "w1h4cr5sb73o944p.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "f22soef3w721uqas",
  password: "w2rrbwa0a7q112xi",
  database: "qwfpbrplqjdhpu25",
  connectionLimit: 10,
  waitForConnections: true,
});

//Middleware
function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    return res.redirect("/login");
  }
  next();
}

// ROUTES

app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { username: req.session.username });
});

// Login form
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('auth/login');
});

// profile page
app.get('/myProfile', isAuthenticated, (req, res) => {
  res.render('auth/profile', { username: req.session.username });
});

app.get('/register', (req, res) => {
  res.render('auth/register');
});


// Login 
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
      return res.redirect('/');                
    } else {
      return res.redirect('/login');
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// Profile page 
app.get('/myProfile', isAuthenticated, (req, res) => {
  res.render('profile', { username: req.session.username });
});

// Logout 
app.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// SUBJECT ROUTES
// List all subjects
app.get("/subjects", isAuthenticated, (req, res) => {
    res.render("subjects/list");
});

// New subject form
app.get("/subjects/new", isAuthenticated, (req, res) => {
    res.render("subjects/new");
});

// Edit subject form
app.get("/subjects/edit/:id", isAuthenticated, (req, res) => {
    res.render("subjects/edit", { id: req.params.id });
});

// FLASHCARD ROUTES
// List flashcards
app.get("/flashcards", isAuthenticated, (req, res) => {
    res.render("flashcards/list");
});

// New flashcard form
app.get("/flashcards/new", isAuthenticated, (req, res) => {
    res.render("flashcards/new");
});


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