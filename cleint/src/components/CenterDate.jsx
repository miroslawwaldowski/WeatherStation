import React, { useState, useEffect } from "react";
import CardTitle from "./CardTitle";
import DeviceForm from "./DeviceForm";

const batteryCapacity = (minV, maxV, V) => 
{var x = (parseFloat(V) - parseFloat(minV))/((parseFloat(maxV)-parseFloat(minV))/100);
	if (x<1){x=1}
	if (x>100) {x=100}
return Math.round(x)
}

const CenterDate = (props) => {
  const [options, setOptions] = useState();
  const [loading, setLoading] = useState(false);
  const [addDeviceForm, setAddDeviceForm] = useState(false);
  const [selectRender, setSelectRender] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const response = await fetch("http://192.168.0.105:5000/devices");
      const jsonData = await response.json();
      setOptions(jsonData);
      setLoading(false);
    };
    getData();
  }, [selectRender]);

  return (
    <div className="center-date-container">
      {addDeviceForm ? (
        <DeviceForm setAddDeviceForm={(value) => setAddDeviceForm(value)} setSelectRender={(value) => setSelectRender(value)} />
      ) : (
        <>
          <div className="center-half-container" onClick={props.onClick}>
            <CardTitle title={"Battery"} />
            <div className="center-data-container">
              <p>
                {props.dataset === undefined
                  ? "no data"
                  : props.loading
                  ? "loading"
                  : props.dataset.hasOwnProperty("id")
                  ? props.data === null
                    ? "no data"
                    : batteryCapacity(3200,4200,props.data)+" %"
                  : "no data"}
              </p>
            </div>
          </div>
          <div className="center-half-container">
            <CardTitle title={"Device"} />
            <div className="center-data-container">
              <>
                {options === undefined ? (
                  "no data"
                ) : loading ? (
                  "loading"
                ) : ( selectRender ? 
                  <select
                    onChange={(e) => props.setDeviceId(e.currentTarget.value)}
                    defaultValue={props.deviceId}
                  >
                    {options.map((option) => (
                      <option value={option.id} key={option.id}>
                        {option.name_device}
                      </option>
                    ))}
                  </select> :null
                )}<br />
                <button className="btn" onClick={() => {setSelectRender(false);setAddDeviceForm(true)}}>
                  Add Device
                </button>
              </>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CenterDate;
