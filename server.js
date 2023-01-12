const express = require ('express');
const methodOverride = require ('method-override');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');

const app = express ();
const expressLayouts = require ('express-ejs-layouts');
const indexRouter = require ('./routes/index');
const authorRouter = require ('./routes/authors');
const bookRouter = require ('./routes/books');

app.set ('view engine', 'ejs');
app.set ('views', __dirname + '/views');
app.set ('layout', 'layouts/layout');
app.use (expressLayouts);
app.use (methodOverride('_method'));
app.use (express.static ('public'));
app.use (bodyParser.urlencoded ({limit: '10mb', extended: false}));

// DATABASE CONNECTION
mongoose.connect (
  'mongodb+srv://Thunder:nyirongo@myfirst.4aj47ey.mongodb.net/?retryWrites=true&w=majority',
  console.log ('Connected to Database')
);

app.use ('/', indexRouter);
app.use ('/authors', authorRouter);
app.use ('/books', bookRouter);

app.listen (9000, console.log ('Server running...'));
