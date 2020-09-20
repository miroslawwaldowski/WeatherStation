import React, {useState,useEffect} from "react";
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


// rerender map

  useEffect(() => {
    const handleResize = () => {

      setViewport({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        zoom: 10,
        height: "100%",
        width: "100%"
      })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)}
  })

  

  return (
   <div className="map-parent-container">
    <div className="map-child-container">
    <div className="titel-container">Location Details</div>
    <div className="map-container">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/obywatel007/ckf8e6y3j5f8619pfcynpryqx"
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
   </div>
  );

};

export default Map;
