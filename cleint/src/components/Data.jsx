import React, { useState, useEffect } from "react";
import DateDetail from "./DateDetail";

const Data = () => {
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("http://192.168.0.105:5000/?limit=1");
      const [jsonData] = await response.json();
      setDataset(jsonData);
    };
    getData();
  }, []);

  return (
    <div className="grid-container">
      <div class="grid-item" id="date">Date & Time: {dataset.time_stamp}</div>
      <DateDetail/>
      <div class="grid-item" id="temp">Temperature: {dataset.temperature} C</div>
      <div class="grid-item" id="temp-detail">temp-detail</div>
      <div class="grid-item" id="humi">Humidity: {dataset.humidity} % </div>
      <div class="grid-item" id="humi-detail">humi-detail</div>
      <div class="grid-item" id="press">press</div>
      <div class="grid-item" id="press-detail">press-detail</div>
      <div class="grid-item" id="uv">uv</div>
      <div class="grid-item" id="uv-detail">uv-detail</div>
      <div class="grid-item" id="pm10">pm10</div>
      <div class="grid-item" id="pm10-detail">pm10-detail</div>
      <div class="grid-item" id="pm25">pm25</div>
      <div class="grid-item" id="pm25-detail">pm25-detail</div>
    </div>
  );
};

export default Data;
