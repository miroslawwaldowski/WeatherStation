import React, { useState, useEffect } from "react";

const Data = () => {
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("http://localhost:5000/last");
      const [jsonData] = await response.json();
      setDataset(jsonData);
    };
    getData();
  }, []);

  return (
    <div className="grid-container">
      <div className="grid-item">Temperature: {dataset.temperature} C</div>
      <div className="grid-item"> Humidity: {dataset.humidity} % </div>
      <div className="grid-item">Date & Time: {dataset.time_stamp}</div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
      <div className="grid-item"></div>
    </div>
  );
};

export default Data;
