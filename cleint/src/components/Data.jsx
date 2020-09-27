import React, { useState, useEffect } from "react";
import DateDetail from "./DateDetail";
import TempDetail from "./TempDetail";
import HumiDetail from "./HumiDetail";
import CardTitle from "./CardTitle";
import CardData from "./CardData";
import LeftDate from "./LeftDate";
import CenterDate from "./CenterDate";
import RightDate from "./RightDate";

const Data = () => {
  const [dataset, setDataset] = useState({});
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(1);

  const [dateDetail, setDateDetail] = useState(false);
  const [tempDetail, setTempDetail] = useState(false);
  const [humiDetail, setHumiDetail] = useState(false);
  const [pressDetail, setPressDetail] = useState(false);
  const [uvDetail, setUvDetail] = useState(false);
  const [pm10Detail, setPm10Detail] = useState(false);
  const [pm25Detail, setPm25Detail] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const response = await fetch(
        `http://192.168.0.105:5000/?limit=1&device=${deviceId}`
      );
      const [jsonData] = await response.json();
      setDataset(jsonData);
      setLoading(false);
    };
    getData();
  }, [deviceId]);

  const showDetail = (nameVal, val, setVal) => {
    const objectDetail = {
      dateDetail: setDateDetail,
      tempDetail: setTempDetail,
      humiDetail: setHumiDetail,
      pressDetail: setPressDetail,
      uvDetail: setUvDetail,
      pm10Detail: setPm10Detail,
      pm25Detail: setPm25Detail,
    };
    for (var key in objectDetail) {
      if (key === nameVal) {
        setVal(!val);
      } else {
        objectDetail[key](false);
      }
    }
  };

  return (
    <div className="grid-container">
      <div className="grid-item" id="date">
        <LeftDate
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.time_stamp}
          onClick={() => showDetail("dateDetail", dateDetail, setDateDetail)}
        />
        <CenterDate
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.battery}
          setDeviceId={(value) => setDeviceId(value)}
          deviceId={deviceId}
          onClick={() => showDetail("dateDetail", dateDetail, setDateDetail)}
        />
        <RightDate
          dataset={dataset}
          loading={loading}
          data={
            dataset === undefined
              ? null
              : { latitude: dataset.latitude, longitude: dataset.longitude }
          }
          onClick={() => showDetail("dateDetail", dateDetail, setDateDetail)}
        />
      </div>
      {dateDetail ? <DateDetail /> : null}
      <div
        className="grid-item"
        id="temp"
        onClick={() => showDetail("tempDetail", tempDetail, setTempDetail)}
      >
        <CardTitle title={"Temperature"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.temperature}
          unit={" " + String.fromCharCode(176) + "C"}
        />
      </div>
      {tempDetail ? <TempDetail /> : null}
      <div
        className="grid-item"
        id="humi"
        onClick={() => showDetail("humiDetail", humiDetail, setHumiDetail)}
      >
        <CardTitle title={"Humidity"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.humidity}
          unit={" %"}
        />
      </div>
      {humiDetail ? <HumiDetail /> : null}
      <div
        className="grid-item"
        id="press"
        onClick={() => showDetail("pressDetail", pressDetail, setPressDetail)}
      >
        <CardTitle title={"Pressure"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.pressure}
          unit={" hPa"}
        />
      </div>
      {pressDetail ? (
        <div className="grid-item" id="press-detail">
          press-detail
        </div>
      ) : null}
      <div
        className="grid-item"
        id="uv"
        onClick={() => showDetail("uvDetail", uvDetail, setUvDetail)}
      >
        <CardTitle title={"UV Index"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.uv}
          unit={""}
        />
      </div>
      {uvDetail ? (
        <div className="grid-item" id="uv-detail">
          uv-detail
        </div>
      ) : null}
      <div
        className="grid-item"
        id="pm10"
        onClick={() => showDetail("pm10Detail", pm10Detail, setPm10Detail)}
      >
        <CardTitle title={"Air Quality PM 10"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.pm10}
          unit={" µg/m3"}
        />
      </div>
      {pm10Detail ? (
        <div className="grid-item" id="pm10-detail">
          pm10-detail
        </div>
      ) : null}
      <div
        className="grid-item"
        id="pm25"
        onClick={() => showDetail("pm25Detail", pm25Detail, setPm25Detail)}
      >
        <CardTitle title={"Air Quality PM 2.5"} />
        <CardData
          dataset={dataset}
          loading={loading}
          data={dataset === undefined ? null : dataset.pm25}
          unit={" µg/m3"}
        />
      </div>
      {pm25Detail ? (
        <div className="grid-item" id="pm25-detail">
          pm25-detail
        </div>
      ) : null}
    </div>
  );
};

export default Data;
