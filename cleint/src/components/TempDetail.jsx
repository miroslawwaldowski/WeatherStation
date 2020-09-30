import React from "react";
import Chart from "./Chart";

const TempDetail = () => {
  return (
      <div className="grid-item" id="temp-detail">
        <Chart dataType={'temperature'} title={"Temperature Detail"}/>
      </div>
  );
};

export default TempDetail;