# Weather station Wi-Fi / GSM 

Application view            |  Device view
:-------------------------:|:-------------------------:
![main app](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/00.jpg) |  ![final view](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/10.jpg)

## Introduction
The weather station project implemented as part of the Engineering Project at the Faculty of Mathematics and Computer Science of the University of Adam Mickiewicz in Poznań. The goal is to create a weather station based on an 8-bit microcontroller with a web application for collecting and presenting data. The station will have temperature, humidity, pressure, UV index and air quality sensors.
## Content

<p align="center">

folder / files          |  description
:-------------------------:|:-------------------------:
Tests/ |	Tests and results
Weather_Station_3D_Model/	| 3d model
Weather_Station_STL_file/	| 3d printing files
Weather_Station_Visualisation/	| 3d visualization
Weather_Station_Assembly_Images/	| Device assembly photos
Weather_Station_Wiring_Diagrams/	| Block and connections diagrams
client/	| React app
db/	| Database data schema and connection
device/	| Device software
index.js, app.js	| Node JS server

</p>

## Device

### Components
*	Arduino Nano board
*	communication module:
    * GSM - SIM800L EVB or  
    * WiFi - Wemos D1 Mini
*	temperature, humidity and pressure sensor BME280
*	Nova Fitness SDS011 dust sensor
*	UV sensor GUVA-S12SD
*	3.3V / 5V logic level converter
*	6V / 1A photovoltaic panel
*	NPN bipolar transistor, e.g. 2N2222
*	Schottky diode e.g. 1N5822
*	MT3608 step-up voltage converter
*	Li-Pol TP4056 charger with protection
*	2 x 18650 Li-Ion cells
*	4700uF capacitor
*	Universal double sided board

## Notes on device components

* SIM800L EVB module: due to the high instantaneous power consumption when establishing a connection to the GSM network, a capacitor with a capacity of at least 2000uF should be soldered to the module (photo below). Additionally, the module should have the [1418B05SIM800L24 firmware version](https://letmeknow.fr/blog/wp-content/uploads/2018/01/1418B05SIM800L24.zip). Software update instruction [link](http://www.raviyp.com/learn-how-to-update-the-firmware-of-your-sim800-modules/).

<p align="center">
  <img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/11.jpg" width="300" title="SIM800L">
</p>

* Wemos D1 Mini module - the baud rate of serial communication data must be set to 9600. The change can be made with the command  `AT+CIOBAUD=9600`.  
* The MT3608 step-up voltage converter must have the output voltage set to 5V.

## Connection diagrams 
![Wiring Power](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Wiring_Power.png)
![Wiring_Data](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Wiring_Data.png)

## Assembly of device elements

Picture of the assembled elements on the universal board according to the connection diagrams 
<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/05.jpg" width="600" title="">
</p>

The next stages of assembly of elements in the case. The files for printing the case are in the Weather_Station_STL_file folder and the visualization of the arrangement of elements in the Weather_Station_Visualisation folder.


antenna assembly         |  battery assembly
:-------------------------:|:-------------------------:
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/01.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/02.jpg)
assembly of the Li-Po charger            |  voltage converter assembly
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/03.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/04.jpg)
assembly of the plate with mounted elements             |  UV sensor assembly
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/06.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/07.jpg)
installation of a photovoltaic panel            |  Device view
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/09.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/10.jpg)


## Software
### Block diagram

<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Block_Diagram.png" width="600" title="">
</p>

### Relational PostgreSQL database
ERD entity relationship diagram

<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/db/ERD.jpg" width="600" title="">
</p>

`database.sql` file contains commands to generate SQL database.
An example of installing a database on an ElephantSQL server is available at [this link](https://www.learmoreseekmore.com/2020/09/postgresql-elephantsql-cloudserv.html).


## Mapbox Token

In order for maps with the device location to be displayed correctly in the application, you must obtain a token from the Mapbox website.
To do this, create a free account at [https://www.mapbox.com/](https://www.mapbox.com/).
After registering, your token will be visible in the "Account" tab, which will be needed to configure the React application.


## Installation of React application software and Node js server on the example of installation on the Heroku cloud platform

First, you need to clone the repository  
`$ git clone https://github.com/miroslawwaldowski/WeatherStation`  
Then create an account at [https://www.heroku.com/](https://www.heroku.com/) and install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line).  
After installation, go to the main application folder and log in to the Heroku   
`$ heroku login`  
The application on the server is created with the command  
`$ heroku create example`  
Where `example` is the name of our application. The application will be available at https://example.herokuapp.com/  
We add a remote Herock repository with the command   
`$ heroku git:remote -a example`  
Where `example` is the name of our application  
Finally, we approve the changes and send them  
`$ git add .`  
`$ git commit -am "version 1.0"`  
`$ git push heroku master`  
After completing the steps, the application should install on the website.  

## Environment variables for the app:

`DB_DATABASE=database name`  
`DB_HOST=database server`  
`DB_PASSWORD=database password`  
`DB_PORT=port to database`  
`DB_USER=database user`  
`REACT_APP_MAPBOX_TOKEN=token from Mapbox`  


## Installing the software on the Arduino Nano.

Before installing the software, the following libraries should be installed to the Arduino IDE 
[LowPower](https://github.com/rocketscream/Low-Power) and [Adafruit_BME280_Library](https://github.com/adafruit/Adafruit_BME280_Library) and configure the source code of the `device/app.ino` :


/*If DEBUG is true, it prints answers from the modem to Serial monitor*/  
`#define DEBUG true`  
/*If GSM is true, connect via GSM/GPRS, if false, connect via WiFi*/  
`#define GSM_MODE true`  
// configuration of the application address and port  
`const char server[] PROGMEM = {"your-application.com"};`  
`int port = 80;`  
// Wi-Fi configuration  
`const char ssid_WiFI[] PROGMEM = {"YOUR_SSID_NAME"};`  
`const char password_WiFI[] PROGMEM = {"YOUR_PASSWORD_TO_WIFI"};`  
// GPRS APN configuration of the mobile network  
`const char gprs_apn[] PROGMEM = {"\"INTERNET\""};`  
// data configuration of this device  
`const char device_name[] PROGMEM = {"OWN_DEVICE_NAME"};`  
`const char server_password[] PROGMEM = {"OWN_PASSWORD_ DEVICE"};`  
// device height above sea level in in meters for calculating relative pressure  
`int height_above_sea_level = 80;`  

## Final configuration.

After installing the software on the arduino board, the previously configured device should be added to the web application by entering the website of your application and clicking the `add new device` button. In the form that will appear, enter exactly the device name and password that were given in the device data configuration.
