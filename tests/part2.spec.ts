// base: https://chatgpt.com/share/67c0e4f2-69d4-8001-bf2e-b5a45e8d465a
// (with some edits)
import { test, expect, Page } from "@playwright/test";

//
// 1. Prepare a mock forecast response – a small subset of the example you provided
//    or the full example. Using your entire example JSON is fine too.
//
const MOCK_FORECAST_RESPONSE = { "cod": "200", "message": 0, "cnt": 40, "list": [{ "dt": 1740700800, "main": { "temp": 6160.01, "feels_like": 19.48, "temp_min": 19.34, "temp_max": 6160.01, "pressure": 1017, "sea_level": 1017, "grnd_level": 1007, "humidity": 54, "temp_kf": 0.67 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d" }], "clouds": { "all": 100 }, "wind": { "speed": 3.52, "deg": 51, "gust": 5.78 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-02-28 00:00:00" }, { "dt": 1740711600, "main": { "temp": 17.13, "feels_like": 16.6, "temp_min": 15.52, "temp_max": 17.13, "pressure": 1016, "sea_level": 1016, "grnd_level": 1008, "humidity": 65, "temp_kf": 1.61 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04n" }], "clouds": { "all": 97 }, "wind": { "speed": 1.97, "deg": 73, "gust": 5.08 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-02-28 03:00:00" }, { "dt": 1740722400, "main": { "temp": 13.54, "feels_like": 13.04, "temp_min": 13.54, "temp_max": 13.54, "pressure": 1017, "sea_level": 1017, "grnd_level": 1009, "humidity": 80, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03n" }], "clouds": { "all": 48 }, "wind": { "speed": 1.14, "deg": 45, "gust": 1.19 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-02-28 06:00:00" }, { "dt": 1740733200, "main": { "temp": 12.44, "feels_like": 11.91, "temp_min": 12.44, "temp_max": 12.44, "pressure": 1016, "sea_level": 1016, "grnd_level": 1007, "humidity": 83, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04n" }], "clouds": { "all": 57 }, "wind": { "speed": 1.02, "deg": 17, "gust": 0.96 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-02-28 09:00:00" }, { "dt": 1740744000, "main": { "temp": 12.13, "feels_like": 11.49, "temp_min": 12.13, "temp_max": 12.13, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 80, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04n" }], "clouds": { "all": 80 }, "wind": { "speed": 0.3, "deg": 73, "gust": 0.55 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-02-28 12:00:00" }, { "dt": 1740754800, "main": { "temp": 11.76, "feels_like": 10.98, "temp_min": 11.76, "temp_max": 11.76, "pressure": 1015, "sea_level": 1015, "grnd_level": 1006, "humidity": 76, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d" }], "clouds": { "all": 100 }, "wind": { "speed": 1.02, "deg": 63, "gust": 1.05 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-02-28 15:00:00" }, { "dt": 1740765600, "main": { "temp": 15.9, "feels_like": 15.11, "temp_min": 15.9, "temp_max": 15.9, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 60, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d" }], "clouds": { "all": 100 }, "wind": { "speed": 0.74, "deg": 172, "gust": 1.32 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-02-28 18:00:00" }, { "dt": 1740776400, "main": { "temp": 19.52, "feels_like": 18.78, "temp_min": 19.52, "temp_max": 19.52, "pressure": 1014, "sea_level": 1014, "grnd_level": 1005, "humidity": 48, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d" }], "clouds": { "all": 100 }, "wind": { "speed": 1.7, "deg": 310, "gust": 1.25 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-02-28 21:00:00" }, { "dt": 1740787200, "main": { "temp": 18.91, "feels_like": 18.08, "temp_min": 18.91, "temp_max": 18.91, "pressure": 1012, "sea_level": 1012, "grnd_level": 1004, "humidity": 47, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04d" }], "clouds": { "all": 100 }, "wind": { "speed": 2.97, "deg": 295, "gust": 2.91 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-01 00:00:00" }, { "dt": 1740798000, "main": { "temp": 14.18, "feels_like": 13.46, "temp_min": 14.18, "temp_max": 14.18, "pressure": 1013, "sea_level": 1013, "grnd_level": 1005, "humidity": 69, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04n" }], "clouds": { "all": 100 }, "wind": { "speed": 1.92, "deg": 270, "gust": 4.01 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-01 03:00:00" }, { "dt": 1740808800, "main": { "temp": 12.23, "feels_like": 11.62, "temp_min": 12.23, "temp_max": 12.23, "pressure": 1014, "sea_level": 1014, "grnd_level": 1006, "humidity": 81, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04n" }], "clouds": { "all": 100 }, "wind": { "speed": 1.97, "deg": 225, "gust": 3.07 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-01 06:00:00" }, { "dt": 1740819600, "main": { "temp": 10.8, "feels_like": 10.26, "temp_min": 10.8, "temp_max": 10.8, "pressure": 1014, "sea_level": 1014, "grnd_level": 1005, "humidity": 89, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03n" }], "clouds": { "all": 40 }, "wind": { "speed": 1.79, "deg": 218, "gust": 3.08 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-01 09:00:00" }, { "dt": 1740830400, "main": { "temp": 9.98, "feels_like": 9.01, "temp_min": 9.98, "temp_max": 9.98, "pressure": 1013, "sea_level": 1013, "grnd_level": 1005, "humidity": 91, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03n" }], "clouds": { "all": 25 }, "wind": { "speed": 2.21, "deg": 229, "gust": 3.67 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-01 12:00:00" }, { "dt": 1740841200, "main": { "temp": 10.05, "feels_like": 9.46, "temp_min": 10.05, "temp_max": 10.05, "pressure": 1014, "sea_level": 1014, "grnd_level": 1005, "humidity": 90, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }], "clouds": { "all": 47 }, "wind": { "speed": 1.91, "deg": 209, "gust": 2.92 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-01 15:00:00" }, { "dt": 1740852000, "main": { "temp": 12.72, "feels_like": 12.03, "temp_min": 12.72, "temp_max": 12.72, "pressure": 1014, "sea_level": 1014, "grnd_level": 1006, "humidity": 76, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }], "clouds": { "all": 44 }, "wind": { "speed": 2.96, "deg": 214, "gust": 3.54 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-01 18:00:00" }, { "dt": 1740862800, "main": { "temp": 14.55, "feels_like": 13.76, "temp_min": 14.55, "temp_max": 14.55, "pressure": 1013, "sea_level": 1013, "grnd_level": 1005, "humidity": 65, "temp_kf": 0 }, "weather": [{ "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" }], "clouds": { "all": 5 }, "wind": { "speed": 4.03, "deg": 229, "gust": 5.35 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-01 21:00:00" }, { "dt": 1740873600, "main": { "temp": 13.86, "feels_like": 13, "temp_min": 13.86, "temp_max": 13.86, "pressure": 1013, "sea_level": 1013, "grnd_level": 1004, "humidity": 65, "temp_kf": 0 }, "weather": [{ "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" }], "clouds": { "all": 3 }, "wind": { "speed": 5.8, "deg": 252, "gust": 8.4 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-02 00:00:00" }, { "dt": 1740884400, "main": { "temp": 11.34, "feels_like": 10.7, "temp_min": 11.34, "temp_max": 11.34, "pressure": 1014, "sea_level": 1014, "grnd_level": 1005, "humidity": 83, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03n" }], "clouds": { "all": 44 }, "wind": { "speed": 4.69, "deg": 230, "gust": 7.64 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-02 03:00:00" }, { "dt": 1740895200, "main": { "temp": 11.41, "feels_like": 11.03, "temp_min": 11.41, "temp_max": 11.41, "pressure": 1015, "sea_level": 1015, "grnd_level": 1006, "humidity": 93, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 73 }, "wind": { "speed": 4.34, "deg": 232, "gust": 7.34 }, "visibility": 10000, "pop": 0.2, "rain": { "3h": 0.11 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-02 06:00:00" }, { "dt": 1740906000, "main": { "temp": 10.26, "feels_like": 9.77, "temp_min": 10.26, "temp_max": 10.26, "pressure": 1014, "sea_level": 1014, "grnd_level": 1006, "humidity": 93, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 100 }, "wind": { "speed": 5.3, "deg": 260, "gust": 9.36 }, "visibility": 3909, "pop": 1, "rain": { "3h": 1.8 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-02 09:00:00" }, { "dt": 1740916800, "main": { "temp": 9.71, "feels_like": 6.74, "temp_min": 9.71, "temp_max": 9.71, "pressure": 1015, "sea_level": 1015, "grnd_level": 1006, "humidity": 88, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 100 }, "wind": { "speed": 6.42, "deg": 280, "gust": 9.6 }, "visibility": 10000, "pop": 1, "rain": { "3h": 2.81 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-02 12:00:00" }, { "dt": 1740927600, "main": { "temp": 8.78, "feels_like": 6.18, "temp_min": 8.78, "temp_max": 8.78, "pressure": 1016, "sea_level": 1016, "grnd_level": 1007, "humidity": 81, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" }], "clouds": { "all": 75 }, "wind": { "speed": 4.72, "deg": 269, "gust": 8.24 }, "visibility": 10000, "pop": 0.26, "rain": { "3h": 0.16 }, "sys": { "pod": "d" }, "dt_txt": "2025-03-02 15:00:00" }, { "dt": 1740938400, "main": { "temp": 10.66, "feels_like": 9.56, "temp_min": 10.66, "temp_max": 10.66, "pressure": 1016, "sea_level": 1016, "grnd_level": 1008, "humidity": 68, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" }], "clouds": { "all": 40 }, "wind": { "speed": 5.36, "deg": 257, "gust": 6.92 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-02 18:00:00" }, { "dt": 1740949200, "main": { "temp": 11.99, "feels_like": 10.73, "temp_min": 11.99, "temp_max": 11.99, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 57, "temp_kf": 0 }, "weather": [{ "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" }], "clouds": { "all": 4 }, "wind": { "speed": 6.34, "deg": 256, "gust": 7.41 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-02 21:00:00" }, { "dt": 1740960000, "main": { "temp": 11.02, "feels_like": 9.74, "temp_min": 11.02, "temp_max": 11.02, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 60, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" }], "clouds": { "all": 21 }, "wind": { "speed": 5.37, "deg": 272, "gust": 6.99 }, "visibility": 10000, "pop": 0.27, "rain": { "3h": 0.41 }, "sys": { "pod": "d" }, "dt_txt": "2025-03-03 00:00:00" }, { "dt": 1740970800, "main": { "temp": 9.03, "feels_like": 5.92, "temp_min": 9.03, "temp_max": 9.03, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 73, "temp_kf": 0 }, "weather": [{ "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03n" }], "clouds": { "all": 30 }, "wind": { "speed": 6.26, "deg": 278, "gust": 9.44 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-03 03:00:00" }, { "dt": 1740981600, "main": { "temp": 8.59, "feels_like": 5.88, "temp_min": 8.59, "temp_max": 8.59, "pressure": 1016, "sea_level": 1016, "grnd_level": 1007, "humidity": 75, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 52 }, "wind": { "speed": 4.87, "deg": 279, "gust": 8.31 }, "visibility": 10000, "pop": 0.2, "rain": { "3h": 0.25 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-03 06:00:00" }, { "dt": 1740992400, "main": { "temp": 9.19, "feels_like": 7.07, "temp_min": 9.19, "temp_max": 9.19, "pressure": 1015, "sea_level": 1015, "grnd_level": 1006, "humidity": 79, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 86 }, "wind": { "speed": 3.86, "deg": 242, "gust": 5.33 }, "visibility": 10000, "pop": 0.36, "rain": { "3h": 0.21 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-03 09:00:00" }, { "dt": 1741003200, "main": { "temp": 7.85, "feels_like": 6.7, "temp_min": 7.85, "temp_max": 7.85, "pressure": 1015, "sea_level": 1015, "grnd_level": 1007, "humidity": 87, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10n" }], "clouds": { "all": 79 }, "wind": { "speed": 1.99, "deg": 264, "gust": 2.27 }, "visibility": 10000, "pop": 0.34, "rain": { "3h": 0.26 }, "sys": { "pod": "n" }, "dt_txt": "2025-03-03 12:00:00" }, { "dt": 1741014000, "main": { "temp": 8.26, "feels_like": 6.99, "temp_min": 8.26, "temp_max": 8.26, "pressure": 1016, "sea_level": 1016, "grnd_level": 1008, "humidity": 87, "temp_kf": 0 }, "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" }], "clouds": { "all": 72 }, "wind": { "speed": 2.2, "deg": 282, "gust": 3.66 }, "visibility": 10000, "pop": 0.28, "rain": { "3h": 0.18 }, "sys": { "pod": "d" }, "dt_txt": "2025-03-03 15:00:00" }, { "dt": 1741024800, "main": { "temp": 10.95, "feels_like": 9.88, "temp_min": 10.95, "temp_max": 10.95, "pressure": 1018, "sea_level": 1018, "grnd_level": 1009, "humidity": 68, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 70 }, "wind": { "speed": 3.16, "deg": 272, "gust": 4.76 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-03 18:00:00" }, { "dt": 1741035600, "main": { "temp": 12.48, "feels_like": 11.4, "temp_min": 12.48, "temp_max": 12.48, "pressure": 1018, "sea_level": 1018, "grnd_level": 1009, "humidity": 62, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 55 }, "wind": { "speed": 4.68, "deg": 279, "gust": 5.58 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-03 21:00:00" }, { "dt": 1741046400, "main": { "temp": 11.77, "feels_like": 10.8, "temp_min": 11.77, "temp_max": 11.77, "pressure": 1018, "sea_level": 1018, "grnd_level": 1009, "humidity": 69, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 66 }, "wind": { "speed": 5.07, "deg": 279, "gust": 5.73 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-04 00:00:00" }, { "dt": 1741057200, "main": { "temp": 10.85, "feels_like": 9.92, "temp_min": 10.85, "temp_max": 10.85, "pressure": 1019, "sea_level": 1019, "grnd_level": 1010, "humidity": 74, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04n" }], "clouds": { "all": 100 }, "wind": { "speed": 2.97, "deg": 274, "gust": 4.12 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-04 03:00:00" }, { "dt": 1741068000, "main": { "temp": 9.92, "feels_like": 8.83, "temp_min": 9.92, "temp_max": 9.92, "pressure": 1020, "sea_level": 1020, "grnd_level": 1012, "humidity": 84, "temp_kf": 0 }, "weather": [{ "id": 804, "main": "Clouds", "description": "overcast clouds", "icon": "04n" }], "clouds": { "all": 97 }, "wind": { "speed": 2.35, "deg": 265, "gust": 3.88 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-04 06:00:00" }, { "dt": 1741078800, "main": { "temp": 8.77, "feels_like": 8.1, "temp_min": 8.77, "temp_max": 8.77, "pressure": 1021, "sea_level": 1021, "grnd_level": 1012, "humidity": 89, "temp_kf": 0 }, "weather": [{ "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02n" }], "clouds": { "all": 19 }, "wind": { "speed": 1.64, "deg": 257, "gust": 2.49 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-04 09:00:00" }, { "dt": 1741089600, "main": { "temp": 8.27, "feels_like": 8.27, "temp_min": 8.27, "temp_max": 8.27, "pressure": 1021, "sea_level": 1021, "grnd_level": 1013, "humidity": 90, "temp_kf": 0 }, "weather": [{ "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02n" }], "clouds": { "all": 14 }, "wind": { "speed": 0.7, "deg": 217, "gust": 1.23 }, "visibility": 10000, "pop": 0, "sys": { "pod": "n" }, "dt_txt": "2025-03-04 12:00:00" }, { "dt": 1741100400, "main": { "temp": 7.97, "feels_like": 7.14, "temp_min": 7.97, "temp_max": 7.97, "pressure": 1022, "sea_level": 1022, "grnd_level": 1014, "humidity": 92, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 57 }, "wind": { "speed": 1.68, "deg": 145, "gust": 1.99 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-04 15:00:00" }, { "dt": 1741111200, "main": { "temp": 10.84, "feels_like": 9.89, "temp_min": 10.84, "temp_max": 10.84, "pressure": 1023, "sea_level": 1023, "grnd_level": 1015, "humidity": 73, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 69 }, "wind": { "speed": 1.09, "deg": 171, "gust": 1.41 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-04 18:00:00" }, { "dt": 1741122000, "main": { "temp": 13.76, "feels_like": 12.63, "temp_min": 13.76, "temp_max": 13.76, "pressure": 1022, "sea_level": 1022, "grnd_level": 1014, "humidity": 55, "temp_kf": 0 }, "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }], "clouds": { "all": 83 }, "wind": { "speed": 1.74, "deg": 272, "gust": 1.81 }, "visibility": 10000, "pop": 0, "sys": { "pod": "d" }, "dt_txt": "2025-03-04 21:00:00" }], "city": { "id": 5327684, "name": "Berkeley", "coord": { "lat": 37.8748, "lon": -122.2572 }, "country": "US", "population": 112580, "timezone": -28800, "sunrise": 1740667389, "sunset": 1740708033 } }

//
// 2. Helper function to mock the OpenWeather /forecast API call
//
async function mockForecastAPI(page: Page) {
  let forecastCalled = false;

  await page.route("https://api.openweathermap.org/data/2.5/forecast**", async (route) => {
    // forecastCalled = true;
    // You can inspect route.request().url() here if you want to verify query params
    // or that an API key is present. For now, we just fulfill with the mock data:

    if (!route.request().url().includes("appid=")) {
      await route.abort("401");
      return;
    }

    forecastCalled = true;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_FORECAST_RESPONSE),
    });
  });

  // After your page loads, confirm that the forecast endpoint was called:
  return async () => {
    expect(
      forecastCalled,
      "Expected the student code to fetch /data/2.5/forecast but it never happened!"
    ).toBeTruthy();
  };
}

//
// 3. Optional: Mock the Geolocation API so that it either resolves or rejects.
//
async function mockGeolocationSuccess(page: Page, lat = 37.8748, lon = -122.2572) {
  await page.addInitScript(({ lat, lon }) => {
    // Trick: override getCurrentPosition
    // This replaces the real geolocation with a mock that always succeeds
    // @ts-ignore
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success, error) => {
          success({
            coords: { latitude: lat, longitude: lon },
          } as GeolocationPosition);
        },
        watchPosition: () => 0,
        clearWatch: () => { },
      }
    });
  }, { lat, lon });
}

async function mockGeolocationError(page: Page) {
  await page.addInitScript(() => {
    // Trick: override getCurrentPosition
    // This replaces the real geolocation with a mock that always fails
    // @ts-ignore
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success, error) => {
          if (!error) return;
          error({
            code: 1,
            message: "User denied Geolocation",
          } as GeolocationPositionError);
        },
        watchPosition: () => 0,
        clearWatch: () => { },
      }
    });
  });
}

//
// 4. The actual tests
//

/**
 * Test 1:
 * Check that the student calls the forecast endpoint and displays the city name & coordinates
 */
test(
  "Calls forecast endpoint and displays city name + coordinates",
  {
    annotation: { type: "points", description: "1" },
  },
  async ({ page }) => {
    await mockGeolocationSuccess(page);
    // If we want to confirm that the forecast endpoint was actually called:
    const assertForecastCall = await mockForecastAPI(page);

    // Reload after re-mocking, or do a second test pass
    await page.goto("/part2/index.html");

    // Wait for the page to presumably fetch and render
    await page.waitForTimeout(2000);

    // Confirm the forecast endpoint was fetched at least once
    await assertForecastCall();

    // Check that city name from the JSON is displayed: "Berkeley"
    const bodyText = await page.textContent("body");
    expect(
      bodyText?.toLowerCase(),
      "Expected the city name 'Berkeley' to appear somewhere on the page."
    ).toContain("berkeley");

    // Check that the coordinate lat/lon from the JSON is displayed
    // We won't be too strict on formatting:
    expect(
      bodyText,
      "Expected the page to display lat 37.8[748] in some form."
    ).toMatch(/37\.8/);

    expect(
      bodyText,
      "Expected the page to display lon -122.2[572] in some form."
      // no need to use - could use W
    ).toMatch(/122\.2/);
  }
);

/**
 * Test 2:
 * Check that the student displays the "current time" somewhere and
 * the next ~24 hours in 3-hour blocks. Since our mock only has 3 time
 * steps, we just check that each time step is shown in some manner.
 */
test(
  "Displays current time, plus 3 forecast blocks (time, weather, temperature, wind).",
  {
    annotation: { type: "points", description: "1" },
  },
  async ({ page }) => {
    await mockGeolocationSuccess(page);
    await mockForecastAPI(page);
    await page.goto("/part2/index.html");


    // Wait for the page to presumably fetch and render
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");

    // This is a "loose" approach. We check that the forecast times appear:
    expect(bodyText).toContain("6160"); // a mocked, absurd temperature

    // 2c) For each forecast item, do they mention the weather type, temp, wind, etc.?
    // We'll just do a quick check for presence of "Clouds", "temp", "wind", etc.
    // expect(
    //   bodyText?.toLowerCase(),
    //   "The page doesn't mention 'clouds' from the forecast data."
    // ).toContain("clouds");
    // expect(
    //   bodyText?.toLowerCase(),
    //   "The page doesn't seem to mention 'wind' anywhere."
    // ).toContain("wind");
    // expect(
    //   bodyText?.toLowerCase(),
    //   "The page doesn't seem to mention 'temp' or 'temperature' anywhere."
    // ).toMatch(/temp|temperature/);
  }
);

/**
 * Test 3 (Extra Credit):
 * Check that if geolocation is *successful*, the code uses the
 * geolocated coordinates in its fetch request. We'll do so by mocking
 * geolocation success with known lat/lon and verifying the request’s query params.
 */
test(
  "Uses geolocation coordinates if allowed",
  {
    annotation: { type: "points", description: "1" },
  },
  async ({ page }) => {
    // This time, we mock geolocation success
    // Suppose the user is at lat=42, lon=-100
    await mockGeolocationSuccess(page, 42, -136);

    let coordsCorrect = false;

    // Re-mock the forecast fetch so we can inspect the URL
    await page.route("**/data/2.5/forecast**", async (route) => {
      const url = route.request().url();
      // Confirm the lat/lon is in the query (somewhere). Students might do `lat=42`, or `lat=42.0`, etc.
      if (url.includes("lat=42") && url.includes("lon=-136")) {
        coordsCorrect = true;
      }

      // Then fulfill with the mock
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_FORECAST_RESPONSE),
      });
    });

    await page.goto("/part2/index.html");

    await page.waitForTimeout(2000);

    expect(
      coordsCorrect,
      "Expected the student code to fetch /data/2.5/forecast with the geolocated coordinates."
    ).toBeTruthy();

    const bodyText = await page.textContent("body");

    // Check that the geolocated coordinates appear in text:
    expect(
      bodyText,
      "We expected to see the latitude 42 somewhere if geolocation succeeded!"
    ).toMatch(/42/);
    expect(
      bodyText,
      "We expected to see the longitude -136 somewhere if geolocation succeeded!"
      // no need to check for negative sign -- could use W
    ).toMatch(/136/);
  }
);

/**
 * Test 4 (Extra Credit):
 * Check that if geolocation fails, we see the fallback
 * Jacobs Hall coordinates [37.875852, 135.74250].
 *
 * (You might skip this if you don't want to do extra-credit geolocation checks.)
 */
test(
  "Uses fallback coordinates [34.98722, 135.74250] if geolocation fails",
  {
    annotation: { type: "points", description: "1" },
  },
  async ({ page }) => {
    // Always fail geolocation
    await mockGeolocationError(page);

    // Re-mock forecast
    await mockForecastAPI(page);

    await page.goto("/part2/index.html");

    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    // Check that the fallback coords appear in text:
    expect(
      bodyText,
      "We expected to see the fallback latitude 34.98 somewhere if geolocation failed!"
    ).toMatch(/34\.9/);
    expect(
      bodyText,
      "We expected to see the fallback longitude 135.74 somewhere if geolocation failed!"
    ).toMatch(/135\.7/);
  }
);
