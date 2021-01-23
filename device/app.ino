#include <LowPower.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <SoftwareSerial.h>

//dev
#include <MemoryUsage.h>

//------------------System configuration--------------------------
/*If DEBUG is true, it prints answers from the modem to Serial*/
#define DEBUG true
/*If GSM is true, connect via GSM/GPRS, if false, connect via WiFi*/
#define GSM_MODE true
//Server info
const char server[] PROGMEM = {"my-application-address.com"};
int port = 80;
const char url[] PROGMEM = {"/post"};
//Wi-Fi
const char ssid_WiFI[] PROGMEM = {"my_wifi_ssid"};
const char password_WiFI[] PROGMEM = {"my_wifi_password"};
//GPRS APN - PLAY
const char gprs_apn[] PROGMEM = {"\"INTERNET\""};
//device info
const char device_name[] PROGMEM = {"my_device_name"};
const char server_password[] PROGMEM = {"my_device_password"};
//device height above sea level in in meters for calculating relative pressure
int height_above_sea_level = 80;
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
const char sleep_gsm[] PROGMEM = {"AT+CSCLK=2"};
const char wake_up_gsm[] PROGMEM = {"AT+CSCLK=0"};

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

byte deviceId1 = 0xFF;
byte deviceId2 = 0xFF;

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
#define WIFIPOWER 9

#define ARRAY_SIZE 14
#define ARRAY_WASTE 4

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
Adafruit_BME280 bme;
// Create SoftwareSerial object
SoftwareSerial WWWSerial(WWW_PIN_RX, WWW_PIN_TX);
SoftwareSerial serialSDS(SDS_PIN_RX, SDS_PIN_TX);

void setup()
{

    analogReference(EXTERNAL);
    pinMode(WIFIPOWER, OUTPUT);
    digitalWrite(WIFIPOWER, LOW);

    bme.begin(0x76);
    Serial.begin(9600);
    WWWSerial.begin(9600);
    serialSDS.begin(9600);
    delay(15000);
    SetToQueryModeSDS();
    SleepSDS();
    sleepGSM(1000);
}

void loop()
{
    serialSDS.listen();
    WakeUpSDS();
    delay(35000);
    dataSDSquery();
    SleepSDS();

    WWWSerial.listen();
    if (DEBUG)
    {
        memoryCheck();
    }

    readSensors();

    if (GSM_MODE)
    {
        wakeUpGSM(1000);
        testGSM(1000);
        GSM_location(2000);
        startTCPconnectionGSM(2000);
        sendOverTCP(2000);
        sendData(readFromFlash(cip_exit_config) + r + n, 1000, DEBUG);
        wakeUpGSM(1000);
        sleepGSM(1000);
    }
    else
    {
        powerWiFiOn(true);
        resetWiFi(2000);
        connectWiFi(7000);
        startTCPconnection(1000);
        sendOverTCP(2000);
        powerWiFiOn(false);
    }
    for (int i = 0; i < 409; i++)
    {
        LowPower.idle(SLEEP_8S, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_OFF,
                      SPI_OFF, USART0_OFF, TWI_OFF);
        delay(50);
    }
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
void sleepGSM(int timeout)
{
    sendData(readFromFlash(sleep_gsm) + r + n, timeout, DEBUG);
}
void wakeUpGSM(int timeout)
{
    sendData(readFromFlash(handshake) + r + n, timeout, DEBUG);
    sendData(readFromFlash(wake_up_gsm) + r + n, timeout, DEBUG);
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
void powerWiFiOn(boolean on)
{
    if (on)
    {
        digitalWrite(WIFIPOWER, HIGH);
        delay(2000);
    }
    else
    {
        digitalWrite(WIFIPOWER, LOW);
        delay(2000);
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

    // temperature - 0; humidity - 2; pressure - 1; uv - 3; battery - 4;
    temperature = average(0);
    humidity = average(2);
    pressure = average(1);
    uv = average(3);
    battery = average(4);
}

// temperature - 0; humidity - 2; pressure; uv - 3; battery - 4;
float average(byte value)
{

    float data_array[ARRAY_SIZE];
    // reads
    for (int i = 0; i < ARRAY_SIZE; i++)
    {
        switch (value)
        {
        case 0:
            data_array[i] = bme.readTemperature();
            break;
        case 2:
            data_array[i] = bme.readHumidity();
            break;
        case 3:
            data_array[i] = readUV();
            break;
        case 4:
            data_array[i] = readBattery();
            break;
        case 1:
            float pressure_real = (bme.readPressure() / 100.0F);
            data_array[i] = pressure_real + (height_above_sea_level / (8000 * ((1 + (0.004 * temperature)) / pressure_real)));
            break;
        }
        delay(100);
    }

    //sort
    sort(data_array, ARRAY_SIZE);

    float result = 0;
    for (int i = (ARRAY_WASTE / 2); i < ARRAY_SIZE - (ARRAY_WASTE / 2); i++)
    {
        result = result + data_array[i];
    }
    result = result / (ARRAY_SIZE - (ARRAY_WASTE));

    return result;
}
void sort(float a[], int size)
{
    for (int i = 0; i < (size - 1); i++)
    {
        for (int o = 0; o < (size - (i + 1)); o++)
        {
            if (a[o] > a[o + 1])
            {
                float t = a[o];
                a[o] = a[o + 1];
                a[o + 1] = t;
            }
        }
    }
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
//------Dust sensor functions---------------------------------------------------
void QueryModeSDS()
{
    sendSDS(0x02, false, false);
}
void SetToQueryModeSDS()
{
    sendSDS(0x02, true, true);
}
void SetToActiveModeSDS()
{
    sendSDS(0x02, true, false);
}
void QuerySleepSDS()
{
    sendSDS(0x06, false, false);
}
void SleepSDS()
{
    sendSDS(0x06, false, true);
}
void WakeUpSDS()
{
    sendSDS(0x06, true, true);
}
void dataSDSquery()
{
    sendSDS(0x04, false, false);
    Serial.println(pm25);
    Serial.println(pm10);
}
void sendSDS(byte commandId, boolean condition, boolean activeMode)
{
    byte SDS_cmd[] = {0xAA, 0xB4, commandId, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, deviceId1, deviceId2, 0x00, 0xAB};
    switch (commandId)
    {
    case (0x02): //set data mode
        if (condition)
        { // condition - true - set, false - query
            SDS_cmd[3] = 0x01;
        }
        if (activeMode)
        { // activeMode - true - active , false - query
            SDS_cmd[4] = 0x01;
        }
        break;
    case (0x06): //sleep -wakeup
        if (activeMode)
        { // activeMode - true - - active , false - query
            SDS_cmd[3] = 0x01;
        }
        if (condition)
        { // condition - true - wake up, false - sleep
            SDS_cmd[4] = 0x01;
        }
        break;
    }

    int checksum = 0;
    for (int i = 2; i <= 16; i++)
    {
        checksum = checksum + SDS_cmd[i];
    }
    checksum = checksum % 0x100;
    SDS_cmd[17] = checksum;

    if (DEBUG)
    {
        for (int i = 0; i < 19; i++)
        {
            Serial.print(SDS_cmd[i], HEX);
            Serial.print(" ");
        }
        Serial.println(" ");
    }
    byte b;
    int len = 0;
    int value;
    int pm10_serial = 0;
    int pm25_serial = 0;
    delay(100);
    serialSDS.write(SDS_cmd, sizeof(SDS_cmd));
    delay(100);
    while (serialSDS.available() > 0)
    {
        b = serialSDS.read();
        value = int(b);

        if (DEBUG)
        {
            Serial.print(String(value, HEX) + " ");
        }
        if (commandId == 0x04)
        {
            switch (len)
            {
            case (2):
                pm25_serial = value;
                break;
            case (3):
                pm25_serial = pm25_serial + (value << 8);
                break;
            case (4):
                pm10_serial = value;
                break;
            case (5):
                pm10_serial = pm10_serial + (value << 8);
                break;
            }
        }
        len++;
    }
    if (DEBUG)
    {
        Serial.println("");
    }
    if (commandId == 0x04)
    {
        pm10 = (float)pm10_serial / 10.0;
        pm25 = (float)pm25_serial / 10.0;
    }
}