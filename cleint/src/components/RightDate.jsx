import React from "react";
import CardTitle from "./CardTitle";

const DisplayLocation = (latitude, longitude) => {
  let latitudeLeter = "";
  let longitudeLeter = "";
  if (latitude.slice(0, 1) === "-") {
    latitudeLeter = "S";
    latitude = latitude.slice(1, latitude.length);
  } else {
    latitudeLeter = "N";
  }
  if (longitude.slice(0, 1) === "-") {
    longitudeLeter = "W";
    longitude = longitude.slice(1, longitude.length);
  } else {
    longitudeLeter = "E";
  }
  return (
    latitude.slice(0, latitude.length - 5) +
    String.fromCharCode(176) +
    latitude.slice(latitude.length - 4, latitude.length - 2) +
    String.fromCharCode(8242) +
    latitude.slice(latitude.length - 2, latitude.length) +
    String.fromCharCode(8243) +
    latitudeLeter +
    "\n" +
    longitude.slice(0, longitude.length - 5) +
    String.fromCharCode(176) +
    longitude.slice(longitude.length - 4, longitude.length - 2) +
    String.fromCharCode(8242) +
    longitude.slice(longitude.length - 2, longitude.length) +
    String.fromCharCode(8243) +
    longitudeLeter
  );
};

const RightDate = (props) => {
  return (
    <div className="right-date-container" onClick={props.onClick}>
      <CardTitle title={"Location"} />
      <div className="right-data-container">
        <p>
          {props.dataset === undefined
            ? "no data"
            : props.loading
            ? "loading"
            : props.dataset.hasOwnProperty("id")
            ? props.data.latitude === null
              ? "no data"
              : DisplayLocation(props.data.latitude, props.data.longitude)
            : "no data"}
        </p>
      </div>
    </div>
  );
};

export default RightDate;
