import React, { useState, useEffect } from "react";
import DateDetail from "./DateDetail";
import TempDetail from "./TempDetail";
import HumiDetail from "./HumiDetail";

const Data = () => {

  const [dataset, setDataset] = useState([]);
  
  const [dateDetail, setDateDetail] = useState(false)
  const [tempDetail, setTempDetail] = useState(false)
  const [humiDetail, setHumiDetail] = useState(false)
  const [pressDetail, setPressDetail] = useState(false)
  const [uvDetail, setUvDetail] = useState(false)
  const [pm10Detail, setPm10Detail] = useState(false)
  const [pm25Detail, setPm25Detail] = useState(false)


  useEffect(() => {
    const getData = async () => {
      const response = await fetch("http://192.168.0.105:5000/?limit=1");
      const [jsonData] = await response.json();
      setDataset(jsonData);
    };
    getData();
  }, []);

  const showDetail = (nameVal, val, setVal) => {
    const objectDetail = {
    dateDetail : setDateDetail, 
    tempDetail : setTempDetail, 
    humiDetail: setHumiDetail, 
    pressDetail: setPressDetail, 
    uvDetail: setUvDetail,  
    pm10Detail :setPm10Detail, 
    pm25Detail: setPm25Detail
    } 
    for (var key in objectDetail) {
       if (key === nameVal) {  
        setVal(!val)
       }else {
      objectDetail[key](false)
       }
    }
  }
         

  return (
    <div className="grid-container">
      <div className="grid-item" id="date" onClick={()=>showDetail('dateDetail', dateDetail, setDateDetail)}>Date & Time: {new Date(dataset.time_stamp).toLocaleDateString()} {new Date(dataset.time_stamp).toLocaleTimeString()}</div>
      {dateDetail ? <DateDetail/> : null}
      <div className="grid-item" id="temp" onClick={()=>showDetail('tempDetail', tempDetail, setTempDetail)}><div className="titel-container">Temperature</div> {dataset.temperature} C</div>
      {tempDetail ? <TempDetail/> : null}
      <div className="grid-item" id="humi" onClick={()=>showDetail('humiDetail', humiDetail, setHumiDetail)}>Humidity: {dataset.humidity} % </div>
      {humiDetail ?<HumiDetail/> : null}
      <div className="grid-item" id="press" onClick={()=>showDetail('pressDetail', pressDetail, setPressDetail)}>press</div>
      {pressDetail ? <div className="grid-item" id="press-detail">press-detail</div> : null}
      <div className="grid-item" id="uv" onClick={()=>showDetail('uvDetail', uvDetail, setUvDetail)}>uv</div>
      {uvDetail ? <div className="grid-item" id="uv-detail">uv-detail</div> : null}
      <div className="grid-item" id="pm10" onClick={()=>showDetail('pm10Detail', pm10Detail, setPm10Detail)}>pm10</div>
      {pm10Detail ? <div className="grid-item" id="pm10-detail">pm10-detail</div> : null}
      <div className="grid-item" id="pm25" onClick={()=>showDetail('pm25Detail', pm25Detail, setPm25Detail)}>pm25</div>
      {pm25Detail ? <div className="grid-item" id="pm25-detail">pm25-detail</div> : null}
    </div>
  );
};

export default Data;
