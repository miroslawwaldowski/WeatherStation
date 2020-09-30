import React from "react";
import Chart from "./Chart";

const PressureDetail = () => {
  return (
    <div className="grid-item" id="press-detail">
      <Chart dataType={"pressure"} title={"Pressure Detail"}/>
    </div>
  );
};

export default PressureDetail;
