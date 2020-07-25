#include <SoftwareSerial.h>

#include <dht.h>
#define DHT22PIN 4
dht DHT22;

#define DEBUG true

String ssid = "*********";
String password = "*********";

String device_name = "*********";
String server_password = "*********";

String server = "*********";
String port = "5000";
String url = "/post";

SoftwareSerial EspSerial(2, 3); // RX, TX

void setup()
{
    Serial.begin(9600);
    EspSerial.begin(9600);

    sendData("AT+RST\r\n", 2000, DEBUG); //restart

    String conecting = "AT+CWJAP_CUR=\"" + ssid + "\",\"" + password + "\"\r\n";
    sendData(conecting, 6000, DEBUG);
}

void loop()
{

    int check = DHT22.read(DHT22PIN);
    float temperature;
    float humidity;

    switch (check)
    {
    case DHTLIB_OK:
        temperature = DHT22.temperature;
        humidity = DHT22.humidity;
        Serial.print("Humidity (%): ");
        Serial.print(humidity);
        Serial.print(" Temperature: ");
        Serial.println(temperature);
        break;
    case DHTLIB_ERROR_CHECKSUM:
        Serial.println("checksum error");
        break;
    case DHTLIB_ERROR_TIMEOUT:
        Serial.println("timeout error");
        break;
    default:
        Serial.println("unknown error");
        break;
    }

    String cmd = "AT+CIPSTART=\"TCP\",\"" + server + "\"," + port + "\r\n";
    sendData(cmd, 1000, DEBUG);
    String JSONdata = "{\"temperature\":" + String(temperature) + ",\"humidity\":" + String(humidity) + ",\"name\":\"" + device_name + "\",\"password\":\"" + server_password + "\"}";
    String postcmd = "POST " + url + " HTTP/1.1\r\nHost: " + server + ":" + port + "\r\n" +
                     "Accept: *" + "/" + "*\r\nContent-Length: " + JSONdata.length() + "\r\n" +
                     "Content-Type: application/json;charset=UTF-8\r\n\r\n" + JSONdata;

    sendData("AT+CIPSEND=" + String(postcmd.length()) + "\r\n", 1000, DEBUG);
    sendData(postcmd, 2000, DEBUG);

    delay(60000);
}

String sendData(String command, int timeout, boolean debug)
{
    String response = "";
    EspSerial.print(command); // Send the command to the ESP8266
    unsigned long time = millis();
    while ((time + timeout) > millis()) // ESP8266 will wait for some time for the data to receive
    {
        while (EspSerial.available()) // Checking whether ESP8266 has received the data or not
        {
            char c = EspSerial.read(); // Read the next character.
            response += c;             // Storing the response
        }
    }
    if (debug)
    {
        Serial.print(response); // Printing the response on the serial monitor.
    }
    return response;
}