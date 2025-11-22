import { WEATHER_LOCATIONS, type LocationKey } from "./weather-config"

// WMO Weather interpretation codes with day/night variants
const WEATHER_CODE_MAP: Record<number, { condition: string; dayIcon: string; nightIcon: string }> = {
  0: { condition: "Clear sky", dayIcon: "☀️", nightIcon: "🌙" },
  1: { condition: "Mainly clear", dayIcon: "🌤️", nightIcon: "🌙" },
  2: { condition: "Partly cloudy", dayIcon: "⛅", nightIcon: "☁️" },
  3: { condition: "Overcast", dayIcon: "☁️", nightIcon: "☁️" },
  45: { condition: "Fog", dayIcon: "🌫️", nightIcon: "🌫️" },
  48: { condition: "Depositing rime fog", dayIcon: "🌫️", nightIcon: "🌫️" },
  51: { condition: "Light drizzle", dayIcon: "🌦️", nightIcon: "🌧️" },
  53: { condition: "Moderate drizzle", dayIcon: "🌦️", nightIcon: "🌧️" },
  55: { condition: "Dense drizzle", dayIcon: "🌧️", nightIcon: "🌧️" },
  56: { condition: "Light freezing drizzle", dayIcon: "🌨️", nightIcon: "🌨️" },
  57: { condition: "Dense freezing drizzle", dayIcon: "🌨️", nightIcon: "🌨️" },
  61: { condition: "Slight rain", dayIcon: "🌧️", nightIcon: "🌧️" },
  63: { condition: "Moderate rain", dayIcon: "🌧️", nightIcon: "🌧️" },
  65: { condition: "Heavy rain", dayIcon: "🌧️", nightIcon: "🌧️" },
  66: { condition: "Light freezing rain", dayIcon: "🌨️", nightIcon: "🌨️" },
  67: { condition: "Heavy freezing rain", dayIcon: "🌨️", nightIcon: "🌨️" },
  71: { condition: "Slight snow fall", dayIcon: "🌨️", nightIcon: "🌨️" },
  73: { condition: "Moderate snow fall", dayIcon: "❄️", nightIcon: "❄️" },
  75: { condition: "Heavy snow fall", dayIcon: "❄️", nightIcon: "❄️" },
  77: { condition: "Snow grains", dayIcon: "🌨️", nightIcon: "🌨️" },
  80: { condition: "Slight rain showers", dayIcon: "🌦️", nightIcon: "🌧️" },
  81: { condition: "Moderate rain showers", dayIcon: "🌧️", nightIcon: "🌧️" },
  82: { condition: "Violent rain showers", dayIcon: "⛈️", nightIcon: "⛈️" },
  85: { condition: "Slight snow showers", dayIcon: "🌨️", nightIcon: "🌨️" },
  86: { condition: "Heavy snow showers", dayIcon: "❄️", nightIcon: "❄️" },
  95: { condition: "Thunderstorm", dayIcon: "⛈️", nightIcon: "⛈️" },
  96: { condition: "Thunderstorm with slight hail", dayIcon: "⛈️", nightIcon: "⛈️" },
  99: { condition: "Thunderstorm with heavy hail", dayIcon: "⛈️", nightIcon: "⛈️" },
}

interface OpenMeteoResponse {
  latitude: number
  longitude: number
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    apparent_temperature: number[]
    precipitation_probability: number[]
    precipitation: number[]
    weather_code: number[]
    wind_speed_10m: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    apparent_temperature_max: number[]
    precipitation_probability_max: number[]
    precipitation_sum: number[]
    sunrise: string[]
    sunset: string[]
  }
}

export interface WeatherData {
  location: string
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
    pressure: number
    feelsLike: number
    icon: string
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    icon: string
    precipitation: number
    precipitationAmount: number
  }>
  hourly: Array<{
    time: string
    temperature: number
    feelsLike: number
    condition: string
    icon: string
    precipitation: number
  }>
}

function getWeatherInfo(code: number, isNightTime = false) {
  const weatherData = WEATHER_CODE_MAP[code] || { condition: "Unknown", dayIcon: "❓", nightIcon: "❓" }
  return {
    condition: weatherData.condition,
    icon: isNightTime ? weatherData.nightIcon : weatherData.dayIcon,
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  })
}

function formatDayName(dateString: string, index: number): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (index === 0) return "Today"
  if (index === 1) return "Tomorrow"

  return date.toLocaleDateString("en-US", { weekday: "long" })
}

function isNightTime(timeString: string, sunrise: string, sunset: string): boolean {
  const time = new Date(timeString)
  const sunriseTime = new Date(sunrise)
  const sunsetTime = new Date(sunset)

  return time < sunriseTime || time > sunsetTime
}

export async function fetchWeatherData(locationKey: LocationKey): Promise<WeatherData> {
  const location = WEATHER_LOCATIONS[locationKey]

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,precipitation_sum,sunrise,sunset&timezone=America%2FNew_York&forecast_days=14`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`)
  }

  const data: OpenMeteoResponse = await response.json()

  // Get current hour index
  const now = new Date()
  const currentHourIndex = data.hourly.time.findIndex((time) => {
    const timeDate = new Date(time)
    return timeDate.getHours() === now.getHours() && timeDate.toDateString() === now.toDateString()
  })

  const safeCurrentIndex = Math.max(0, currentHourIndex)

  // Transform hourly data (next 12 hours)
  const hourly = data.hourly.time.slice(safeCurrentIndex, safeCurrentIndex + 12).map((time, index) => {
    const actualIndex = safeCurrentIndex + index

    const hourDate = new Date(time)
    const dayIndex = data.daily.time.findIndex((dayTime) => {
      const day = new Date(dayTime)
      return day.toDateString() === hourDate.toDateString()
    })

    const safeDayIndex = Math.max(0, Math.min(dayIndex, data.daily.sunrise.length - 1))
    const isNight = isNightTime(time, data.daily.sunrise[safeDayIndex], data.daily.sunset[safeDayIndex])
    const weatherInfo = getWeatherInfo(data.hourly.weather_code[actualIndex], isNight)

    return {
      time: formatTime(time),
      temperature: Math.round(data.hourly.temperature_2m[actualIndex]),
      feelsLike: Math.round(data.hourly.apparent_temperature[actualIndex]),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      precipitation: data.hourly.precipitation_probability[actualIndex],
    }
  })

  // Transform daily data
  const forecast = data.daily.time.map((date, index) => {
    const weatherInfo = getWeatherInfo(data.daily.weather_code[index], false)

    return {
      date,
      day: formatDayName(date, index),
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      precipitation: data.daily.precipitation_probability_max[index],
      precipitationAmount: Math.round(data.daily.precipitation_sum[index] * 10) / 10,
    }
  })

  const currentTime = data.hourly.time[safeCurrentIndex]
  const currentDayIndex = data.daily.time.findIndex((dayTime) => {
    const day = new Date(dayTime)
    const current = new Date(currentTime)
    return day.toDateString() === current.toDateString()
  })

  const safeCurrentDayIndex = Math.max(0, Math.min(currentDayIndex, data.daily.sunrise.length - 1))
  const isCurrentNight = isNightTime(
    currentTime,
    data.daily.sunrise[safeCurrentDayIndex],
    data.daily.sunset[safeCurrentDayIndex],
  )
  const currentWeatherInfo = getWeatherInfo(data.hourly.weather_code[safeCurrentIndex], isCurrentNight)

  return {
    location: location.name,
    current: {
      temperature: Math.round(data.hourly.temperature_2m[safeCurrentIndex]),
      condition: currentWeatherInfo.condition,
      humidity: data.hourly.relative_humidity_2m[safeCurrentIndex],
      windSpeed: Math.round(data.hourly.wind_speed_10m[safeCurrentIndex]),
      visibility: 16, // Open-Meteo doesn't provide visibility, using default
      pressure: 1013, // Open-Meteo doesn't provide pressure in free tier, using default
      feelsLike: Math.round(data.hourly.apparent_temperature[safeCurrentIndex]),
      icon: currentWeatherInfo.icon,
    },
    forecast,
    hourly,
  }
}
