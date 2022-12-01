const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (userEmail) => {
  for (const user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res)=> {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
    cookies: req.cookies
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase, cookies: req.cookies  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    cookies: req.cookies
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], cookies: req.cookies  };
  if (req.cookies.user_id !== undefined) {
    return res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

app.post("/login", (req,res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const getUser = getUserByEmail(userEmail);

  if (!getUser) {
    return res.send("403 status code error: Email not found");
  }

  if (getUser) {
    if (getUser.password !== password) {
      return res.send("403 status code error: Incorrect password");
    } else {
      res.cookie("user_id", getUser.id);
    }
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], cookies: req.cookies };
  if (req.cookies.user_id !== undefined) {
    return res.redirect("/urls");
  }
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const password = req.body.password;

  if (userEmail === "" || password === "") {
    return res.send("400 status code error: Empty field(s), check email and/or password");
  }

  if (getUserByEmail(userEmail)) {
    return res.send("400 status code error: Email already exists");
  }

  users[userID] = {
    id: userID,
    email: userEmail,
    password: password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
