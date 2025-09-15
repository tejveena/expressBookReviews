const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
          data: password,
          username: username
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send(req.session.authorization.username + " successfully logged in ");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const searchValue = req.params.isbn;
  const rauthor = req.session.authorization.username;
  const rtext = req.body.text;
  let rArrayItem = {
    rauthor, rtext
  }
  for (let key in books) {
    console.log(books[key].isbn);
    if (books.hasOwnProperty(key)) {
      if (books[key].isbn === searchValue) {
        let newrAuthor = true;
        let reviewsArray = books[key].reviews;
        for (let i = 0; i < reviewsArray.length; i++) {
          if (reviewsArray[i].rauthor === rauthor) {
            books[key].reviews[i].rtext = rtext;
            newrAuthor = false;
            break;
          }
        }
        if (newrAuthor) {
          books[key].reviews.push(rArrayItem);
        }
        res.status(200).send(books[key].reviews);
      }
      else {
        return res.status(208).json({ message: "ISBN not found, could not add review." });
      }
    } 
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const searchValue = req.params.isbn;
  const rauthor = req.session.authorization.username;
  for (let key in books) {
    console.log(books[key].isbn);
    if (books.hasOwnProperty(key)) {
      if (books[key].isbn === searchValue) {
        // Found the book with givern ISBN
        let reviewsArray = books[key].reviews;
        for (let i = 0; i < reviewsArray.length; i++) {
          if (reviewsArray[i].rauthor === rauthor) {
            books[key].reviews.splice(i,1)
            break;
          }
        }
        res.status(200).send(books[key].reviews);
      }
      else {
        return res.status(208).json({ message: "Review not found, could not delete review." });
      }
    } 
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
