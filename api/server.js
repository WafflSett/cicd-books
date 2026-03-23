const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store seeded from books.json
let books = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1927, tags: ["classic", "novel"] },
  { id: "2", title: "1984", author: "George Orwell", year: 1949, tags: ["dystopian", "science fiction"] },
  { id: "3", title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, tags: ["classic", "novel"] },
  { id: "4", title: "Pride and Prejudice", author: "Jane Austen", year: 1813, tags: ["romance", "classic"] },
  { id: "5", title: "The Catcher in the Rye", author: "J.D. Salinger", year: 1951, tags: ["classic", "novel"] },
];

let nextId = books.length + 1;

// Helper: find book by ID
const findBook = (id) => books.find((b) => b.id === id);

// ─── GET /books ───────────────────────────────────────────────────────────────
// Returns all books. Optional query filters: ?tag=classic&author=Orwell&year=1949
app.get("/books", (req, res) => {
  let result = [...books];

  if (req.query.tag) {
    result = result.filter((b) => b.tags.includes(req.query.tag));
  }
  if (req.query.author) {
    result = result.filter((b) =>
      b.author.toLowerCase().includes(req.query.author.toLowerCase())
    );
  }
  if (req.query.year) {
    result = result.filter((b) => b.year === Number(req.query.year));
  }

  res.json({ total: result.length, books: result });
});

// ─── GET /books/:id ───────────────────────────────────────────────────────────
app.get("/books/:id", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });
  res.json(book);
});

// ─── POST /books ──────────────────────────────────────────────────────────────
// Body: { title, author, year, tags }
app.post("/books", (req, res) => {
  const { title, author, year, tags } = req.body;

  if (!title || !author || !year) {
    return res.status(400).json({ error: "Fields 'title', 'author', and 'year' are required." });
  }

  const newBook = {
    id: String(nextId++),
    title,
    author,
    year: Number(year),
    tags: Array.isArray(tags) ? tags : [],
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// ─── PUT /books/:id ───────────────────────────────────────────────────────────
// Full replacement. Body: { title, author, year, tags }
app.put("/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });

  const { title, author, year, tags } = req.body;
  if (!title || !author || !year) {
    return res.status(400).json({ error: "Fields 'title', 'author', and 'year' are required." });
  }

  books[index] = { id: req.params.id, title, author, year: Number(year), tags: Array.isArray(tags) ? tags : [] };
  res.json(books[index]);
});

// ─── PATCH /books/:id ─────────────────────────────────────────────────────────
// Partial update. Body: any subset of { title, author, year, tags }
app.patch("/books/:id", (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });

  const { title, author, year, tags } = req.body;
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (year !== undefined) book.year = Number(year);
  if (tags !== undefined) book.tags = Array.isArray(tags) ? tags : book.tags;

  res.json(book);
});

// ─── DELETE /books/:id ────────────────────────────────────────────────────────
app.delete("/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: `Book with id "${req.params.id}" not found.` });

  const [deleted] = books.splice(index, 1);
  res.json({ message: "Book deleted.", book: deleted });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Books API running at http://localhost:${PORT}`);
});

module.exports = app; // for testing
