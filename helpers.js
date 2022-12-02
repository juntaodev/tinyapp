const getUserByEmail = (email, database) => {
  for (const data in database) {
    if (database[data].email === email) {
      return database[data];
    }
  }
};

const generateRandomString = () => {
  const randomNum = Math.random().toString(16);
  return randomNum.substring(2, 8);
};

//returns an object of urls created by user
const urlsForUser = (user ,database) => {
  const userURLs = {};
  for (const url in database) {
    if (database[url].userID === user) {
      userURLs[url] = database[url].longURL;
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };