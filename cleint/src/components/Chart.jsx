import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const Chart = (props) => {
  const [dataset, setDataset] = useState([]);
  const [chartTime, setChartTime] = useState({
    name: "weekly",
    limit: startDate.toISOString(),
  });

  var date = new Date();
  var maxDate = new Date();
  var minDate = new Date();

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (value === "max") {
      date = new Date("January 1, 1970 00:00:01");
    } else if (value === "yearly") {
      date.setFullYear(date.getFullYear() - 1);
    } else if (value === "monthly") {
      date.setMonth(date.getMonth() - 1);
    } else if (value === "weekly") {
      date.setDate(date.getDate() - 7);
    } else {
      date.setDate(date.getDate() - 1);
    }
    setChartTime({ name: value, limit: date.toISOString() });
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(
        `http://192.168.0.105:5000/?time=${chartTime.limit}&type[]=${props.dataType}&type[]=time_stamp`
      );
      const jsonData = await response.json();
      setDataset(jsonData);
    };
    getData();
  }, [chartTime.limit, props.dataType]);

  //for chart data

  const chartTicks = [];
  const chartPoints = [];
  var datasetFile = [];

  //  48 points in 24 hour - 1 point in 30min
  const dailyChartPoints = () => {
    datasetFile = [...dataset];

    for (let i = 0; i < 48; i++) {
      if (i === 0) {
        minDate.setMinutes(minDate.getMinutes() - 30);
      } else {
        maxDate.setMinutes(maxDate.getMinutes() - 30);
        minDate.setMinutes(minDate.getMinutes() - 30);
      }
      for (let j = 0; j < dataset.length; j++) {
        if (new Date(dataset[j].time_stamp) > maxDate) {
          dataset.shift();
          j--;
        } else if (
          new Date(dataset[j].time_stamp) <= maxDate &&
          new Date(dataset[j].time_stamp) > minDate
        ) {
          chartTicks[i] = new Date(dataset[j].time_stamp).toLocaleTimeString();
          chartPoints[i] = dataset[j].temperature;
          break;
        } else {
          chartTicks[i] = maxDate.toLocaleTimeString();
        }
      }
    }
  };

  for (let i = 0; i < dataset.length; i = i + 1) {
    if (chartTime.name === "daily") {
      dailyChartPoints();
    } else {
      chartTicks[i] = new Date(dataset[i].time_stamp).toLocaleDateString();
    }
    if (props.dataType === "temperature") {
      //chartPoints[i] = dataset[i].temperature;
    } else {
      chartPoints[i] = dataset[i].humidity;
    }
  }

  const data = {
    labels: chartTicks,
    datasets: [
      {
        fill: false,
        lineTension: 0.5,
        backgroundColor: "#CACACA",
        borderColor: "#CACACA",
        borderWidth: 2,
        pointRadius: 3,
        pointHitRadius: 10,
        data: chartPoints,
      },
    ],
  };

  //for cerate CSV file
  const createCSV = () => {
    const rows = [];
    const headers = Object.keys(datasetFile[0]);
    rows.push(headers.join(","));
    for (const row of datasetFile) {
      const values = headers.map((header) => {
        return row[header];
      });
      rows.push(values.join(","));
    }
    return rows.join("\n");
  };

  const downloadCSV = (data) => {
    const blob = new Blob([data], { type: "txt/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", Object.keys(datasetFile[0])[0] + ".csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCSV = () => {
    const csvData = createCSV();
    downloadCSV(csvData);
  };

  return (
    <div className="chart-parent-container">
      <div className="chart-child-container">
        <div className="titel-container">
          {props.dataType.charAt(0).toUpperCase() + props.dataType.slice(1)}{" "}
          Details
        </div>
        <div className="chart-parameters">
          <div>
            <button
              className="btn"
              onClick={dataset.length > 0 ? getCSV : undefined}
            >
              Downland
            </button>
          </div>
          <div className="radio-button">
            <input
              type="radio"
              id="max"
              value="max"
              name="time"
              checked={chartTime.name === "max"}
              onChange={(event) => handleSelectChange(event)}
            />
            <label htmlFor="max">Max</label>
          </div>
          <div className="radio-button">
            <input
              type="radio"
              id="yearly"
              value="yearly"
              name="time"
              checked={chartTime.name === "yearly"}
              onChange={(event) => handleSelectChange(event)}
            />
            <label htmlFor="yearly">Yearly</label>
          </div>
          <div className="radio-button">
            <input
              type="radio"
              id="monthly"
              value="monthly"
              name="time"
              checked={chartTime.name === "monthly"}
              onChange={(event) => handleSelectChange(event)}
            />
            <label htmlFor="monthly">Monthly</label>
          </div>
          <div className="radio-button">
            <input
              type="radio"
              id="weekly"
              value="weekly"
              name="time"
              checked={chartTime.name === "weekly"}
              onChange={(event) => handleSelectChange(event)}
            />
            <label htmlFor="weekly">Weekly</label>
          </div>
          <div className="radio-button">
            <input
              type="radio"
              id="daily"
              value="daily"
              name="time"
              checked={chartTime.name === "daily"}
              onChange={(event) => handleSelectChange(event)}
            />
            <label htmlFor="daily">Daily</label>
          </div>
        </div>
        <div className="chart-container">
          <Line
            data={data}
            options={{
              maintainAspectRatio: false,
              legend: { display: false },
              layout: {
                padding: { left: 0, right: 0, top: 0, bottom: 0 },
              },
              scales: {
                yAxes: [
                  {
                    gridLines: {
                      drawBorder: true,
                      color: "#CACACA",
                      zeroLineColor: "#CACACA",
                      lineWidth: 0.5,
                    },
                    ticks: {
                      fontColor: "#CACACA",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 12,
                      fontStyle: "bold",
                      maxTicksLimit: 5,
                    },
                  },
                ],
                xAxes: [
                  {
                    gridLines: {
                      drawBorder: true,
                      color: "#CACACA",
                      zeroLineColor: "#CACACA",
                      lineWidth: 0.5,
                    },
                    ticks: {
                      fontColor: "#CACACA",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 12,
                      fontStyle: "bold",
                      maxTicksLimit: 5,
                      reverse: true,
                      minRotation: 5,
                    },
                  },
                ],
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chart;
