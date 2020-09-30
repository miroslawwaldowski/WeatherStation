import React from 'react'
import Chart from "./Chart";

const UVDetail = () => {
    return (
        <div className="grid-item" id="uv-detail">
        <Chart dataType={"uv"} title={"UV Detail"}/>
      </div>
    )
}

export default UVDetail
