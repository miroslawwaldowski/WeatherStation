# Stacja Pogodowa Wi-Fi/GSM

Widok aplikacji             |  Widok urządzenia
:-------------------------:|:-------------------------:
![main app](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/00.jpg) |  ![final view](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/10.jpg)

## Wstęp
Projekt stacji pogodowej realizowany w ramach Projektu Inżynierskiego na Wydziale Matematyki i Informatyki Uniwersytetu im. Adama Mickiewicza w Poznaniu. Celem jest stworzenie stacji pogodowej opartej na 8-bitowym mikrokontrolerze wraz z aplikacją www do zbierania oraz prezentowania danych. Stacja będzie posiadać czujniki temperatury, wilgotności, ciśnienia oraz jakości powietrza.
## Zawartość

<p align="center">

folder/pliki           |  opis
:-------------------------:|:-------------------------:
Tests/ |	Testy oraz wyniki
Weather_Station_3D_Model/	| Model 3d
Weather_Station_STL_file/	| Pliki do druku 3d
Weather_Station_Visualisation/	| Wizualizacja 3d
Weather_Station_Assembly_Images/	| Zdjęcia montażu urządzenia
Weather_Station_Wiring_Diagrams/	| Schematy blokowy oraz połączeń
client/	| Aplikacja internetowa React
db/	| Schemat danych bazy danych oraz połączenie
device/	| Oprogramowanie urządzenia
index.js, app.js	| Aplikacja serwerowa Node JS

</p>

## Urządzenie

### Elementy składowe
*	płyta Arduino Nano
*	moduł łączności:
    * GSM - SIM800L EVB lub  
    * WiFi - Wemos D1 Mini
*	płyta Arduino Nano
*	czujnik temperatury, wilgotności oraz ciśnienia BME280
*	czujnik pyłu Nova Fitness SDS011
*	czujnik UV GUVA-S12SD
*	konwerter poziomów logicznych 3,3V/5V
*	panel fotowoltaiczny 6V/1A
*	tranzystor bipolarny NPN np. 2N2222
*	dioda Schottky np. 1N5822
*	przetwornica napięcia step-up MT3608
*	ładowarka Li-Pol TP4056 z zabezpieczeniami
*	2 x ogniwo 18650 Li-Ion
*	Kondensator 4700uF
*	Płytka uniwersalna dwustronna

## Uwagi do elementów urządzenia

Moduł SIM800L EVB: z powodu wysokiego chwilowego poboru prądu podczas nawiązywania połączenia z siecią GSM, należy dolutować do modułu kondensator o pojemności co najmniej 2000uF( zdjęcie poniżej).  Dodatkowo moduł powinien posiadać wersje  oprogramowania układowego [1418B05SIM800L24](https://letmeknow.fr/blog/wp-content/uploads/2018/01/1418B05SIM800L24.zip). Instrukcja aktualizacji oprogramowania jest pod [tym adresem](http://www.raviyp.com/learn-how-to-update-the-firmware-of-your-sim800-modules/). 

<p align="center">
  <img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/11.jpg" width="300" title="SIM800L">
</p>

Moduł Wemos D1 Mini – prędkość przesyłu danych komunikacji szeregowej musi być ustawiona na 9600. Zmianę można dokonać poprzez komendę `AT+CIOBAUD=9600`.

## Schematy połączeń
![Wiring Power](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Wiring_Power.png)
![Wiring_Data](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Wiring_Data.png)

## Montaż elementów urządzenia

Zdjęcie zmontowanych elementów na płytce uniwersalnej zgodnie ze schematami połączeń
<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/05.jpg" width="600" title="">
</p>

montaż anteny         |  montaż baterii
:-------------------------:|:-------------------------:
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/01.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/02.jpg)
montaż ładowarki Li-Po            |  montaż przetwornicy napięcia
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/03.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/04.jpg)
montaż płytki z zamontowanymi elementami              |  montażczujnika UV
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/06.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/07.jpg)
mpntaż panelu fotowoltaicznego            |  Widok urządzenia
![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/09.jpg) |  ![](https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Assembly_Images/10.jpg)


## Oprogramoowanie
### Schemat blokowy

<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/Weather_Station_Wiring_Diagrams/Weather_Station_Block_Diagram_Pl.png" width="600" title="">
</p>

### Relacyjna baza danych PostgreSQL
diagram związków encji ERD

<p align="center">
<img src="https://github.com/miroslawwaldowski/WeatherStation/blob/master/db/ERD.jpg" width="600" title="">
</p>

W pliku `database.sql` znajdują się polecenia sql generowania bazy danych.
Przykład instalacja bazy danych na serwerze ElephantSQL znajduje się pod [tym linkiem](https://www.learmoreseekmore.com/2020/09/postgresql-elephantsql-cloudserv.html).

## Mapbox Token

Aby poprawnie wyświetlały się w aplikacji mapy z lokalizacją urządzenia należy uzyskać token z serwisu Mapbox. W tym celu należy założyć darmowe konto w serwisie [https://www.mapbox.com/](https://www.mapbox.com/).
Po rejestracji w zakładce „Account” widoczny będzie nasz token, który będzie potrzebny do konfiguracji aplikacji React.

## Instalacja oprogramowania  aplikacji React oraz serwera Node js na przykładzie instalacji na platformie chmurowej Heroku.

W pierwszej kolejności należy sklonować repozytorium  
`$ git clone https://github.com/miroslawwaldowski/WeatherStation`  
Następnie założyć konto w serwisie [https://www.heroku.com/](https://www.heroku.com/) oraz zainstalować [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line).  
Po instalacji należy przejść do głównego folderu aplikacji i zalogować się do serwisu  
`$ heroku login`  
Aplikację na serwerze tworzy się poleceniem  
`$ heroku create example`  
Gdzie example to nazwa naszej aplikacji. Aplikacja dostępna będzie pod adresem https://example.herokuapp.com/
Dodajemy zdalne repozytorium Herocku poleceniem   
`$ heroku git:remote -a example`  
Gdzie example to nazwa naszej aplikacji  
Na końcu zatwierdzamy zmiany i wysyłamy  
`$ git add .`  
`$ git commit -am "version 1.0"`  
`$ git push heroku master`  
Po wykonaniu czynności aplikacja powinna się zainstalować w serwisie.  

## Zmienne środowiskowe dla aplikacji:

`DB_DATABASE=nazwa bazy danych`  
`DB_HOST=serwer bazy danych`  
`DB_PASSWORD=hasło do bazy danych`  
`DB_PORT=port do bazy danych`  
`DB_USER=użytkownik bazy danych`  
`REACT_APP_MAPBOX_TOKEN= token z serwisu Mapbox` 

## Instalacja oprogramowania na Andruino Nano.

Przed instalacją oprogramowania należy doinstalować do Arduino IDE biblioteki 
[LowPower](https://github.com/rocketscream/Low-Power) oraz [Adafruit_BME280_Library](https://github.com/adafruit/Adafruit_BME280_Library) oraz skonfigurować kod źródłowy `device/app.ino` :


/*Jeśli GEBUG ustawione jest na true, wyświetla komunikaty ma monitorze portu szeregowego */  
`#define DEBUG true`  
/*jeśli GSM ustawione jest na true, łączy się poprzez GSM/GPRS, jeśli false, łączy siępoprzez WiFi*/  
`#define GSM_MODE true`  
//konfiguracja adresu aplikacji oraz portu  
`const char server[] PROGMEM = {"twoja-aplikacja.com"};`  
`int port = 80;`  
// konfiguracja  Wi-Fi  
`const char ssid_WiFI[] PROGMEM = {"TWOJA_NAZWA_SSID"};`  
`const char password_WiFI[] PROGMEM = {"TWOJE_HASLO_DO WIFI"};`  
// konfiguracja  APN GPRS sieci komórkowej  - PLAY  
`const char gprs_apn[] PROGMEM = {"\"INTERNET\""};`  
//konfiguracja danych tego urządzenia  
`const char device_name[] PROGMEM = {"WLASNA_NAZWA_URZADZENIA"};`  
`const char server_password[] PROGMEM = {"WLASNE_HASLO_URZADZENIA"};`  
//wysokość urządzenia nad poziomem morza do obliczania ciśnienia względnego  
`int height_above_sea_level = 80;`  

## Konfiguracja końcowa.

Po instalacji oprogramowania na płytce arduino należy dodać do aplikacji internetowej skonfigurowane wcześniej urządzenie poprzez wejście na stronę swojej aplikacji i kliknięciu przycisku `add new device`.  W formularzu który się pojawi należy wpisać dokładnie taką nazwę urządzenia oraz hasło jakie zostały podane w konfiguracji danych urządzenia.


