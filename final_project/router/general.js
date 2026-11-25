const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user. Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Promise that resolves with the book data, so the routes below use async/await
const getBooks = () => new Promise((resolve) => resolve(books));

const findBooks = async (field, value) => {
  const allBooks = await getBooks();
  const result = {};
  for (const isbn of Object.keys(allBooks)) {
    if (allBooks[isbn][field].toLowerCase() === value.toLowerCase()) {
      result[isbn] = allBooks[isbn];
    }
  }
  return result;
};

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const allBooks = await getBooks();
  return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const allBooks = await getBooks();
  const book = allBooks[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found` });
  }
  return res.status(200).send(JSON.stringify(book, null, 4));
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const result = await findBooks("author", req.params.author);
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: `No books found by author ${req.params.author}` });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const result = await findBooks("title", req.params.title);
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: `No books found with title ${req.params.title}` });
  }
  return res.status(200).send(JSON.stringify(result, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const allBooks = await getBooks();
  const book = allBooks[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found` });
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// ---------------------------------------------------------------------------
// Tasks 10-13: the same lookups done with Axios, using async/await and Promises
// ---------------------------------------------------------------------------

// Task 10: get all books (async/await with Axios)
const getAllBooksAxios = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching all books: ${error.message}`);
  }
};

// Task 11: get book details by ISBN (Promise callbacks with Axios)
const getBookByISBNAxios = (isbn) => {
  return axios
    .get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(`Error fetching book with ISBN ${isbn}: ${error.message}`);
    });
};

// Task 12: get book details by author (async/await with Axios)
const getBooksByAuthorAxios = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books by author ${author}: ${error.message}`);
  }
};

// Task 13: get book details by title (async/await with Axios)
const getBooksByTitleAxios = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books with title ${title}: ${error.message}`);
  }
};

module.exports.general = public_users;
module.exports.getAllBooksAxios = getAllBooksAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
