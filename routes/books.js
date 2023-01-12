const express = require ('express');
const router = express.Router ();
const Author = require ('../models/Author');
const Book = require ('../models/Book');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Get and Search all Books Page
router.get ('/', async (req, res) => {
  let query = Book.find ();
  if (req.query.title != null && req.query.title != '') {
    query = query.regex ('title', new RegExp (req.query.title, 'i'));
  }

  // Searching for publish before date
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte ('publishedDate', req.query.publishedBefore);
  }

  // Searching for published after date
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte ('publishedDate', req.query.publishedAfter);
  }

  try {
    const books = await query.exec ();
    res.render ('books/index', {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect ('/');
  }
});

// New Book Page
router.get ('/new', async (req, res) => {
  renderNewPage (res, new Book ());
});

// Create Book Route
router.post ('/', async (req, res) => {
  const {title, author, publishedDate, pageCount, description} = req.body;

  const book = new Book ({
    title,
    author,
    publishedDate: new Date (publishedDate),
    pageCount,
    description,
  });

  // Saving file into database
  saveCover (book, req.body.cover);

  try {
    const newBook = await book.save ();
    res.redirect (`books/${newBook.id}`);
  } catch (error) {
    renderNewPage (res, book, true);
    console.log (error);
  }
});

// Edit a book Page
router.get ('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById (req.params.id);

    renderEditPage (res, book);
  } catch (error) {
    res.redirect ('/');
  }
});

// Update a Book Route
router.put ('/:id', async (req, res) => {
  let book;
  book = await Book.findById (req.params.id);

  try {
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishedDate = new Date (req.body.publishedDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover (book, req.body.cover);
    }

    await book.save ();

    res.redirect (`/books/${book.id}`);
  } catch (error) {
    if (book != null) {
      renderEditPage (res, book, true);
    } else {
      res.redirect ('/');
    }
    console.log (error);
  }
});

// Delete Book Page
router.delete ('/:id', async (req, res) => {
  let book;

  try {
    book = await Book.findById (req.params.id);
    await book.remove ();
    res.redirect ('/books');
  } catch (error) {
    if (book != null) {
      res.render ('books/show', {
        book,
        errorMessage: 'Could not remove book',
      });
    }
  }
});

// Show Single Book Page
router.get ('/:id', async (req, res) => {
  try {
    const book = await Book.findById (req.params.id)
      .populate ('author')
      .exec ();

    res.render ('books/show', {book});
  } catch (error) {
    res.redirect ('/');
  }
});

async function renderNewPage (res, book, hasError = false) {
  renderFormPage (res, book, 'new', hasError);
}

async function renderEditPage (res, book, hasError = false) {
  renderFormPage (res, book, 'edit', hasError);
}

async function renderFormPage (res, book, form, hasError = false) {
  try {
    const authors = await Author.find ({});
    const params = {
      authors,
      book,
    };
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating a Book ';
      } else {
        params.errorMessage = 'Error Creating Book';
      }
    }

    res.render (`books/${form}`, params);
  } catch (error) {
    console.log (error);
    res.redirect ('/books');
  }
}

function saveCover (book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse (coverEncoded);
  if (cover != null && imageMimeTypes.includes (cover.type)) {
    book.coverImage = new Buffer.from (cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

module.exports = router;
