const Book = require("../models/books");
const Review = require("../models/review");
const User = require("../models/users");
const ExpressError = require("../utils/ExpressErrors");
const { deleteCommentAndReplies } = require("./comments");

module.exports.getAllBooks = async (req, res) => {
  const { q } = req.query;

  let books;
  if (q) {
    const searchWords = q.split(" ");
    const regex = new RegExp(searchWords.join("|"), "i");
    books = await Book.find({
      $or: [{ title: regex }, { author: regex }, { genre: { $in: regex } }],
    });
  } else {
    books = await Book.find({}); // Fetch all books if no query provided
  }
  res.json({ books });
};

module.exports.getBook = async (req, res) => {
  const id = req.params.id;
  const book = await Book.findById(id);

  res.json({ book });
};

module.exports.createBook = async (req, res) => {
  console.log(req.body);
  if (req.role !== "admin") {
    throw new ExpressError(401, "You are not Authorized to Add Book");
  }

  const body = req.body;

  // Convert genre to array if it's a string
  if (typeof body.genre === "string") {
    try {
      body.genre = JSON.parse(body.genre);
    } catch (error) {
      body.genre = [body.genre]; // If JSON.parse fails, fallback to a single-item array
    }
  }

  // Extract uploaded files (image & pdf)
  if (req.files) {
    if (req.files["image"]) {
      let imagePath = req.files["image"][0].filename;
      body.image_url = `http://localhost:8000/public/images/${imagePath}`;
    }
    if (req.files["pdf"]) {
      console.log("first", req.files["pdf"][0].filename);
      let pdfPath = req.files["pdf"][0].filename;
      body.pdf_url = `http://localhost:8000/public/pdfs/${pdfPath}`;
    }
  }

  console.log(body);

  const book = new Book(body);
  await book.save();

  res.json({ book, message: `New Book: ${book.title} Added` });
};

module.exports.deleteBook = async (req, res) => {
  if (req.role !== "admin") {
    throw new ExpressError(401, "You are not Authorized to Delete a Book");
  }
  const id = req.params.id;
  const book = await Book.findByIdAndDelete(id);
  const usersWithBook = await User.find({ favoriteBooks: { $in: [id] } });

  usersWithBook.forEach(async (user) => {
    await User.updateOne({ _id: user._id }, { $pull: { favoriteBooks: id } });
  });

  const reviews = await Review.find({ bookId: book._id });
  reviews.map(async (review) => {
    const deletedReview = await Review.findByIdAndDelete(review._id);
    const replies = review.comments;
    for (const replyId of replies) {
      await deleteCommentAndReplies(replyId);
    }
  });

  res.json({ book, message: `Book Deleted: ${book.title}` });
};

module.exports.updateBook = async (req, res) => {
  if (req.role !== "admin") {
    throw new ExpressError(401, "You are not Authorized to Update a Book");
  }
  const id = req.params.id;
  const body = req.body;

  const previous = await Book.findById(id);
  if (req.file) {
    let fileName = req.file.filename;
    body.image_url = `/public/images/${fileName}`;
  } else {
    body.image_url = previous.image_url;
  }

  const current = await Book.findByIdAndUpdate(id, body, { new: true });

  res.json({ previous, current, message: `Book Updated` });
};
