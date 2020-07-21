#include <SoftwareSerial.h>

#include <dht.h>
#define DHT22PIN 4
dht DHT22;

#define DEBUG true
String ssid = "PLAY_ONLINE_2212";
String password = "Zacisze1a5";

String server = "192.168.0.105";
String port = "5000";

SoftwareSerial EspSerial(2, 3); // RX, TX

void setup()
{
    Serial.begin(9600);
    EspSerial.begin(9600);
    String conecting = "AT+CWJAP_CUR=\"" + ssid + "\",\"" + password + "\"\r\n";

    sendData("AT\r\n", 1000, DEBUG); //status
    //sendData("AT+CWLAP\r\n",5000,DEBUG); // lists all available APs.
    sendData(conecting, 4000, DEBUG);
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

    String test = "AT+CIPSTART=\"TCP\",\"" + server + "\"," + port + "\r\n";
    // sendData(test,2000,DEBUG);

    delay(10000);
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