#include <Wire.h>
#include <cactus_io_BME280_I2C.h>
#include <NovaSDS011.h>
#include <SoftwareSerial.h>

//test libraly
#include <MemoryUsage.h>

#define UV A7
#define BATTERY A6
#define SDS_PIN_RX 5
#define SDS_PIN_TX 6
#define ESP_PIN_RX 3
#define ESP_PIN_TX 4
#define DEBUG true

//Server info example server: mwa-weather-station.herokuapp.com  ; potr: 80; url: /post
const char server[] PROGMEM = {"*********"};
int port = 80;
const char url[] PROGMEM = {"/post"};

//Wi-Fi
const char ssid_WiFI[] PROGMEM = {"*********"};
const char password_WiFI[] PROGMEM = {"*********"};

//device info example device_name: prototyp  ; server_password: haslo
const char device_name[] PROGMEM = {"*********"};
const char server_password[] PROGMEM = {"*********"};

//AT Commands
const char reset_WiFi[] PROGMEM = {"AT+RST"};
const char connecting_WiFi[] PROGMEM = {"AT+CWJAP_CUR=\""};
const char start_TCP_connection[] PROGMEM = {"AT+CIPSTART=\"TCP\",\""};
const char send_over_TCP[] PROGMEM = {"AT+CIPSEND="};

//JSON data
const char JSON_temperature[] PROGMEM = {"{\"temperature\":"};
const char JSON_pressure[] PROGMEM = {",\"pressure\":"};
const char JSON_humidity[] PROGMEM = {",\"humidity\":"};
const char JSON_battery[] PROGMEM = {",\"battery\":"};
const char JSON_pm25[] PROGMEM = {",\"pm25\":"};
const char JSON_pm10[] PROGMEM = {",\"pm10\":"};
const char JSON_uv[] PROGMEM = {",\"uv\":"};
const char JSON_device_name[] PROGMEM = {",\"name\":\""};
const char JSON_server_password[] PROGMEM = {"\",\"password\":\""};

//HTML POST header
const char HTML_POST_header_1[] PROGMEM = {"POST "};
const char HTML_POST_header_2[] PROGMEM = {" HTTP/1.1"};
const char HTML_POST_header_3[] PROGMEM = {"Host: "};
const char HTML_POST_header_4[] PROGMEM = {"Content-Type: application/json"};
const char HTML_POST_header_5[] PROGMEM = {"Content-Length: "};

String r = "\r";
String n = "\n";

//measurement data
float temperature;
float humidity;
float pressure;
byte uv;
float pm10;
float pm25;
float latitude = 52.401;
float longitude = 16.902;
int battery;

// Create BME280 object
BME280_I2C bme(0x76); // I2C using address 0x76
// Create NovaSDS011 object
NovaSDS011 sds011;
// Create SoftwareSerial object
SoftwareSerial EspSerial(ESP_PIN_RX, ESP_PIN_TX);

void setup()
{
    analogReference(EXTERNAL);

    bme.begin();
    sds011.begin(SDS_PIN_RX, SDS_PIN_TX);
    Serial.begin(9600);
    EspSerial.begin(9600);

    resetWiFi(2000);
    connectWiFi(5000);
}

void loop()
{

    memoryCheck();

    readSensors();

    startTCPconnection(1000);

    sendOverTCP(3000);

    delay(100000);
}

void sendData(String command, int timeout, boolean debug)
{
    EspSerial.print(command);
    unsigned long time = millis();
    while ((time + timeout) > millis())
    {
        if (debug)
        {
            while (EspSerial.available())
            {
                char c = EspSerial.read();
                delay(1);
                Serial.print(c);
                if (c == '\0')
                    continue;
            }
        }
    }
}

void connectWiFi(int timeout)
{
    String String_ssid = readFromFlash(ssid_WiFI);
    String String_password = readFromFlash(password_WiFI);
    String String_connecting_WiFi = readFromFlash(connecting_WiFi);
    String ATcommand = String_connecting_WiFi + String_ssid + "\",\"" + String_password + "\"" + r + n;
    sendData(ATcommand, timeout, DEBUG);
}

void resetWiFi(int timeout)
{
    sendData(readFromFlash(reset_WiFi) + r + n, timeout, DEBUG);
}

void startTCPconnection(int timeout)
{
    String ATcommand = readFromFlash(start_TCP_connection) + readFromFlash(server) + "\"," + String(port) + r + n;
    sendData(ATcommand, timeout, DEBUG);
}

void sendOverTCP(int timeout)
{

    int sendDataLength = POSTbodyLength_1();
    sendDataLength = sendDataLength + POSTbodyLength_2();
    sendDataLength = sendDataLength + POSTbodyLength_3();
    sendDataLength = sendDataLength + POSTbodyLength_4();
    sendDataLength = sendDataLength + JSONdataLength_1();
    sendDataLength = sendDataLength + JSONdataLength_2();
    sendDataLength = sendDataLength + JSONdataLength_3();
    sendDataLength = sendDataLength + JSONdataLength_4();

    sendData(readFromFlash(send_over_TCP) + String(sendDataLength) + r + n, timeout, DEBUG);

    //send body in parts
    EspSerial.print(StringPOSTbody_1());
    EspSerial.print(StringPOSTbody_2());
    EspSerial.print(StringPOSTbody_3());
    EspSerial.print(StringPOSTbody_4());
    EspSerial.print(StringJSON_1());
    EspSerial.print(StringJSON_2());
    EspSerial.print(StringJSON_3());
    EspSerial.print(StringJSON_4());
    unsigned long time = millis();
    while ((time + (2 * timeout)) > millis())
    {
        if (DEBUG)
        {
            while (EspSerial.available())
            {
                char c = EspSerial.read();
                delay(1);
                Serial.print(c);
                if (c == '\0')
                    continue;
            }
        }
    }
}

void wait(int timeout)
{
    unsigned long time = millis();
    while ((time + timeout) > millis())
    {
    }
}

String readFromFlash(char stringToRead[])
{
    int k;
    int len_stringToRead = strlen_P(stringToRead);
    char myChar;
    String String_stringToRead;
    for (k = 0; k < len_stringToRead; k++)
    {
        myChar = pgm_read_byte_near(stringToRead + k);
        String_stringToRead = String_stringToRead + myChar;
    }
    return String_stringToRead;
}

void readSensors()
{
    bme.readSensor();
    temperature = bme.getTemperature_C();
    humidity = bme.getHumidity();
    pressure = bme.getPressure_MB();
    uv = readUV();
    battery = readBattery();
    readSDS();
}

byte readUV()
{
    word value = analogRead(UV);
    if (value > 220)
    {
        return 11;
    }
    else if (value > 199)
    {
        return 10;
    }
    else if (value > 180)
    {
        return 9;
    }
    else if (value > 164)
    {
        return 8;
    }
    else if (value > 142)
    {
        return 7;
    }
    else if (value > 124)
    {
        return 6;
    }
    else if (value > 103)
    {
        return 5;
    }
    else if (value > 83)
    {
        return 4;
    }
    else if (value > 65)
    {
        return 3;
    }
    else if (value > 46)
    {
        return 2;
    }
    else if (value > 10)
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

int readBattery()
{
    word value = analogRead(BATTERY);
    return (int)(value * 5000 / 1024);
}

void readSDS()
{

    sds011.queryData(pm25, pm10);
}

String StringJSON_1()
{
    String JSONdata =
        readFromFlash(JSON_temperature) + String(temperature) +
        readFromFlash(JSON_pressure) + String(pressure);
    return JSONdata;
}
String StringJSON_2()
{
    String JSONdata =
        readFromFlash(JSON_humidity) + String(humidity) +
        readFromFlash(JSON_battery) + String(battery);
    return JSONdata;
}
String StringJSON_3()
{
    String JSONdata =
        readFromFlash(JSON_pm25) + String(pm25) +
        readFromFlash(JSON_pm10) + String(pm10) +
        readFromFlash(JSON_uv) + String(uv);
    return JSONdata;
}
String StringJSON_4()
{
    String JSONdata =
        readFromFlash(JSON_device_name) + readFromFlash(device_name) +
        readFromFlash(JSON_server_password) + readFromFlash(server_password) + "\"}";
    return JSONdata;
}

int JSONdataLength_1()
{
    return StringJSON_1().length();
}
int JSONdataLength_2()
{
    return StringJSON_2().length();
}
int JSONdataLength_3()
{
    return StringJSON_3().length();
}
int JSONdataLength_4()
{
    return StringJSON_4().length();
}

String StringPOSTbody_1()
{
    String POSTbody =
        readFromFlash(HTML_POST_header_1) + readFromFlash(url) + //"POST "
        readFromFlash(HTML_POST_header_2) + r + n;               //" HTTP/1.1"
    return POSTbody;
}

String StringPOSTbody_2()
{
    String POSTbody =
        readFromFlash(HTML_POST_header_3) + readFromFlash(server) + r + n; //"Host: "
    return POSTbody;
}
String StringPOSTbody_3()
{
    String POSTbody =
        readFromFlash(HTML_POST_header_4) + r + n; //"Content-Type: application/json"
    return POSTbody;
}
String StringPOSTbody_4()
{
    int JSONdataLength = (JSONdataLength_1() + JSONdataLength_2() + JSONdataLength_3() + JSONdataLength_4());
    String POSTbody =
        readFromFlash(HTML_POST_header_5) + JSONdataLength + r + n + r + n; //"Content-Length: "
    return POSTbody;
}

int POSTbodyLength_1()
{
    return StringPOSTbody_1().length();
}

int POSTbodyLength_2()
{
    return StringPOSTbody_2().length();
}

int POSTbodyLength_3()
{
    return StringPOSTbody_3().length();
}
int POSTbodyLength_4()
{
    return StringPOSTbody_4().length();
}

void memoryCheck()
{
    Serial.println();
    FREERAM_PRINT;
    Serial.println();
}
