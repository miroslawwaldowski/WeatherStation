import React, { useState, useEffect } from "react";

const Data = () => {
  const [temperatures, setTemperatures] = useState([]);
  const [humiditys, setHumiditys] = useState([]);
  const [time_stamps, setTime_stamps] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("http://localhost:5000/last");
      const [jsonData] = await response.json();
      setTemperatures(jsonData);
      setHumiditys(jsonData);
      setTime_stamps(jsonData);
      console.log(jsonData.time_stamp);
    };
    getData();
  }, []);

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Temperature: {temperatures.temperature} C</td>
          </tr>
          <tr>
            <td>Humidity: {humiditys.humidity} %</td>
          </tr>
          <tr>
            <td>Date & Time: {time_stamps.time_stamp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Data;
