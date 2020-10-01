import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7); //set range date at week

const Chart = (props) => {
  const [dataset, setDataset] = useState([]);
  const [chartTime, setChartTime] = useState({
    name: "weekly",
    limit: startDate.toISOString(),
  });

  var windowSize = window.innerWidth;

  var date = new Date();
  var maxDate = new Date();
  var minDate = new Date();

  if (dataset.length > 0) {
    for (let j = 0; j < dataset.length; j++) {
      if (dataset[j][props.dataType] !== null) {
        date = new Date(dataset[j].time_stamp);
        maxDate = new Date(dataset[j].time_stamp);
        minDate = new Date(dataset[j].time_stamp);
        break;
      }
    }
  }

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
        `/api?time=${chartTime.limit}&type[]=${props.dataType}&type[]=time_stamp`
      );
      const jsonData = await response.json();
      setDataset(jsonData);
    };
    getData();
  }, [chartTime.limit, props.dataType]);

  useEffect(() => {
    const handleResize = () => {
      // eslint-disable-next-line
      windowSize = window.innerWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  //for chart data

  const chartTicks = [];
  const chartPoints = [];
  var datasetFile = [];

  const dailyChartPoints = () => {
    if (dataset.length > 0) {
      datasetFile = [...dataset];
      //  48 points in 24 hour - 1 point in 30min
      if (chartTime.name === "daily") {
        for (let i = 0; i < 48; i++) {
          if (i === 0) {
            minDate.setMinutes(minDate.getMinutes() - 30);
          } else {
            maxDate.setMinutes(maxDate.getMinutes() - 30);
            minDate.setMinutes(minDate.getMinutes() - 30);
          }
          chartTicks[i] = maxDate.toLocaleTimeString();
          chartPoints[i] = null;

          for (let j = 0; j < dataset.length; j++) {
            if (new Date(dataset[j].time_stamp) > maxDate) {
              dataset.shift();
              j--;
            } else if (
              new Date(dataset[j].time_stamp) <= maxDate &&
              new Date(dataset[j].time_stamp) > minDate
            ) {
              chartTicks[i] = new Date(
                dataset[j].time_stamp
              ).toLocaleTimeString();
              chartPoints[i] = dataset[j][props.dataType];
              break;
            } else {
              break;
            }
          }
        }
        //  84 points in 7 days - 1 point in 2h
      } else if (chartTime.name === "weekly") {
        for (let i = 0; i < 84; i++) {
          if (i === 0) {
            minDate.setHours(minDate.getHours() - 2);
          } else {
            maxDate.setHours(maxDate.getHours() - 2);
            minDate.setHours(minDate.getHours() - 2);
          }
          chartTicks[i] = maxDate.toLocaleDateString();
          chartPoints[i] = null;

          for (let j = 0; j < dataset.length; j++) {
            if (new Date(dataset[j].time_stamp) > maxDate) {
              dataset.shift();
              j--;
            } else if (
              new Date(dataset[j].time_stamp) <= maxDate &&
              new Date(dataset[j].time_stamp) > minDate
            ) {
              chartTicks[i] = new Date(
                dataset[j].time_stamp
              ).toLocaleDateString();
              chartPoints[i] = dataset[j][props.dataType];
              break;
            } else {
              break;
            }
          }
        }
      } else if (chartTime.name === "monthly") {
        //  60 points in 1 month - 2 point in 1d
        for (let i = 0; i < 60; i++) {
          var minValue;

          //set range
          if (i === 0) {
            maxDate.setMinutes(0);
            maxDate.setSeconds(0);
            minDate.setMinutes(0);
            minDate.setSeconds(0);
            // between 20 and 8
            if (maxDate.getHours() < 8) {
              maxDate.setHours(8);
              minDate.setDate(minDate.getDate() - 1);
              minDate.setHours(20);
              minValue = true;
              // between 8 and 20
            } else if (maxDate.getHours() >= 8 && maxDate.getHours() < 20) {
              maxDate.setHours(20);
              minDate.setHours(8);
              minValue = false;
              // between 20 and 8
            } else {
              maxDate.setDate(maxDate.getDate() + 1);
              maxDate.setHours(8);
              minDate.setHours(20);
              minValue = true;
            }
          } else {
            maxDate.setHours(maxDate.getHours() - 12);
            minDate.setHours(minDate.getHours() - 12);
            minValue = !minValue;
          }
          chartTicks[i] = maxDate.toLocaleDateString();
          chartPoints[i] = null;
          for (let j = 0; j < dataset.length; j++) {
            if (new Date(dataset[j].time_stamp) > maxDate) {
              dataset.shift();
              j--;
            } else if (
              new Date(dataset[j].time_stamp) <= maxDate &&
              new Date(dataset[j].time_stamp) > minDate
            ) {
              if (minValue) {
                // search min value in date range
                if (chartPoints[i] === null) {
                  chartTicks[i] = new Date(
                    dataset[j].time_stamp
                  ).toLocaleDateString();
                  chartPoints[i] = dataset[j][props.dataType];
                } else if (chartPoints[i] > dataset[j][props.dataType]) {
                  chartTicks[i] = new Date(
                    dataset[j].time_stamp
                  ).toLocaleDateString();
                  chartPoints[i] = dataset[j][props.dataType];
                }
              } else {
                // search max value in date range
                if (chartPoints[i] < dataset[j][props.dataType]) {
                  chartTicks[i] = new Date(
                    dataset[j].time_stamp
                  ).toLocaleDateString();
                  chartPoints[i] = dataset[j][props.dataType];
                }
              }
            } else {
              break;
            }
          }
        }
      } else if (chartTime.name === "yearly") {
        //  182 points in 1 year - 1 point in 2d
        for (let i = 0; i < 182; i++) {
          if (i === 0) {
            minDate.setDate(minDate.getDate() - 2);
          } else {
            maxDate.setDate(maxDate.getDate() - 2);
            minDate.setDate(minDate.getDate() - 2);
          }
          chartTicks[i] = maxDate.toLocaleDateString();
          chartPoints[i] = null;

          for (let j = 0; j < dataset.length; j++) {
            if (new Date(dataset[j].time_stamp) > maxDate) {
              dataset.shift();
              j--;
            } else if (
              new Date(dataset[j].time_stamp) <= maxDate &&
              new Date(dataset[j].time_stamp) > minDate
            ) {
              // search max value in date range
              if (chartPoints[i] < dataset[j][props.dataType]) {
                chartTicks[i] = new Date(
                  dataset[j].time_stamp
                ).toLocaleDateString();
                chartPoints[i] = dataset[j][props.dataType];
              }
            } else {
              break;
            }
          }
        }
      } else {
        //difference between firt day and now in days
        const daysRange = Math.floor(
          (maxDate.getTime() -
            new Date(dataset[dataset.length - 1].time_stamp).getTime()) /
            (1000 * 3600 * 24)
        );
        const daysShift = Math.ceil(daysRange / 182);
        //  182 points in max range
        for (let i = 0; i < 182; i++) {
          if (i === 0) {
            minDate.setDate(minDate.getDate() - daysShift);
          } else {
            maxDate.setDate(maxDate.getDate() - daysShift);
            minDate.setDate(minDate.getDate() - daysShift);
          }
          chartTicks[i] = maxDate.toLocaleDateString();
          chartPoints[i] = null;
          for (let j = 0; j < dataset.length; j++) {
            if (new Date(dataset[j].time_stamp) > maxDate) {
              dataset.shift();
              j--;
            } else if (
              new Date(dataset[j].time_stamp) <= maxDate &&
              new Date(dataset[j].time_stamp) > minDate
            ) {
              // search max value in date range
              if (chartPoints[i] < dataset[j][props.dataType]) {
                chartTicks[i] = new Date(
                  dataset[j].time_stamp
                ).toLocaleDateString();
                chartPoints[i] = dataset[j][props.dataType];
              }
            } else {
              break;
            }
          }
        }
      }
    }
  };

  dailyChartPoints();

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
        pointHitRadius: 13,
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
          <p>{props.title}</p>
        </div>
        <div className="chart-parameters">
          <div>
            <button
              className="btn"
              onClick={datasetFile.length > 0 ? getCSV : undefined}
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
              showLines: false,
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
                      fontSize:
                        windowSize > 890 ? 13 : windowSize > 439 ? 10 : 9,
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
                      fontSize:
                        windowSize > 890 ? 12 : windowSize > 439 ? 8 : 6,
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
