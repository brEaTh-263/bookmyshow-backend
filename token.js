const jwt = require("jsonwebtoken");

function generateAuthToken(_id, bool) {
  const token = jwt.sign({ _id: _id, admin: bool }, "mysecretkey");
  return token;
}

module.exports = generateAuthToken;
