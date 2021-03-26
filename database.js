var db = null;
var mysql = require("mysql");

function connectDatabase() {
  if (!db) {
    db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "breath_263",
      // port: 3000,
      database: "Ticket_Booking",
    });
  }
  db.connect((err) => {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }
    console.log("Connected to MySQL server");
  });

  return db;
}

module.exports = connectDatabase();
