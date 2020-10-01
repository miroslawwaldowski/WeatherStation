import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import CardTitle from "./CardTitle";
import { MapCircleOverlay } from "./MapCircleOverlay";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // Set your mapbox token here

const Map = (props) => {
  const [coordinates, setCoordinates] = useState({
    latitude: 52.466705,
    longitude: 16.926906,
    marker: false,
  }); // latitude >=-90 && <=90, longitude >=-180 && <=180,

  const [viewport, setViewport] = useState({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    zoom: 10,
    width: "100%",
    height: "100%",
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        zoom: 10,
        height: "100%",
        width: "100%",
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  useEffect(() => {
    const coor = () => {
      if (props.data.latitude !== null && props.data.longitude !== null) {
        setCoordinates({
          latitude: parseFloat(props.data.latitude),
          longitude: parseFloat(props.data.longitude),
          marker: true,
        });
      } else {
        setCoordinates({
          latitude: 52.466705,
          longitude: 16.926906,
          marker: false,
        });
      }
      setViewport({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        zoom: 10,
        height: "100%",
        width: "100%",
      });
    };
    coor();
  }, [
    props.data.latitude,
    props.data.longitude,
    coordinates.latitude,
    coordinates.longitude,
  ]);

  var myZoom;

  return (
    <div className="map-parent-container">
      <div className="map-child-container">
        <CardTitle title={"Location Details"} />
        <div className="map-container">
          <ReactMapGL
            {...viewport}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/obywatel007/ckf8e6y3j5f8619pfcynpryqx"
            onViewportChange={(viewport) => {
              setViewport(viewport);
            }}
            onStyleLoad={(myZoom = viewport.zoom)}
          >
            <Marker
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
            >
              <MapCircleOverlay zoom={myZoom} marker={coordinates.marker}/>
            </Marker>
          </ReactMapGL>
        </div>
      </div>
    </div>
  );
};

export default Map;
