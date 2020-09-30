import React from "react";
import Map from "./Map";

const DateDetail = (props) => {
  return (
    <div className="grid-item" id="date-detail">
      <Map
        data={{
          latitude: props.data === null ? null : props.data.latitude,
          longitude: props.data === null ? null : props.data.longitude,
        }}
      />
    </div>
  );
};

export default DateDetail;
