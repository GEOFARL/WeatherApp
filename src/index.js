import './template.html';
import './sass/main.scss';
import { extractDataNow, extractDataForecast } from './modules/extractData';

const searchInput = document.querySelector('.find-region__input');
const errorMessage = document.querySelector('.find-region__error-message');

function loadWeatherDetails({
  cloudiness,
  feelsLike,
  humidity,
  pressure,
  sunrise,
  sunset,
  windSpeed,
}) {
  const [
    cloudyEl,
    feelsLikeEl,
    humidityEl,
    pressureEl,
    sunriseEl,
    sunsetEl,
    windSpeedEl,
  ] = [...document.querySelectorAll('.weather-details__row__data')];
  cloudyEl.innerHTML = `${cloudiness}%`;
  feelsLikeEl.innerHTML = `${feelsLike}&deg;C`;
  humidityEl.innerHTML = `${humidity}%`;
  pressureEl.innerHTML = `${pressure} Pa`;
  sunriseEl.innerHTML = `${sunrise}`;
  sunsetEl.innerHTML = `${sunset}`;
  windSpeedEl.innerHTML = `${windSpeed} m/s`;
}

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
  return {
    today,
    forecast,
  };
}

async function loadWebsite(location) {
  try {
    const response = await retrieveWeatherData(location);
    loadCurrentWeather(response.today);
    loadForecastToday(response.forecast);
    loadWeatherDetails(response.today);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function handleErrorMessage(isLoaded) {
  if (!isLoaded) {
    if (!searchInput.classList.contains('find-region__input--invalid')) {
      searchInput.classList.add('find-region__input--invalid');
    }
    if (errorMessage.classList.contains('find-region__error-message--hidden')) {
      errorMessage.classList.remove('find-region__error-message--hidden');
    }
  } else if (searchInput.classList.contains('find-region__input--invalid')
    && !errorMessage.classList.contains('find-region__error-message--hidden')) {
    searchInput.classList.remove('find-region__input--invalid');
    errorMessage.classList.add('find-region__error-message--hidden');
  }
}

searchInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const isLoaded = await loadWebsite(searchInput.value);
    handleErrorMessage(isLoaded);
  }
});

searchInput.addEventListener('blur', async () => {
  const isLoaded = await loadWebsite(searchInput.value);
  handleErrorMessage(isLoaded);
});

loadWebsite('Kyiv');
