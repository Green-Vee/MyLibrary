const express = require ('express');
const Author = require ('../models/Author');
const Book = require ('../models/Book');
const router = express.Router ();

// All authors Route
router.get ('/', async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp (req.query.name, 'i');
  } else {
  }

  try {
    const authors = (await Author.find (searchOptions)).reverse ();

    res.render ('authors/index', {authors, searchOptions: req.query});
  } catch (error) {
    res.redirect ('/');
  }
});

// New authors
router.get ('/new', (req, res) => {
  res.render ('authors/new', {author: new Author ()});
});

// Create Author Route
router.post ('/', async (req, res) => {
  const author = new Author ({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save ();
    res.redirect (`authors/${newAuthor.id}`);
  } catch (error) {
    console.log (error);
    res.render ('authors/new', {
      author: author,
      errorMessage: 'Error creating Author',
    });
  }
});

// Show Author Page
router.get ('/:id', async (req, res) => {
  try {
    let author = await Author.findById (req.params.id);
    let books = await Book.find ({author: author.id}).limit (6).exec ();

    res.render ('authors/show', {author, authorBooks: books});
  } catch (error) {
    console.log (error);
    res.redirect ('/');
  }
});

// EDIT PAGE
router.get ('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById (req.params.id);

    res.render ('authors/edit', {author});
  } catch (error) {
    console.log (error);
    res.redirect ('/authors');
  }
});

// EDIT ROUTE
router.put ('/:id', async (req, res) => {
  let author;

  try {
    author = await Author.findById (req.params.id);
    author.name = req.body.name;
    await author.save ();
    res.redirect (`/authors/${author.id}`);
  } catch (error) {
    if (author == null) {
      res.redirect ('/');
    } else {
      console.log (error);
      res.render ('/authors/edit', {
        author,
        errorMessage: 'Error Updating Author',
      });
    }
  }
});

// Delete Router
router.delete ('/:id', async (req, res) => {
  let author;

  try {
    author = await Author.findById (req.params.id);
    await author.remove ();
    res.redirect ('/authors/');
  } catch (error) {
    if (author == null) {
      res.redirect ('/');
    } else {
      res.redirect (`/authors/${author.id}`);
    }
  }
});

module.exports = router;
