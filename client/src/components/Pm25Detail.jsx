import React from 'react'
import Chart from "./Chart";

const Pm25Detail = () => {
    return (
        <div className="grid-item" id="pm25-detail">
        <Chart dataType={"pm25"} title={"PM 25 Detail"}/>
      </div>
    )
}

export default Pm25Detail
