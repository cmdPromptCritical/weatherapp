"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, MapPin, Thermometer, Droplets, Wind, Eye, Gauge } from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"
import type { LocationKey } from "@/lib/weather-config"

export function WeatherDashboard({
  weatherData,
  currentLocation,
}: {
  weatherData: WeatherData
  currentLocation: LocationKey
}) {
  const router = useRouter()

  const switchLocation = (location: LocationKey) => {
    router.push(`/?location=${location}`)
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const getBackgroundImage = (location: LocationKey) => {
    return location === "bowmanville" ? "/images/ontario-street.png" : "/images/lindsay-dairy.png"
  }

  if (!weatherData) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">☀️</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {weatherData.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => switchLocation("bowmanville")}
            variant={currentLocation === "bowmanville" ? "default" : "outline"}
            size="sm"
          >
            Bowmanville
          </Button>
          <Button
            onClick={() => switchLocation("lindsey")}
            variant={currentLocation === "lindsey" ? "default" : "outline"}
            size="sm"
          >
            Lindsey
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Weather */}
      <Card className="relative overflow-hidden border-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${getBackgroundImage(currentLocation)}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <CardContent className="relative p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-6xl">{weatherData.current.icon}</span>
                <div>
                  <div className="text-5xl font-bold">{weatherData.current.temperature}°C</div>
                  <div className="text-xl opacity-90">{weatherData.current.condition}</div>
                  <div className="text-sm opacity-75">Feels like {weatherData.current.feelsLike}°C</div>
                  <div className="text-sm opacity-75 mt-1">
                    P.O.P. {weatherData.forecast[0].precipitation}% • H: {weatherData.forecast[0].high}°C L:{" "}
                    {weatherData.forecast[0].low}°C
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Last updated</div>
              <div className="text-sm">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{weatherData.current.feelsLike}°C</div>
            <div className="text-sm text-muted-foreground">Feels Like</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{weatherData.current.humidity}%</div>
            <div className="text-sm text-muted-foreground">Humidity</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Wind className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <div className="text-2xl font-bold">{weatherData.current.windSpeed}</div>
            <div className="text-sm text-muted-foreground">km/h</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{weatherData.current.visibility}</div>
            <div className="text-sm text-muted-foreground">km</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{weatherData.current.pressure}</div>
            <div className="text-sm text-muted-foreground">hPa</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{weatherData.forecast[0].precipitation}%</div>
            <div className="text-sm text-muted-foreground">Rain</div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {weatherData.hourly.map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center p-3 rounded-lg bg-muted/50 min-w-[100px]">
                <div className="text-sm font-medium mb-1">{hour.time}</div>
                <div className="text-2xl my-2">{hour.icon}</div>
                <div className="text-lg font-bold">{hour.temperature}°</div>
                <div className="text-sm text-muted-foreground">Feels {hour.feelsLike}°</div>
                {hour.precipitation > 30 && (
                  <div className="text-xs text-blue-500 mt-1 flex items-center justify-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {hour.precipitation}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 14-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">{day.icon}</div>
                  <div>
                    <div className="font-medium">{day.day}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • {day.condition}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    {day.precipitation > 30 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Droplets className="h-3 w-3" />
                        {day.precipitation}%
                      </Badge>
                    )}
                    {day.precipitationAmount > 0 && (
                      <div className="text-xs text-blue-600 font-medium">{day.precipitationAmount}mm</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{day.high}°</div>
                    <div className="text-sm text-muted-foreground">{day.low}°</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
