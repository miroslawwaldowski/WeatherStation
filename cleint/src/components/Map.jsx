import React, { useState} from "react";
import ReactMapGL, { Marker } from "react-map-gl";

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoib2J5d2F0ZWwwMDciLCJhIjoiY2tkdTB6ajQxMDMydDMybDc5bWFzcTk5aSJ9.dKI-i8yyNXg13yfOejJ7KA"; // Set your mapbox token here

const coordinates = { latitude: 52.4, longitude: 16.9,}  

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    zoom: 10,
    width: "100%",
    height: "100%",
  });
  


 return (

 <div className="map-parent-container">
      <div className="map-container">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/obywatel007/ckdu3pkq006h219p7j7cd2lrq"
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
      >
        <Marker latitude={coordinates.latitude} longitude={coordinates.longitude}>
          <div className="map-marker">marker</div>
        </Marker>
      </ReactMapGL>
    </div>
    </div>
  );
};

export default Map;
