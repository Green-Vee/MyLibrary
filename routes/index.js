const express = require ('express');
const router = express.Router ();
const Book = require ('../models/Book');
router.get ('/', async (req, res) => {

  let books;
  try {
    books = await Book.find ().sort ({createAt: 'desc'}).limit (10).exec ();
    res.render ('index', {books: books});
  } catch (error) {
    books = [];
  }
  // res.render ('index', {books});
});

module.exports = router;
