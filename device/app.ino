#include <Wire.h>
#include <cactus_io_BME280_I2C.h>
#include <NovaSDS011.h>
#include <SoftwareSerial.h>

//dev
#include <MemoryUsage.h>

//------------------System configuration--------------------------
/*If DEBUG is true, it prints answers from the modem to Serial*/
#define DEBUG true
/*If GSM is true, connect via GSM/GPRS, if false, connect via WiFi*/
#define GSM_MODE true
//Server info
const char server[] PROGMEM = {"mwa-weather-station.herokuapp.com"};
int port = 80;
const char url[] PROGMEM = {"/post"};
//Wi-Fi
const char ssid_WiFI[] PROGMEM = {"PLAY_ONLINE_2212"};
const char password_WiFI[] PROGMEM = {"Zacisze1a5"};
//GPRS APN - PLAY
const char gprs_apn[] PROGMEM = {"\"INTERNET\""};
//device info
const char device_name[] PROGMEM = {"prototyp"};
const char server_password[] PROGMEM = {"haslo"};
//---------------------------------------------------------------

//AT Commands WIFI
const char reset_WiFi[] PROGMEM = {"AT+RST"};
const char connecting_WiFi[] PROGMEM = {"AT+CWJAP_CUR=\""};

//AT Commands GSM
const char handshake[] PROGMEM = {"AT"};
const char signal_test[] PROGMEM = {"AT+CSQ"};
const char network_test[] PROGMEM = {"AT+CREG?"};
const char attach_GPRS[] PROGMEM = {"AT+CGATT=1"};
const char set_bearer_profile[] PROGMEM = {"AT+SAPBR =3,1,CONTYPE,GPRS"};
const char set_bearer_apn[] PROGMEM = {"AT+SAPBR =3,1,APN,"};
const char open_bearer[] PROGMEM = {"AT+SAPBR=1,1"};
const char query_bearer[] PROGMEM = {"AT+SAPBR=2,1"};
const char get_location[] PROGMEM = {"AT+CLBS=1,1"};
const char close_bearer[] PROGMEM = {"AT+SAPBR=0,1"};
const char detach_GPRS[] PROGMEM = {"AT+CGATT=0"};
const char cip_status[] PROGMEM = {"AT+CIPSTATUS"};
const char cip_mux[] PROGMEM = {"AT+CIPMUX=0"};
const char set_PDP[] PROGMEM = {"AT+CGDCONT=1,\"IP\","};
const char cip_apn[] PROGMEM = {"AT+CSTT="};
const char cip_gprs[] PROGMEM = {"AT+CIICR"};
const char cip_ip[] PROGMEM = {"AT+CIFSR"};
const char cip_exit_config[] PROGMEM = {"AT+CIPSHUT"};

//AT Commands TCP
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
const char JSON_latitude[] PROGMEM = {",\"latitude\":"};
const char JSON_longitude[] PROGMEM = {",\"longitude\":"};

//HTML POST header
const char HTML_POST_header_1[] PROGMEM = {"POST "};
const char HTML_POST_header_2[] PROGMEM = {" HTTP/1.1"};
const char HTML_POST_header_3[] PROGMEM = {"Host: "};
const char HTML_POST_header_4[] PROGMEM = {"Content-Type: application/json"};
const char HTML_POST_header_5[] PROGMEM = {"Content-Length: "};

String r = "\r";
String n = "\n";

#define UV A7
#define BATTERY A6
#define SDS_PIN_RX 5
#define SDS_PIN_TX 6
#if GSM_MODE
//SIM800
#define WWW_PIN_RX 8
#define WWW_PIN_TX 7
#else
//ESP
#define WWW_PIN_RX 3
#define WWW_PIN_TX 4
#endif

//measurement data
float temperature;
float humidity;
float pressure;
byte uv;
float pm10;
float pm25;
float latitude;
float longitude;
int battery;

// Create BME280 object
BME280_I2C bme(0x76); // I2C using address 0x76
// Create NovaSDS011 object
NovaSDS011 sds011;
// Create SoftwareSerial object
SoftwareSerial WWWSerial(WWW_PIN_RX, WWW_PIN_TX);

void setup()
{

    analogReference(EXTERNAL);

    bme.begin();
    sds011.begin(SDS_PIN_RX, SDS_PIN_TX);
    Serial.begin(9600);
    WWWSerial.begin(9600);
    Serial.println("end setup");
}

void loop()
{

    if (DEBUG)
    {
        memoryCheck();
    }

    readSensors();

    if (GSM_MODE)
    {
        testGSM(1000);
        GSM_location(2000);
        startTCPconnectionGSM(2000);
        sendOverTCP(2000);
        sendData(readFromFlash(cip_exit_config) + r + n, 1000, DEBUG);
    }
    else
    {
        resetWiFi(2000);
        connectWiFi(7000);
        startTCPconnection(1000);
        sendOverTCP(2000);
    }
    delay(3600000);
}

void sendData(String command, int timeout, boolean debug)
{
    WWWSerial.print(command);
    unsigned long time = millis();
    while ((time + timeout) > millis())
    {
        if (debug)
        {
            while (WWWSerial.available())
            {
                char c = WWWSerial.read();
                delay(1);
                Serial.print(c);
                if (c == '\0')
                    continue;
            }
        }
    }
}

void sendDataAnswer(String command, int timeout, boolean debug)
{
    WWWSerial.print(command);
    unsigned long time = millis();
    String data;
    while ((time + timeout) > millis())
    {
        if (debug)
        {
            while (WWWSerial.available())
            {
                char c = WWWSerial.read();
                delay(1);
                Serial.print(c);
                data = data + c;
                if (c == '\0')
                    continue;
            }
        }
    }
    if (data.charAt(data.indexOf(':') + 2) == '0')
    {
        data = data.substring(data.indexOf(':') + 4, data.lastIndexOf(','));
        latitude = data.substring(data.indexOf(',') + 1).toFloat();
        longitude = data.substring(0, data.indexOf(',')).toFloat();
    }
}

void testGSM(int timeout)
{
    sendData(readFromFlash(handshake) + r + n, timeout, DEBUG);
    sendData(readFromFlash(signal_test) + r + n, timeout, DEBUG);
    sendData(readFromFlash(network_test) + r + n, timeout, DEBUG);
}
void GSM_location(int timeout)
{
    sendData(readFromFlash(close_bearer) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_exit_config) + r + n, timeout, DEBUG);
    sendData(readFromFlash(attach_GPRS) + r + n, timeout, DEBUG);
    sendData(readFromFlash(set_bearer_profile) + r + n, timeout, DEBUG);
    sendData(readFromFlash(set_bearer_apn) + readFromFlash(gprs_apn) + r + n, timeout, DEBUG);
    sendData(readFromFlash(open_bearer) + r + n, timeout, DEBUG);
    sendData(readFromFlash(query_bearer) + r + n, timeout, DEBUG);
    sendDataAnswer(readFromFlash(get_location) + r + n, 2 * timeout, DEBUG);
    sendData(readFromFlash(close_bearer) + r + n, timeout, DEBUG);
}
void startTCPconnectionGSM(int timeout)
{
    sendData(readFromFlash(cip_status) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_mux) + r + n, timeout, DEBUG);
    sendData(readFromFlash(set_PDP) + readFromFlash(gprs_apn) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_apn) + readFromFlash(gprs_apn) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_gprs) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_ip) + r + n, timeout, DEBUG);
    sendData(readFromFlash(cip_status) + r + n, timeout, DEBUG);

    String ATcommand = readFromFlash(start_TCP_connection) + readFromFlash(server) + "\"," + String(port) + r + n;
    sendData(ATcommand, timeout, DEBUG);
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
    sendDataLength = sendDataLength + JSONdataLength_5();

    sendData(readFromFlash(send_over_TCP) + String(sendDataLength) + r + n, timeout, DEBUG);

    //send body in parts
    WWWSerial.print(StringPOSTbody_1());
    WWWSerial.print(StringPOSTbody_2());
    WWWSerial.print(StringPOSTbody_3());
    WWWSerial.print(StringPOSTbody_4());
    WWWSerial.print(StringJSON_1());
    WWWSerial.print(StringJSON_2());
    WWWSerial.print(StringJSON_3());
    WWWSerial.print(StringJSON_4());
    WWWSerial.print(StringJSON_5());
    unsigned long time = millis();
    while ((time + (2 * timeout)) > millis())
    {
        if (DEBUG)
        {
            while (WWWSerial.available())
            {
                char c = WWWSerial.read();
                delay(1);
                Serial.print(c);
                if (c == '\0')
                    continue;
            }
        }
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
    int value = analogRead(BATTERY);
    return (int)(((value * 5.0) / 1024.0) * 1000);
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
    char buff_latitude[10];
    char buff_longitude[10];
    dtostrf(latitude, 4, 4, buff_latitude);
    dtostrf(longitude, 4, 4, buff_longitude);
    String JSONdata =
        readFromFlash(JSON_latitude) + buff_latitude +
        readFromFlash(JSON_longitude) + buff_longitude;
    return JSONdata;
}
String StringJSON_5()
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
int JSONdataLength_5()
{
    return StringJSON_5().length();
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
    int JSONdataLength = (JSONdataLength_1() + JSONdataLength_2() + JSONdataLength_3() + JSONdataLength_4() + JSONdataLength_5());
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