const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({
        username: username,
        password: password
      });

      return res.status(200).json({
        message: "User successfully registered. Now you can login"
      });
    }

    return res.status(404).json({
      message: "Username already exists"
    });
  }

  return res.status(404).json({
    message: "Unable to register user."
  });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({ message: "Book not found" });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();

  const matchingBooks = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  return res.status(200).json(matchingBooks);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();

  const matchingBooks = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );

  return res.status(200).json(matchingBooks);
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});

// Base URL of the Express API
const API_BASE_URL = 'http://localhost:5000';

// Get all books using a callback
function getAllBooks(callback) {
    axios.get(API_BASE_URL + '/')
        .then(response => {
            callback(null, response.data);
        })
        .catch(error => {
            callback(error, null);
        });
}

// Get a book by ISBN using Promises
function getBookByISBN(isbn) {
    return axios.get(
        `${API_BASE_URL}/isbn/${encodeURIComponent(isbn)}`
    )
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
}

// Get books by author using Promises
function getBooksByAuthor(author) {
    return axios.get(
        `${API_BASE_URL}/author/${encodeURIComponent(author)}`
    )
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
}

// Get books by title using async/await
async function getBooksByTitle(title) {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/title/${encodeURIComponent(title)}`
        );

        return response.data;
    } catch (error) {
        throw error;
    }
}

// Export the Express router and asynchronous functions
module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
