const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

getAllBooks = () => {
  return books;
}

searchforISBN = (searchValue) => { 
  return new Promise((resolve, reject) => {
    // Iterating through the nested object
    let nodetails = true;
      for (let key in books) {
        // console.log(books[key].isbn);
        if (books.hasOwnProperty(key)) {
          if (books[key].isbn === searchValue) {
            nodetails = false;
            resolve(books[key]);
          }
        } 
    } 
    if (nodetails) {
      reject("Book not found")
    }
  });
}

searchAllforAuthor = (searchValue) => {
  let returnArr = []
  for (let key in books) {
    if (books.hasOwnProperty(key)) {
      if (books[key].author === searchValue) {
        returnArr.push(books[key])
      }
    } 
  }
  return returnArr;
}

searchAllforTitle = (searchValue) => {
  let returnArr = []
  for (let key in books) {
    if (books.hasOwnProperty(key)) {
      if (books[key].title === searchValue) {
        returnArr.push(books[key])
      }
    } 
  }
  return returnArr;
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  let allbooks = await getAllBooks()
  // Send the list of books
  res.status(200).send(allbooks);
});
 
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Filter the book details based on ISBN
  const isbn = req.params.isbn;
  searchforISBN(isbn)
    .then((details) => {
      if (details.length != 0) {
        res.status(200).send(details);
      }
    }).catch((err) => {
        console.log(err)
        res.status(208).json({ message: "Book details based on the given ISBN not found" })
      })
});

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  // Filter the book details based on author
  const searchValue = req.params.author;
  // Iterating through the nested object
  let booksList = await searchAllforAuthor(searchValue);
  if (booksList.length != 0) {
    res.status(200).send(booksList);
  }
  else res.status(208).json({ message: "Author not found" })

});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  // Filter the book details based on title
  const searchValue = req.params.title;
  // Iterating through the nested object
  let booksList = await searchAllforTitle(searchValue)
  if (booksList.length != 0) {
    res.status(200).send(booksList);
  }
  else res.status(208).json({ message: "Title not found" })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   // Filter the book details based on ISBN
  const searchValue = req.params.isbn;
  // console.log(searchValue)
  // Iterating through the nested object
  for (let key in books) {
    // console.log(books[key].isbn);
    if (books.hasOwnProperty(key)) {
      if (books[key].isbn === searchValue) {
        res.status(200).send(books[key].reviews)
      }
    } 
  }
});

module.exports.general = public_users;
