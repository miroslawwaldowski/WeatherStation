import React from "react";

export const MapCircleOverlay = (props) => {
  const size = ((props.zoom * props.zoom) / 5).toFixed(2) + "vh";
  const style = {
    width: size,
    height: size,
  };
  return (
    <>
      {props.marker ? <div className="map-marker" style={style}></div> : null}
    </>
  );
};
