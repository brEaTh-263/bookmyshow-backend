const express = require("express");
const router = express.Router();
var db = require("../database");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const generateAuthToken = require("../token");
const accountSid = "ACe3530305c15e322eb4f3c7937343a8be"; //twilio
const serviceSid = "VA49379a7e41ab8801ccebfc17b01f8b98"; //twilio
const authToken = "c26b6a8a759f4b4e357892b0544531a7"; //twilio
const client = require("twilio")(accountSid, authToken); //twilio
var db = require("../database");

router.post("/signup-phonenumber", async (req, res) => {
  let { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).send({ Error: "Something went wrong" });
  }
  try {
    client.verify
      .services(serviceSid)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: "sms",
        // appHash: `${req.body.hash}`,
      })
      .then((data) => {
        console.log(data);
        const details = _.pick(data, ["status", "to", "valid"]);
        res.status(200).send({ details });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ Error: "Something went wrong" });
      });
  } catch (error) {
    return res.status(505).send(err.message);
  }
});

router.post("/authenticate-phonenumber", async (req, res) => {
  let { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).send("Something went wrong");
  }
  console.log(code, phoneNumber);
  try {
    const xdata = await client.verify
      .services(serviceSid)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: req.body.code,
      });
    console.log(xdata);
    if (xdata.status === "pending") {
      throw new Error();
    }
    let data = {
      phone_number: phoneNumber,
    };

    let sql = "Select * from user where ?";
    db.query(sql, data, (err, result) => {
      if (err) {
        throw err;
      }
      if (result.length === 0) {
        sql = "INSERT INTO User SET ?";
        data = {
          phone_number: phoneNumber,
          type: "customer",
        };
        let query = db.query(sql, data, (err, result) => {
          if (err) {
            throw err;
          }
          console.log(result);
          let phone_number = phoneNumber;
          sql = "Select * from user where phone_number = ?";
          db.query(sql, [phone_number], (err, result) => {
            if (err) {
              throw err;
            }
            console.log(result);
            const token = generateAuthToken(result[0].user_id, false);
            result[0].token = token;
            let details = _.pick(
              result[0],
              "email_id",
              "token",
              "username",
              "user_id",
              "phone_number",
              "type"
            );

            return res.status(200).send(details);
          });
        });
      } else {
        sql = "Select * from user where phone_number = ?";
        let phone_number = phoneNumber;

        db.query(sql, [phone_number], (err, result) => {
          if (err) {
            throw err;
          }
          console.log(result);
          let admin;
          if (result[0].type === "admin") {
            admin = true;
          } else {
            admin = false;
          }
          const token = generateAuthToken(result[0].user_id, admin);
          result[0].token = token;
          let details = _.pick(
            result[0],
            "email_id",
            "token",
            "username",
            "user_id",
            "phone_number",
            "type"
          );

          return res.status(200).send(details);
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(505).send("Something went wrong");
  }
});

router.post("/signUp-email", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).send("Details were not provided");
    }
    let email_id = email;

    sql = "Select * from user where email_id = ?";
    db.query(sql, [email_id], async (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      if (result.length === 0) {
        let details = await client.verify
          .services(serviceSid)
          .verifications.create({
            to: email,
            channel: "email",
          });
        details = _.pick(details, ["status", "to", "valid"]);
        return res.status(200).send({ details });
      }

      return res.status(400).send({ Error: "Email already exists" });
    });
  } catch (error) {
    return res.status(505).send(err.message);
  }
});

router.post("/signIn-email", async (req, res) => {
  let { email } = req.body;
  let email_id = email;
  try {
    if (!email) {
      return res.status(400).send("Details were not provided");
    }

    sql = "Select * from user where email_id = ?";
    db.query(sql, [email_id], async (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      if (result.length === 0) {
        return res.status(400).send({ Error: "Email not found" });
      } else {
        let details = await client.verify
          .services(serviceSid)
          .verifications.create({
            to: email,
            channel: "email",
          });
        details = _.pick(details, ["status", "to", "valid"]);
        return res.status(200).send({ details });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(505).send(err.message);
  }
});

router.post("/authenticate-signIn-email", async (req, res) => {
  let { email, code } = req.body;
  try {
    if (!email || !code) {
      return res.status(400).send("Details were not provided");
    }
    let email_id = email;

    let details = await client.verify
      .services(serviceSid)
      .verificationChecks.create({
        to: email,
        code: code,
      });
    if (details.status === "pending") {
      throw new Error();
    }
    sql = "Select * from user where email_id = ? ";
    db.query(sql, [email_id], async (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      let admin;
      if (result[0].type === "Admin") {
        admin = true;
      } else {
        admin = false;
      }
      const token = generateAuthToken(result[0].user_id, admin);
      result[0].token = token;
      let details = _.pick(
        result[0],
        "email_id",
        "token",
        "username",
        "user_id",
        "phone_number",
        "type"
      );

      res.status(200).send(details);
    });

    const token = user.generateAuthToken();
    return res.status(200).send({ token });
  } catch (error) {
    return res.status(400).send("Something went wrong");
  }
});

router.post("/authenticate-signUp-email", async (req, res) => {
  let { email, code, name } = req.body;
  console.log(name);
  try {
    if (!email || !code || !name) {
      return res.status(400).send("Details were not provided");
    }
    let email_id = email;
    let username = name;

    let details = await client.verify
      .services(serviceSid)
      .verificationChecks.create({
        to: email,
        code: code,
      });
    if (details.status === "pending") {
      throw new Error();
    }

    let data = {
      email_id,
      username,
      type: "customer",
    };
    let sql = "INSERT INTO User SET ?";
    let query = db.query(sql, data, async (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      sql = "Select * from user where email_id = ? ";
      db.query(sql, [email_id], (err, result) => {
        if (err) {
          throw err;
        }
        console.log(result);
        const token = generateAuthToken(result[0].user_id, false);
        result[0].token = token;
        let details = _.pick(
          result[0],
          "email_id",
          "token",
          "username",
          "user_id",
          "phone_number",
          "type"
        );

        res.status(200).send(details);
      });
    });
  } catch (error) {
    return res.status(400).send("Something went wrong");
  }
});

router.get("/autoLogIn", auth, async (req, res) => {
  const { _id } = req.user;
  let user_id = _id;
  const { admin } = req.user;
  try {
    sql = "Select * from user where user_id = ? ";
    db.query(sql, [user_id], (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      const token = generateAuthToken(result[0].user_id, admin);
      result[0].token = token;
      let details = _.pick(
        result[0],
        "email_id",
        "token",
        "username",
        "user_id",
        "phone_number",
        "type"
      );

      res.status(200).send(details);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ Error: "Something went wrong" });
  }
});

module.exports = router;
