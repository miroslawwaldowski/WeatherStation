require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const path = require("path");

//middlewere

app.use(cors());
app.use(express.json());
/// app.use((req, res, next) => setTimeout(next, Math.random() * 1000)); // add  latency

app.set("query parser", "simple");

//post data

// {
// 	"name": "name",
// 	"password": "password",
// 	"temperature": 41.40,
// 	"humidity": 50.40,
//  "pressure": "1050.40"
//  "uv": "2",
//  "pm10": "101.1",
//  "pm25": "101.1",
//  "latitude": "52.401",
//  "longitude": "16.902",
//  "battery": "4100"
// }

app.post("/post", async (req, res) => {
  try {
    const name = req.body.name;
    const foundDevice = await pool.query(
      "SELECT * FROM devices WHERE name_device=$1 LIMIT 1",
      [name]
    );
    if (foundDevice.rows.length === 0) {
      res.json({ message: "Invalid device `name`"});
    } else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        foundDevice.rows[0].hashed_password
      );
      if (validPassword === false) {
        res.json({ message: "Invalid password" });
      } else {
        const weatherdata = await pool.query(
          "INSERT INTO weatherdata (device_id, temperature, time_stamp, humidity, pressure, uv, pm10, pm25, latitude, longitude, battery) VALUES($1, $2, now(), $3, $4, $5, $6, $7, $8, $9, $10) ",
          [
            foundDevice.rows[0].id,
            req.body.temperature,
            req.body.humidity,
            req.body.pressure,
            req.body.uv,
            req.body.pm10,
            req.body.pm25,
            req.body.latitude,
            req.body.longitude,
            req.body.battery,
          ]
        );
        res.json({ message: "data added" });
      }
    }
  } catch (err) {
    console.log(err.massage);
  }
});

//register device

// {
// 	"name": "name",
// 	"password":"password"
// }

app.post("/devices", async (req, res) => {
  try {
    const name = req.body.name;
    const foundDevice = await pool.query(
      "SELECT * FROM devices WHERE name_device=$1 LIMIT 1",
      [name]
    );
    if (foundDevice.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      const devices = await pool.query(
        "INSERT INTO devices (name_device, hashed_password) VALUES($1, $2) RETURNING *",
        [req.body.name, hashedPassword]
      );
      res.json({ message: "Device added successfully" });
    } else {
      res.json({ message: "Device exists" });
    }
  } catch (err) {
    console.log(err.massage);
  }
});

// get device list

app.get("/devices", async (req, res) => {
  try {
    var limit = "NULL";
    if (req.query.limit) {
      limit = req.query.limit;
    }

    const sql = `SELECT id, name_device FROM devices LIMIT ${limit}`;
    const all = await pool.query(sql);
    res.json(all.rows);
  } catch (err) {
    console.log(err.massage);
  }
});

//get
//?limit=5&time=2020-07-20 21:26:24.334931&type[]=id&type[]=temperature&type[]=time_stamp&type[]=humidity&device=1

app.get("/api", async (req, res) => {
  try {
    var limit = "NULL";
    if (req.query.limit) {
      limit = req.query.limit;
    }

    var time = new Date("January 1, 1970 00:00:01").toISOString();
    if (req.query.time) {
      time = req.query.time;
    }

    var type = "*";
    if (req.query.type) {
      var arrayLength = req.query.type.length;
      type = "";
      for (var i = 0; i < arrayLength; i++) {
        type = type + "," + req.query.type[i];
      }
      type = type.substring(1);
    }

    var sql = `SELECT ${type} FROM weatherdata WHERE time_stamp > '${time}' ORDER BY time_stamp DESC LIMIT ${limit}`;

    if (req.query.device) {
      const device = req.query.device;
      sql = `SELECT ${type} FROM weatherdata WHERE time_stamp > '${time}' AND device_id = '${device}' ORDER BY time_stamp DESC LIMIT ${limit}`;
    }

    const all = await pool.query(sql);
    res.json(all.rows);
  } catch (err) {
    console.log(err.massage);
  }
});

//get react app

app.use(express.static("client/build"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

module.exports = app ;