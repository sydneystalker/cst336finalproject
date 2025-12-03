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

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "your_hostname",
    user: "your_username",
    password: "your_password",
    database: "your_database",
    connectionLimit: 10,
    waitForConnections: true
});

// ROUTES
app.get('/', (req, res) => {
   res.render('index')
});

// SUBJECT ROUTES
// List all subjects
app.get("/subjects", (req, res) => {
    res.render("subjects/list");
});

// New subject form
app.get("/subjects/new", (req, res) => {
    res.render("subjects/new");
});

// Edit subject form
app.get("/subjects/edit/:id", (req, res) => {
    res.render("subjects/edit", { id: req.params.id });
});

// FLASHCARD ROUTES
// List flashcards
app.get("/flashcards", (req, res) => {
    res.render("flashcards/list");
});

// New flashcard form
app.get("/flashcards/new", (req, res) => {
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