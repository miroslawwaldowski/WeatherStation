CREATE DATABASE weatherstation;

CREATE TABLE weatherdata
(
  id serial PRIMARY KEY,
  time_stamp TIMESTAMP,
  temperature NUMERIC (4, 2),
  humidity NUMERIC (4, 2)
);

CREATE TABLE devices
(
  id serial primary key,
  name_device text UNIQUE NOT NULL,
  hashed_password text NOT NULL
);