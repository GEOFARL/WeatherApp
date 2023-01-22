import './template.html';
import './sass/main.scss';
import { extractDataNow, extractDataForecast } from './modules/extractData';

async function retrieveWeatherData(location) {
  try {
    const [responseForecast, responseToday] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=7e04eae5282a183a5918c0d10f2829de`),
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=7e04eae5282a183a5918c0d10f2829de`),
    ]);
    const [jsonF, jsonN] = await Promise.all([
      responseForecast.json(),
      responseToday.json(),
    ]);
    const today = extractDataNow(jsonN);
    const forecast = extractDataForecast(jsonF);
    console.log(today);
    console.log(forecast);
    document.querySelector('img').src = today.icon;
  } catch (err) {
    console.log(err);
  }
}

retrieveWeatherData('Kyiv');
