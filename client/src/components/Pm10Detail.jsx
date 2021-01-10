import React from 'react'
import Chart from "./Chart";

const Pm10Detail = () => {
    return (
        <div className="grid-item" id="pm10-detail">
        <Chart dataType={"pm10"} title={"PM 10 Detail"}/>
      </div>
    )
}

export default Pm10Detail
