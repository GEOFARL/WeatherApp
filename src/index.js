import './template.html';
import './sass/main.scss';
import { extractDataNow, extractDataForecast } from './modules/extractData';

function loadCurrentWeather(data) {
  const currentTemp = document.querySelector('.current-weather__temperature');
  const currentCity = document.querySelector('.current-weather__info-box__city');
  const currentDate = document.querySelector('.current-weather__info-box__date');
  const currentIcon = document.querySelector('.current-weather__icon');

  currentTemp.innerHTML = `${data.temperature}&deg;`;
  currentCity.innerHTML = data.city;
  currentDate.innerHTML = data.date;
  currentIcon.src = data.icon;
}

function loadForecastToday(forecast) {
  const todayCards = [...document.querySelectorAll('.today-forecast__card')];
  todayCards.forEach((card, index) => {
    const time = card.querySelector('.today-forecast__card__time');
    const icon = card.querySelector('.today-forecast__card__icon');
    const temp = card.querySelector('.today-forecast__card__temperature');
    const data = forecast.today[index];

    time.innerText = data.time;
    icon.src = data.icon;
    temp.innerHTML = `${data.temperature}&deg;C`;
  });
}

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

    loadCurrentWeather(today);
    loadForecastToday(forecast);

    console.log(today);
    console.log(forecast);
    document.querySelector('img').src = today.icon;
  } catch (err) {
    console.log(err);
  }
}

retrieveWeatherData('California');
