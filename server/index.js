require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const port = process.env.PORT;


//middlewere

app.use(cors());
app.use(express.json()); //req.body

//routs//

//post data

app.post("/post", async (req, res) => {
  try {
    const name = req.body.name;
    const foundDevice = await pool.query(
      "SELECT * FROM devices WHERE name_device=$1 LIMIT 1",
      [name]
    );
    if (foundDevice.rows.length === 0) {
      res.json({ message: "Invalid Device" });
    } else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        foundDevice.rows[0].hashed_password
      );
      if (validPassword === false) {
        res.json({ message: "Invalid Password" });
      } else {
        const { temperature, humidity } = req.body;
        const weatherdata = await pool.query(
          "INSERT INTO weatherdata (temperature, time_stamp, humidity) VALUES($1, now(), $2) RETURNING *",
          [temperature, humidity]
        );
        res.json(weatherdata.rows[0]);
      }
    }
  } catch (err) {
    console.log(err.massage);
  }
});

//register device

app.post("/devices", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const name = req.body.name;
    console.log(hashedPassword + " " + name);
    const devices = await pool.query(
      "INSERT INTO devices (name_device, hashed_password) VALUES($1, $2) RETURNING *",
      [name, hashedPassword]
    );
    res.json(devices.rows[0]);
    console.log(devices.rows[0]);
  } catch (err) {
    console.log(err.massage);
  }
});

//get all

app.get("/", async (req, res) => {
  try {
    const all = await pool.query("SELECT * FROM weatherdata");
    res.json(all.rows);
  } catch (err) {
    console.log(err.massage);
  }
});

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
