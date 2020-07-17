CREATE DATABASE weatherstation;

CREATE TABLE dane(
    id serial PRIMARY KEY,
    ts TIMESTAMP,
    temp NUMERIC (4, 2)
);