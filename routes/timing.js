const express = require("express");
const router = express.Router();
var db = require("../database");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const generateAuthToken = require("../token");

router.post("/removeTiming", auth, (req, res) => {
  const { movie_id, time } = req.body;

  const { admin } = req.user;
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }

  let data = {
    movie_id,
    time: time,
  };
  let sql = `Delete from movie_timings where movie_id=${movie_id} and time='${time}'`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie_timings";
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      if (result.length === 0) {
        return res.status(400).send("Not found");
      }

      res.status(200).send(result);
    });
  });
});

router.post("/addNewTiming", auth, (req, res) => {
  const { movie_id, time } = req.body;

  const { admin } = req.user;
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }

  let data = {
    movie_id,
    time,
  };
  let sql = "INSERT INTO Movie_Timings SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie_timings";
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      if (result.length === 0) {
        return res.status(400).send("Not found");
      }

      res.status(200).send(result);
    });
  });
});

module.exports = router;
