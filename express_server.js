const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./database");
const methodOverride = require('method-override');

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(methodOverride('_method'));

app.get("/", (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res)=> {
  const user = req.session["user_id"];
  const templateVars = { user: users[user], urls: urlsForUser(user, urlDatabase) };
  
  if (!templateVars.user) {
    return res.status(401).send("<html><body><h3>Error: Must be logged in to view URL's</h3></body></html>");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]]};
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    id: req.params.id,
    urls: urlDatabase[req.params.id],
  };

  if (!templateVars.user.id) {
    return res.send("<html><body><h3>Error 401: Must be logged in to view URL's</h3></body></html>");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body><h3>Error 404: URL does not exist</h3></body></html>");
  }

  if (templateVars.user.id !== urlDatabase[req.params.id].userID || !templateVars.user.id) {
    return res.send("<html><body><h3>Error 401: This URL does not belong to you</h3></body></html>");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
 
  if (!urlDatabase[id]) {
    return res.send("<html><body><h3>Error 404: URL does not exist</h3></body></html>");
  }

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const userID = req.session["user_id"];
  const templateVars = { user: userID, session: req.session  };

  res.render("user_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]], session: req.session };
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("user_registration", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const id = req.session["user_id"];
  if (!id || id === undefined) {
    return res.send("<html><body><h3>Error 401: Must be logged in to shorten URL's</h3></body></html>");
  }
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);
});

app.delete("/urls/:id/delete", (req,res) => {
  const id = req.session["user_id"];

  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body><h3>Error 401: URL does not exist</h3></body></html>");
  }

  if (!id) {
    return res.send("<html><body><h3>Error 401: Must be logged in to delete URL's</h3></body></html>");
  }

  if (id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body><h3>Error 401: This URL does not belong to you</h3></body></html>");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.session["user_id"];

  if (!id) {
    return res.send("<html><body><h3>Error 401: Must be logged in to shorten URL's</h3></body></html>");
  }

  if (!urlDatabase[shortURL]) {
    return res.send("<html><body><h3>Error 404: URL does not exist</h3></body></html>");
  }

  if (id !== urlDatabase[shortURL].userID || !id) {
    return res.send("<html><body><h3>Error 401: This URL does not belong to you</h3></body></html>");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req,res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(userEmail, users);

  if (!user) {
    return res.send("<html><body><h3>Error 403: Email not found</h3></body></html>");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403);
    res.send('Incorrect password\n<button onclick="history.back()">Back</button>');
    return;
  }
  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (userEmail === "" || password === "") {
    return res.send("<html><body><h3>Error 400: Empty field(s), check email and/or password</h3></body></html>");
  }

  if (getUserByEmail(userEmail, users)) {
    return res.send("<html><body><h3>Error 400: Email already exists</h3></body></html>");
  }

  users[userID] = {
    id: userID,
    email: userEmail,
    password: hashedPassword,
  };
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
