const express = require("express");
const router = express.Router();
var db = require("../database");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const generateAuthToken = require("../token");

router.post("/addNewMovie", auth, (req, res) => {
  const {
    movie_name,
    imageURL,
    language,
    movie_genre,
    duration,
    description,
    cast,
  } = req.body;
  const { admin } = req.user;
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }
  if (
    !movie_name ||
    !imageURL ||
    !language ||
    !movie_genre ||
    !duration ||
    !description ||
    !cast
  ) {
    return res.status(400).send("All details were not provided");
  }
  let data = {
    movie_name,
    imageURL,
    language: JSON.stringify(language),
    movie_genre: JSON.stringify(movie_genre),
    duration,
    description,
    cast: JSON.stringify(cast),
  };
  // movie_name, imageURL, language, movie_genre, duration, description, cast;
  let sql = "INSERT INTO Movie set ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie order by movie_id desc";
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

router.post("/editPicture", auth, (req, res) => {
  const { movie_id, imageURL } = req.body;
  const { admin } = req.user;
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }
  if (!imageURL || !movie_id) {
    return res.status(400).send("All details were not provided");
  }
  let data = {
    imageURL,
  };
  let sql = `Update Movie set ? where movie_id = ${movie_id}`;
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie order by movie_id desc";
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

router.post("/editMovie", auth, (req, res) => {
  const {
    movie_name,
    movie_id,
    imageURL,
    language,
    movie_genre,
    duration,
    description,
    cast,
    timing,
  } = req.body;
  const { admin } = req.user;
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }
  if (
    !movie_name ||
    !imageURL ||
    !language ||
    !movie_genre ||
    !duration ||
    !description ||
    !cast ||
    !movie_id
  ) {
    return res.status(400).send("All details were not provided");
  }
  let data = {
    movie_name,
    imageURL,
    language: JSON.stringify(language),
    movie_genre: JSON.stringify(movie_genre),
    duration,
    description,
    cast: JSON.stringify(cast),
  };
  let sql = `Update Movie set ? where movie_id = ${movie_id}`;
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie order by movie_id desc";
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

router.get("/getAllMovies", async (req, res) => {
  let sql =
    "select * from movie left outer join movie_timings using(movie_id) order by movie_id desc";

  // "select * from movie,movie_timings where movie.movie_id=movie_timings.movie_id;";
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    // if (result.length === 0) {
    //   return res.status(400).send("Not found");
    // }
    console.log(result);

    let editedMovies = [];
    // let sql = "Select movie_id from movie";
    let timing_arr = [];
    for (let i = 0; i < result.length; i++) {
      let x = editedMovies.findIndex(
        (movie) => movie.movie_id === result[i].movie_id
      );
      if (x !== -1) {
        continue;
      }

      for (let j = 0; j < result.length; j++) {
        if (result[i].movie_id === result[j].movie_id) {
          if (result[j].time) timing_arr.push(result[j].time);
        }
      }
      editedMovies.push({
        movie_name: result[i].movie_name,
        imageURL: result[i].imageURL,
        language: result[i].language,
        movie_genre: result[i].movie_genre,
        duration: result[i].duration,
        description: result[i].description,
        cast: result[i].cast,
        movie_id: result[i].movie_id,
        timing: timing_arr,
      });
      timing_arr = [];
      console.log(editedMovies);
    }

    res.status(200).send(editedMovies);
  });
});

router.post("/removeMovie", auth, async (req, res) => {
  const { movie_id } = req.body;
  const { admin } = req.user;
  console.log(movie_id);
  if (!admin) {
    return res.status(400).send("Unauthorized");
  }
  if (!movie_id) {
    return res.status(400).send("All details were not provided");
  }
  let data = {
    movie_id,
  };
  let sql = "Delete from movie where ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    sql = "Select * from movie";
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
