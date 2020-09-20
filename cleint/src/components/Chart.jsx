import React, { useState, useEffect } from "react";
import {Line} from 'react-chartjs-2'

const startDate = new Date();
startDate.setDate(startDate.getDate()-7);

const Chart = (props) => {

    const [dataset, setDataset] = useState([]);
    const [chartTime, setChartTime] = useState ({name : "weekly", limit: startDate.toISOString()})

    const handleSelectChange = event => {
        const value = event.target.value;
        let d = new Date();
            if (value === "max"){
                d = new Date('January 1, 1970 00:00:01')
                //console.log(d.toISOString())
            } else if (value === "yearly"){
                d.setFullYear(d.getFullYear()-1)
                //console.log(d.toISOString())
            } else if (value === "monthly"){
                d.setMonth(d.getMonth()-1)
                //console.log(d.toISOString())
            } else if (value === "weekly"){
                d.setDate(d.getDate()-7)
                //console.log(d.toISOString())
            } else {
                d.setDate(d.getDate()-1)
                //console.log(d.toISOString())
            }
        setChartTime({name : value, limit: d.toISOString()})
    };

    useEffect(() => {
        const getData = async () => {
          const response = await fetch(`http://192.168.0.105:5000/?time=${chartTime.limit}&type[]=${props.dataType}&type[]=time_stamp`);
          const jsonData = await response.json();
          setDataset(jsonData);
        };
        getData();
      }, [chartTime.limit, props.dataType]);

      //for chart data
      const chartTicks = [] 
      const chartPoints = [] 


      const chartGap = 1; /////

      for (let i = 0; i < dataset.length; i = i + chartGap) {
          if (chartTime.name === "daily" ) {
            chartTicks[i] =  new Date(dataset[i].time_stamp).toLocaleTimeString()
          } else {
            chartTicks[i] =  new Date(dataset[i].time_stamp).toLocaleDateString()
          }

          if (props.dataType === 'temperature') {
            chartPoints[i] = dataset[i].temperature
          } else {
            chartPoints[i] = dataset[i].humidity
          }
        }
      
    const data = {
        labels: chartTicks,
        datasets: [{
            fill: false,
            lineTension: 0.5,
            backgroundColor: '#CACACA',
            borderColor: '#CACACA',
            borderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: chartPoints
        }]
    }

    //for cerate CSV file
    const createCSV = () => {
        const rows = [];
        const headers = Object.keys(dataset[0]);
        rows.push(headers.join(','));
        for (const row of dataset) {
            const values = headers.map(header => {
                return row[header];
            });
            rows.push(values.join(','));   
        }
        return rows.join('\n');

    };

    const downloadCSV = (data) =>{
        const blob = new Blob([data], {type: 'txt/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href',url);
        a.setAttribute('download','download.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const getCSV = () => {
        const csvData = createCSV();
        downloadCSV(csvData)
    }
     
    return (
        <div className="chart-parent-container">
         <div className="chart-child-container">
            <div className="titel-container">{props.dataType.charAt(0).toUpperCase() + props.dataType.slice(1)} Details</div>
            <div className="chart-parameters">
                <div><button className="btn" onClick={getCSV} >Downland</button></div>
                <div className="radio-button">
                    <input type="radio" 
                    id="max" 
                    value="max" 
                    name="time" 
                    checked={chartTime.name === 'max'} 
                    onChange={event => handleSelectChange(event)}/> 
                <label htmlFor="max">Max</label></div>
                <div className="radio-button">
                    <input type="radio" 
                    id="yearly" 
                    value="yearly" 
                    name="time" 
                    checked={chartTime.name === 'yearly'} 
                    onChange={event => handleSelectChange(event)}/> 
                <label htmlFor="yearly">Yearly</label></div>
                <div className="radio-button">
                    <input type="radio" 
                    id="monthly" 
                    value="monthly" 
                    name="time" 
                    checked={chartTime.name === 'monthly'} 
                    onChange={event => handleSelectChange(event)}/> 
                <label htmlFor="monthly">Monthly</label></div>
                <div className="radio-button">
                    <input type="radio" 
                    id="weekly" 
                    value="weekly" 
                    name="time" 
                    checked={chartTime.name === 'weekly'} 
                    onChange={event => handleSelectChange(event)}/> 
                <label htmlFor="weekly">Weekly</label></div>
                <div className="radio-button">
                    <input type="radio" 
                    id="daily" 
                    value="daily" 
                    name="time"
                    checked={chartTime.name === 'daily'}  
                    onChange={event => handleSelectChange(event)}/> 
                <label htmlFor="daily">Daily</label></div>

            </div>
            <div className="chart-container">
              <Line 
              data={data}  
              options={{ 
                  maintainAspectRatio: false, 
                  legend: {display: false }, 
                  layout: {
                    padding: {left: 0,right: 0,top: 0,bottom: 0}}, 
                  scales: {
                        yAxes: [
                          {
                            gridLines: {
                              drawBorder: true,
                              color: '#CACACA',
                              zeroLineColor: '#CACACA',
                              lineWidth: 0.5
                              
                            },
                            ticks: {
                              fontColor: '#CACACA',
                              fontFamily: "Arial, Helvetica, sans-serif",
                              fontSize: 12,
                              fontStyle: "bold",
                              maxTicksLimit: 5,
                            }
                          }
                        ],
                        xAxes: [
                          {
                            gridLines: {
                                drawBorder: true,
                                color: '#CACACA',
                                zeroLineColor: '#CACACA',
                                lineWidth: 0.5
                            },
                            ticks: {
                                fontColor: '#CACACA',
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 12,
                                fontStyle: "bold",
                                maxTicksLimit: 8,
                            }
                          }
                        ]
                      },
                }}
             
              />
             </div>
         </div>
        </div>
    )
}

export default Chart
