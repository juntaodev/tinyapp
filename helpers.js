const getUserByEmail = (email, database) => {
  for (const data in database) {
    if (database[data].email === email) {
      return database[data];
    }
  }
};

module.exports = { getUserByEmail };