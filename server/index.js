const express = require("express");
const app = express();
const cors = require('cors');
const pool = require("./db");

//middlewere

app.use(cors());
app.use(express.json());  //req.body

//routs//

app.post("/post", async (req, res) => {
    try {
        const { temp } = req.body;
        console.log(temp);
        const dane = await pool.query("INSERT INTO dane (temp, ts) VALUES($1, now()) RETURNING *", [temp]);
        res.json(dane.rows[0])

    } catch (err) {
        console.log(err.massage);
    }
});

app.listen(5000, () => { console.log('server has started on port 5000') })