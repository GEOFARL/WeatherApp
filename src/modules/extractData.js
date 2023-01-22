import {
  format,
  isWithinInterval,
} from 'date-fns';

import lightning from '../assets/images/lightning.svg';
import raining from '../assets/images/rainy.svg';
import snowing from '../assets/images/snow.svg';
import mist from '../assets/images/mist.svg';
import sunny from '../assets/images/sun.svg';
import moon from '../assets/images/moon.svg';
import cloud from '../assets/images/cloud.svg';
import cloudy from '../assets/images/cloudy.svg';
import cloudyDay from '../assets/images/cloudy-day.svg';
import cloudyNight from '../assets/images/cloudy-night.svg';

function getUTCDate(seconds, timeShift) {
  const date = new Date((seconds + timeShift) * 1000);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

function defineIcon(id, date, cloudiness) {
  const hours = date.getHours();
  switch (true) {
    case (id >= 200 && id < 233):
      return lightning;
    case (id >= 300 && id < 321):
      return raining;
    case (id >= 500 && id < 532):
      return (id === 511) ? snowing : raining;
    case (id >= 600 && id < 623):
      return snowing;
    case (id >= 701 && id < 782):
      return mist;
    case (id === 800):
      return (hours > 19 || hours < 7) ? moon : sunny;
    case (id >= 801 && id < 805):
      if (hours > 19 || hours < 7) {
        return cloudyNight;
      }
      if (cloudiness <= 25) {
        return cloud;
      }
      if (cloudiness <= 75) {
        return cloudyDay;
      }
      return cloudy;
    default:
      throw new Error('Not found');
  }
}

function extractDataNow({
  clouds: { all: cloudiness },
  dt,
  main: {
    temp,
    feels_like,
    pressure,
    humidity,
  },
  name,
  sys: { sunrise, sunset },
  wind: { deg, gust, speed },
  rain,
  snow,
  weather: [{ id }],
  timezone,
}) {
  return {
    cloudiness,
    date: format(getUTCDate(dt, timezone), 'kk:mm - cccc, d MMM'),
    temperature: Math.round(temp),
    feelsLike: Math.round(feels_like),
    pressure: pressure * 100,
    humidity,
    sunrise: format(getUTCDate(sunrise, timezone), 'kk:mm:ss'),
    sunset: format(getUTCDate(sunset, timezone), 'kk:mm:ss'),
    city: name,
    windDeg: deg,
    windGust: gust,
    windSpeed: speed,
    rain: rain?.['3h'] ?? null,
    snow: snow?.['3h'] ?? null,
    icon: defineIcon(id, getUTCDate(dt, timezone), cloudiness),
  };
}

function extractDataForecast({ list, city: { timezone } }) {
  const today = list
    .filter((item) => {
      const date = getUTCDate(item.dt, timezone);
      const start = getUTCDate(Date.now() / 1000, timezone);
      const end = getUTCDate(Date.now() / 1000 + 24 * 60 * 60, timezone);
      return isWithinInterval(date, { start, end });
    })
    .map((item) => ({
      time: format(getUTCDate(item.dt, timezone), 'h:mm a..aa').slice(0, -4),
      icon: defineIcon(item.weather[0].id, getUTCDate(item.dt, timezone), item.clouds.all),
      temperature: Math.round(item.main.temp),
    }));

  const days = list.reduce((acc, item) => {
    const date = getUTCDate(item.dt, timezone);
    if (date.getDate() === getUTCDate(Date.now() / 1000, timezone).getDate()) {
      acc[0].push(item);
    } else if (
      date.getDate() === getUTCDate(Date.now() / 1000, timezone).getDate() + 1
      && acc[1].length === 0
    ) {
      acc[1].push(item);
    } else if (acc[1].length) {
      const index = Math.floor((list.indexOf(item) - list.indexOf(acc[1][0])) / 8) + 1;
      acc[index] = acc[index] || [];
      acc[index].push(item);
    }
    return acc;
  }, [...Array(5)].map(() => []))
    .slice(0, -1);
  const forecast = days.map((day, index) => {
    let id;
    let dayOfWeek = format(getUTCDate(day[0].dt, timezone), 'EEEE');
    if (index === 0) {
      dayOfWeek = 'Today';
      if (day.length < 5) {
        id = day[0].weather[0].id;
      } else {
        id = day[Math.floor(Math.floor(day.length / 2))].weather[0].id;
      }
    } else {
      id = day[4].weather[0].id;
    }
    const minMax = day.reduce((acc, hour) => {
      acc.minTemp = Math.min(acc.minTemp, hour.main.temp);
      acc.maxTemp = Math.max(acc.maxTemp, hour.main.temp);
      return acc;
    }, { maxTemp: Number.MIN_VALUE, minTemp: Number.MAX_VALUE });
    return {
      dayOfWeek,
      icon: defineIcon(
        id,
        getUTCDate(day[Math.floor(day.length / 2)].dt, timezone),
        day[Math.floor(day.length / 2)].clouds.all,
      ),
      minTemp: Math.round(minMax.minTemp),
      maxTemp: Math.round(minMax.maxTemp),
    };
  });
  return {
    today,
    forecast,
  };
}

export { extractDataNow, extractDataForecast };
