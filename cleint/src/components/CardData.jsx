import React from "react";

const CardData = (props) => {
  return (
    <div className="data-container">
      <p>
        {props.dataset === undefined
          ? "no data"
          : props.loading
          ? "loading"
          : props.dataset.hasOwnProperty("id")
          ? props.data === null
            ? "no data"
            : props.data + props.unit
          : "no data"}
      </p>
    </div>
  );
};

export default CardData;
