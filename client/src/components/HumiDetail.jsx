import React from "react";
import Chart from "./Chart";

const HumiDetail = () => {
  return (
      <div className="grid-item" id="humi-detail">
        <Chart dataType={'humidity'} title={"Humidity Detail"}/>
      </div>
  );
};

export default HumiDetail;