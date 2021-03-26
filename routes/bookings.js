const express = require("express");
const router = express.Router();
var db = require("../database");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const generateAuthToken = require("../token");

router.get("/getAllBookedSeats", auth, async (req, res) => {
  const { _id } = req.user;

  let sql =
    "Select movie_id,time,seats,bookedSeats_id from bookedSeats natural join movie_timings";

  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }

    return res.status(200).send({ result });
  });
});

router.post("/getBookingThroughBookingId", auth, async (req, res) => {
  const { _id } = req.user;
  const { booking_id } = req.body;

  if (!booking_id) {
    return res.status(400).send("Details were not provided");
  }

  let user_id = _id;
  let sql = `Select * from bookings where booking_id=${booking_id}`;

  let query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    let movie_id = result[0].movie_id;
    let seats = JSON.parse(result[0].seats);
    let timing_id = result[0].timing_id;
    sql = `Select * from movie where movie_id=${movie_id}`;
    query = db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      let movie_details = result[0];
      sql = "Select * from movie_timings where ?";
      query = db.query(sql, [timing_id], (err, result) => {
        if (err) {
          throw err;
        }
        let time = result[0].time;

        return res.status(200).send({ movie_details, time, seats, booking_id });
      });
    });
  });
});

router.post("/getCurrentBookingsOfUser", auth, async (req, res) => {
  const { _id } = req.user;

  let user_id = _id;
  let sql = "Select * from bookings where ?";
  let query = db.query(sql, [user_id], (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    let movie_id = result[0].movie_id;
    let timing_id = result[0].timing_id;
    let booking_id = result[0].booking_id;
    let seats = JSON.parse(result[0].seats);

    sql = `Select * from movie where movie_id=${movie_id}`;
    query = db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      let movie_details = result[0];
      sql = "Select * from movie_timings where ?";
      query = db.query(sql, [timing_id], (err, result) => {
        if (err) {
          throw err;
        }
        let time = result[0].time;

        return res.status(200).send({ movie_details, time, seats, booking_id });
      });
    });
  });
});

router.post("/booktickets", auth, async (req, res) => {
  const { _id } = req.user;
  let { movie_id, time, seats } = req.body;
  if (!movie_id || !time || !seats) {
    return res.status(400).send("Details were not provided");
  }
  let data = {
    movie_id,
    time,
  };
  let sql = `Select * from movie_timings where movie_id=${movie_id} and time='${time}'`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    if (!result) {
      return res.status(400).send("Something went wrong");
    }
    let timing_id = result[0].timing_id;

    data = {
      movie_id,
      timing_id,
      user_id: _id,
      seats: JSON.stringify(seats),
    };
    sql = "Insert into bookings set ?";
    query = db.query(sql, data, (err, result) => {
      if (err) {
        throw err;
      }

      console.log(result);
      let booking_id = result.insertId;
      sql = `Select * from bookedseats where movie_id=${movie_id} and timing_id=${timing_id}`;
      query = db.query(sql, (err, result) => {
        if (err) {
          throw err;
        }

        console.log(result);
        if (result.length > 0) {
          seats = seats.concat(JSON.parse(result[0].seats));
          data = {
            movie_id,
            timing_id,
            seats: JSON.stringify(seats),
          };
          sql = `update bookedseats set ? where bookedseats_id=${result[0].bookedSeats_id}`;
          query = db.query(sql, data, (err, result) => {
            if (err) {
              throw err;
            }
            console.log(result);
          });
        } else {
          data = {
            movie_id,
            timing_id,
            seats: JSON.stringify(seats),
          };
          sql = "Insert into bookedseats set ?";
          query = db.query(sql, data, (err, result) => {
            if (err) {
              throw err;
            }
            console.log(result);
          });
        }
        return res.status(200).send({ status: "Seats booked", booking_id });
      });
    });
  });
});

module.exports = router;
