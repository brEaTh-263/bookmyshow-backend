const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var connection = require("./database");
const authRouter = require("./routes/auth");
const movieRouter = require("./routes/movie");
const timingRouter = require("./routes/timing");
const bookingsRouter = require("./routes/bookings");
// const empRouter = require("./routes/employee");

app.use(bodyParser.json());
app.use("/auth", authRouter);
app.use("/movie", movieRouter);
app.use("/timing", timingRouter);
app.use("/bookings", bookingsRouter);
// app.use("/employee", empRouter);

app.get("/createDatabase", (req, res) => {
  let query = "CREATE DATABASE Ticket_Booking";
  connection.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(200).send("Database created");
  });
});

app.get("/createTable", (req, res) => {
  let query =
    "Create table Movie(movie_id int primary key auto_increment,movie_name varchar(30) not null,imageURL varchar(100) not null ,language varchar(20) not null,movie_genre varchar(40) not null,duration int not null,description varchar(500) not null, cast varchar(100) not null )";
  connection.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(200).send("Table created");
  });
});

app.get("/createTableUser", (req, res) => {
  let query =
    "Create table User(user_id int primary key auto_increment,email_id varchar(100) unique,username varchar(20) ,phone_number varchar(20), type varchar(10) not null )";
  connection.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(200).send("Table created");
  });
});

app.get("/createTableTiming", (req, res) => {
  let query =
    "Create table movie_Timings(timing_id int primary key auto_increment, movie_id int not null,foreign key (movie_id) references movie(movie_id),time varchar(20) )";
  connection.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.status(200).send("Table created");
  });
});



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
