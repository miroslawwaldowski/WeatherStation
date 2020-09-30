import React, { useState } from "react";
import CardTitle from "./CardTitle";

const DeviceForm = (props) => {
  const [device, setDevice] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasword, setConfirmPasword] = useState("");

  const handleNameChange = (e) => setDevice(e.currentTarget.value);
  const handlePasswordChange = (e) => setPassword(e.currentTarget.value);
  const handleConfirmPaswordChange = (e) =>
    setConfirmPasword(e.currentTarget.value);

  const sendData = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: device, password: password }),
    };

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/devices`,
      requestOptions
    );

    const jsonData = await response.json();
    if (jsonData.message === "Device exists") {
      alert("Device exists");
      clearForm();
    } else if (jsonData.message === "Device added successfully") {
      alert("Device added successfully");
      clearForm();
      props.setAddDeviceForm(false);
      props.setSelectRender(true); 
    } else {
      alert("Unknown error");
      clearForm();
    }
  };

  const clearForm = () => {
    setDevice("");
    setPassword("");
    setConfirmPasword("");
  };

  const handleSubmit = () => {
    if (device === "") {
      alert("Incorrect device name");
    } else if (password === "") {
      alert("Incorrect password");
    } else if (password !== confirmPasword) {
      alert("Incorrect confirme password");
    } else {
      sendData();
    }
  };

  return (
    <div className="device-form-data-container-wrapper">
      <CardTitle title={"Add Device"} />
      <div className="device-form-data-container">
        <input
          type="text"
          name="device"
          value={device}
          placeholder={"Device name"}
          onChange={handleNameChange}
        />
        <br />
        <input
          type="password"
          name="password"
          value={password}
          placeholder={"Password"}
          onChange={handlePasswordChange}
        />
        <br />
        <input
          type="password"
          name="confirm_pasword"
          value={confirmPasword}
          placeholder={"Confirme password"}
          onChange={handleConfirmPaswordChange}
        />
        <br />
        <button className="btn" id="btn-device2" onClick={handleSubmit}>
          Add
        </button>
        <button className="btn" id="btn-device2" onClick={() => {props.setSelectRender(true); props.setAddDeviceForm(false)}}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeviceForm;
