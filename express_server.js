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
  "b2xVn2":  {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  }
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

const urlsForUser = (user) => {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      userURLs[url] = urlDatabase[url].longURL;
    }
  }
  return userURLs;
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
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlsForUser(req.cookies["user_id"]) };

  if (!templateVars.user) {
    return res.send("<html><body><h3>Error 401: Must be logged in to view URL's</h3></body></html>");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const id = req.cookies.user_id;
  if (!id || id === undefined) {
    return res.send("<html><body><h3>Error 401: Must be logged in to shorten URL's</h3></body></html>");
  }
  urlDatabase[shortURL] = { longURL: `http://${ req.body.longURL }`, userID: id };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
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
  const shortURL = req.params.id;
 
  if (!urlDatabase[shortURL]) {
    return res.send("<html><body><h3>Error 404: URL does not exist</h3></body></html>");
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.cookies.user_id;

  if (!id) {
    return res.send("<html><body><h3>Error 401: Must be logged in to shorten URL's</h3></body></html>");
  }
  urlDatabase[shortURL].longURL = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userID, cookies: req.cookies  };
  if (userID !== undefined) {
    return res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

app.post("/login", (req,res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const getUser = getUserByEmail(userEmail);

  if (!getUser) {
    return res.send("<html><body><h3>Error 403: Email not found</h3></body></html>");
  }

  if (getUser) {
    if (getUser.password !== password) {
      return res.send("<html><body><h3>Error 403: Incorrect password</h3></body></html>");
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
    return res.send("<html><body><h3>Error 400: Empty field(s), check email and/or password</h3></body></html>");
  }

  if (getUserByEmail(userEmail)) {
    return res.send("<html><body><h3>Error 400: Email already exists</h3></body></html>");
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
