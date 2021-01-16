const app = require("../app");
const pool = require("../db/db_test");
const bcrypt = require("bcrypt");
const request = require("supertest");
const saltRounds = 10;

async function deleteAllDatafromDB() {
  const drop_data = await pool.query("DROP TABLE IF EXISTS  weatherdata");
  const create_data = await pool.query(
    "CREATE TABLE weatherdata (id serial PRIMARY KEY,device_id INTEGER REFERENCES devices (id)," +
      "time_stamp TIMESTAMPTZ,temperature NUMERIC(4,1),humidity NUMERIC(4,1),uv smallint,pressure NUMERIC(5,0)," +
      "pm10 NUMERIC(4,0),pm25 NUMERIC(4,0),latitude NUMERIC(6,4),longitude NUMERIC(7,4),battery NUMERIC(4,0));"
  );

  const delete_devices = await pool.query("DELETE FROM devices;");

  const hashedPassword = await bcrypt.hash("haslo", saltRounds);
  const hashedPassword2 = await bcrypt.hash("haslo", saltRounds);
  const add_device = await pool.query(
    "INSERT INTO devices (id,name_device, hashed_password) VALUES('1','prototyp',$1), ('2','prototyp_2',$2) RETURNING *",
    [hashedPassword, hashedPassword2]
  );
  const adddata = await pool.query(
    "INSERT INTO weatherdata (device_id, temperature, time_stamp,humidity, pressure, uv, pm10, pm25, latitude, longitude, battery) VALUES" +
      "('1','-2.3',TIMESTAMP '2021-01-16 02:39:22.072369+00','78.2','0','1022','0','0','52.4196','16.9996','3902')" +
      ",('1','-2.4',TIMESTAMP '2021-01-16 01:39:38.658381+00','78.7','1','1022','0','0','52.4196','16.9996','3908')" +
      ",('1','-2.3',TIMESTAMP '2021-01-16 00:40:18.022137+00','76.7','0','1022','0','0','52.4096','16.9747','3912')" +
      ",('1','-2.8',TIMESTAMP '2021-01-15 23:40:12.345314+00','78.6','0','1023','0','0','52.4096','16.9747','3918')" +
      ",('1','-3.5',TIMESTAMP '2021-01-15 22:40:30.452195+00','81.1','0','1023','0','0','52.4196','16.9996','3922')" +
      ",('1','-3.5',TIMESTAMP '2021-01-15 21:40:48.767291+00','79.9','0','1023','0','0','52.4196','16.9996','3925')" +
      ",('1','-3.2',TIMESTAMP '2021-01-15 20:41:06.607823+00','78.5','0','1023','0','0','52.4196','16.9996','3933')" +
      ",('1','-2.2',TIMESTAMP '2021-01-15 19:41:23.397805+00','77.4','0','1023','0','0','52.4196','16.9996','3938')" +
      ",('1','-2.0',TIMESTAMP '2021-01-15 18:41:39.463977+00','75.5','1','1022','0','0','52.4196','16.9996','3945')" +
      ",('1','-1.4',TIMESTAMP '2021-01-15 17:41:55.179058+00','74.4','1','1022','0','0','52.4196','16.9996','3949') RETURNING *"
  );
}
beforeAll(async ()  => {
  await deleteAllDatafromDB();
});

describe("device requests", () => {
  test("check id devive exist", async () => {
    const response = await request(app).post("/devices").send({
      name: "prototyp",
      password: "haslo",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Device exists");
  });
  test("return proper limit", async () => {
    const response = await request(app).get("/devices?limit=1");
    expect(response.body.length).toBe(1);
    expect(response.statusCode).toBe(200);
  });
});

describe("data requests", () => {
  test("check proper post", async () => {
    const response = await request(app).post("/post").send({
      name: "prototyp",
      password: "haslo",
      temperature: 41.4,
      humidity: 50.4,
      pressure: "1050.40",
      uv: "2",
      pm10: "101.1",
      pm25: "101.1",
      latitude: "52.401",
      longitude: "16.902",
      battery: "4100",
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("data added");
  });
  test("get last result", async () => {
    const response = await request(app).get("/api?limit=1");
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("temperature");
    expect(response.statusCode).toBe(200);
  });
  test("check proper last result", async () => {
    const response = await request(app).get("/api?limit=1");
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty("temperature");
    expect(response.body[0].temperature).toBe("41.4");
    expect(response.statusCode).toBe(200);
  });
  
});

afterAll(async () => {
  await pool.end();
});
