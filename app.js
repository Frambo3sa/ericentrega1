const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');
const sequelize = require('./database');
const { User, Book, Loan } = require('./models');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Handlebars setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// Database sync
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced!');
});

// Admin login fixo
const adminCredentials = { username: 'boss', password: '11118' };

// Rotas principais
app.get('/', async (req, res) => {
  const books = await Book.findAll();
  res.render('home', { books, isAdmin: req.session.isAdmin });
});

// Rotas de Usuário
// Página de cadastro
app.get('/register', (req, res) => {
  res.render('register');
});

// Registro de novos usuários
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  await User.create({ name, email, password });
  res.redirect('/login');
});

// Página de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Login de usuários
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, password } });
  if (user) {
    req.session.userId = user.id;
    res.redirect('/');
  } else {
    res.redirect('/login?error=Credenciais inválidas');
  }
});

// Rotas de Admin
app.get('/admin/login', (req, res) => {
  res.render('adminlogin');
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login?error=Credenciais inválidas');
  }
});

app.get('/admin/dashboard', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  const users = await User.findAll();
  const books = await Book.findAll();
  res.render('adminDashboard', { users, books });
});

// Rotas de Livros
app.post('/admin/books/add', async (req, res) => {
  const { title, author, category, availableCopies } = req.body;
  await Book.create({ title, author, category, availableCopies });
  res.redirect('/admin/dashboard');
});

app.post('/admin/books/edit/:id', async (req, res) => {
  const { title, author, category, availableCopies } = req.body;
  const book = await Book.findByPk(req.params.id);
  if (book) {
    book.title = title;
    book.author = author;
    book.category = category;
    book.availableCopies = availableCopies;
    await book.save();
  }
  res.redirect('/admin/dashboard');
});

app.post('/admin/books/delete/:id', async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
  }
  res.redirect('/admin/dashboard');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
