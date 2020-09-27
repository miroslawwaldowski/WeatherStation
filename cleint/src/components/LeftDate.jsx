import React from "react";
import CardTitle from "./CardTitle";

const LeftDate = (props) => {
  return (
    <div className="left-date-container" onClick={props.onClick}>
      <CardTitle title={"Date and Time"} />
      <div className="left-data-container">
        <p>
          {props.dataset === undefined
            ? "no data"
            : props.loading
            ? "loading"
            : props.dataset.hasOwnProperty("id")
            ? props.data === null
              ? "no data"
              : new Date(props.data).toLocaleDateString() +
              "\n" + 
              new Date(props.data).toLocaleTimeString()
            : "no data"}
        </p>
      </div>
    </div>
  );
};

export default LeftDate;
